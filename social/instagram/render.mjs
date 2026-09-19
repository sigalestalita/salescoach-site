/* Renderiza cada post .html em PNG 1080×1350 (4:5 do Instagram).
   Uso: node render.mjs            → renderiza todos
        node render.mjs 01 03      → só os posts cujo nome começa assim   */
import { readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* Playwright costuma estar instalado global (npm i -g playwright), e o
   import ESM não olha o NODE_PATH — então procuramos a raiz global na mão.
   O repositório continua sem dependências próprias. */
const { chromium } = await (async () => {
  try { return await import('playwright'); } catch {}
  const { execSync } = await import('node:child_process');
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return import(pathToFileURL(resolve(root, 'playwright/index.mjs')).href);
})();

const here = dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const pages = readdirSync(here)
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .filter((f) => !only.length || only.some((p) => f.startsWith(p)))
  .sort();

mkdirSync(resolve(here, 'out'), { recursive: true });
const browser = await chromium.launch();
/* deviceScaleFactor 1: o quadro já é 1080×1350, o tamanho que o Instagram quer. */
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

for (const file of pages) {
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(resolve(here, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  /* O quadro é fixo, então estouro de altura vira corte silencioso no PNG:
     melhor gritar aqui do que descobrir com o post publicado. */
  const over = await page.evaluate(() => {
    const el = document.querySelector('.post');
    return el.scrollHeight - el.clientHeight;
  });
  if (over > 1) console.warn(`  ⚠  ${file}: conteúdo estoura ${over}px do quadro`);

  const out = resolve(here, 'out', file.replace(/\.html$/, '.png'));
  await page.locator('.post').screenshot({ path: out });
  await page.close();
  console.log('✓', out.replace(here + '/', ''));
}

await browser.close();
