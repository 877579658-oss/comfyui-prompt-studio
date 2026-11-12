import { chromium } from 'file:///C:/Users/Administrator/.dsh/profiles/desktop/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = 'D:/Codex/ComfyUI-Prompt-Studio';
const phase = process.argv[2] || 'before';
const outDir = path.join(root, 'docs', 'ux-audit', phase);
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const sizes = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
];
const report = { phase, generatedAt: new Date().toISOString(), sizes: [] };
for (const size of sizes) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(String(err)));
  await page.goto('http://127.0.0.1:4317/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1100);
  await page.locator('#quickViewTab').click();
  await page.waitForTimeout(250);
  const quickMetrics = await page.evaluate(() => {
    const rect = s => { const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),display:cs.display,overflowX:cs.overflowX,overflowY:cs.overflowY}; };
    return {
      viewport:{w:innerWidth,h:innerHeight},
      doc:{w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight},
      bodyClass:document.body.className,
      main:rect('.main-grid'), rail:rect('.side-rail'), workspace:rect('.workspace'), output:rect('.output-panel'),
      command:rect('.command-bar'), quickApply:rect('#quickApplyBar'), reveal:rect('#revealQuickPanel'),
      horizontalOverflow:document.documentElement.scrollWidth > innerWidth,
      verticalOverflow:document.documentElement.scrollHeight > innerHeight,
    };
  });
  await page.screenshot({ path:path.join(outDir, `${size.name}-quick.png`), fullPage:true });
  await page.locator('#detailViewTab').click();
  await page.waitForTimeout(250);
  const detailMetrics = await page.evaluate(() => {
    const rect = s => { const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),display:cs.display,overflowX:cs.overflowX,overflowY:cs.overflowY}; };
    return {
      bodyClass:document.body.className,
      doc:{w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight},
      main:rect('.main-grid'), workspace:rect('.workspace'), output:rect('.output-panel'), activeCard:rect('.form-card.is-active'), detailApply:rect('#detailApplyBar'),
      horizontalOverflow:document.documentElement.scrollWidth > innerWidth,
      verticalOverflow:document.documentElement.scrollHeight > innerHeight,
    };
  });
  await page.screenshot({ path:path.join(outDir, `${size.name}-detail.png`), fullPage:true });
  report.sizes.push({ size, quickMetrics, detailMetrics, consoleErrors });
  await context.close();
}
await browser.close();
await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));

