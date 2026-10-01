/* Renderiza um post animado em MP4 1080×1350 para o feed.
   Uso: node anima.mjs 42            → um post
        node anima.mjs 42 --gif      → também gera um GIF de prévia

   As animações não são gravadas em tempo real: cada quadro é desenhado com
   o relógio parado numa posição exata. Gravação em tempo real perde quadro
   quando a máquina engasga e o laço nunca fecha certo; aqui o quadro N é
   sempre idêntico, e o último encosta no primeiro. */
import { readdirSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, execSync } from 'node:child_process';

const { chromium } = await (async () => {
  try { return await import('playwright'); } catch {}
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return import(pathToFileURL(resolve(root, 'playwright/index.mjs')).href);
})();

const here = dirname(fileURLToPath(import.meta.url));
const FFMPEG = process.env.FFMPEG || resolve(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'ffmpeg-static/ffmpeg');

/* O ciclo de 3,6 s é o que todas as animações do post fecham junto: o
   tracejado anda 3 voltas, o pulso percorre o fio uma vez, o anel e a
   varredura do núcleo dão uma volta cada. */
const CICLO = 3.6;
const FPS = 30;
const REPETE = 3; // 10,8 s de vídeo — o feed corta laço curto demais

const args = process.argv.slice(2);
const gif = args.includes('--gif');
const alvos = args.filter((a) => !a.startsWith('--'));
const pages = readdirSync(here)
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .filter((f) => alvos.some((p) => f.startsWith(p)))
  .sort();

if (!pages.length) { console.error('nenhum post casou com', alvos.join(' ')); process.exit(1); }

mkdirSync(resolve(here, 'out'), { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const file of pages) {
  const quadros = resolve(here, 'out', '.quadros');
  rmSync(quadros, { recursive: true, force: true });
  mkdirSync(quadros, { recursive: true });

  const page = await ctx.newPage();
  await page.goto(pathToFileURL(resolve(here, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  /* Para o relógio: SMIL pelo próprio SVG, CSS pela Web Animations API. */
  await page.evaluate(() => {
    document.querySelectorAll('svg').forEach((s) => s.pauseAnimations?.());
    document.getAnimations().forEach((a) => a.pause());
  });

  const total = Math.round(CICLO * FPS);
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    await page.evaluate((t) => {
      document.querySelectorAll('svg').forEach((s) => s.setCurrentTime?.(t));
      document.getAnimations().forEach((a) => { a.currentTime = t * 1000; });
    }, t);
    await page.locator('.post').screenshot({ path: resolve(quadros, `q-${String(i).padStart(4, '0')}.png`) });
  }
  await page.close();

  const base = file.replace(/\.html$/, '');
  const mp4 = resolve(here, 'out', `${base}.mp4`);

  /* yuv420p e High profile: é o que os aplicativos aceitam sem reprocessar.
     A faixa de áudio muda é seguro extra — alguns uploads recusam vídeo mudo. */
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error',
    '-stream_loop', String(REPETE - 1), '-framerate', String(FPS), '-i', resolve(quadros, 'q-%04d.png'),
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-shortest',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
    '-movflags', '+faststart', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '64k',
    mp4,
  ]);
  console.log('✓', mp4.replace(here + '/', ''));

  if (gif) {
    const paleta = resolve(quadros, 'paleta.png');
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', mp4, '-vf', 'fps=15,scale=540:-1:flags=lanczos,palettegen', paleta]);
    const saida = resolve(here, 'out', `${base}.gif`);
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', mp4, '-i', paleta,
      '-lavfi', 'fps=15,scale=540:-1:flags=lanczos[x];[x][1:v]paletteuse', '-t', String(CICLO), saida]);
    console.log('✓', saida.replace(here + '/', ''));
  }

  rmSync(quadros, { recursive: true, force: true });
}

await browser.close();
