/* Renderiza capas e stories dos destaques em PNG 1080 × 1920.
   Uso: node stories.mjs           → todos
        node stories.mjs c d3      → só os que começam assim            */
import { readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const { chromium } = await (async () => {
  try { return await import('playwright'); } catch {}
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return import(pathToFileURL(resolve(root, 'playwright/index.mjs')).href);
})();

const here = dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const pages = readdirSync(here)
  .filter((f) => /^(c\d|d\d)-.*\.html$/.test(f))
  .filter((f) => !only.length || only.some((p) => f.startsWith(p)))
  .sort();

mkdirSync(resolve(here, 'out'), { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });

for (const file of pages) {
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(resolve(here, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

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
