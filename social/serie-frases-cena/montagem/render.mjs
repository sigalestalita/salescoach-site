// Monta a capa: node montagem/render.mjs  →  fotos/nx-n1.jpg (1792×2240), depois node render.mjs nx-n1
import { chromium } from '/home/user/salescoach-grou/node_modules/playwright/index.mjs';
import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1792, height: 2240 } });
await p.goto('file://' + path.join(aqui, 'nx-n1.html')); await p.waitForTimeout(500);
await p.screenshot({ path: path.join(aqui, '..', 'fotos', 'nx-n1.jpg'), type: 'jpeg', quality: 93 });
await b.close(); console.log('ok');
