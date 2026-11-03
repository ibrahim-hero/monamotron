import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../skill/monamotron/scripts/lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function createSocialPreview() {
  const fontDir = resolve(root, 'skill/monamotron/assets/fonts');
  const manifest = JSON.parse(await readFile(resolve(fontDir, 'sources.json'), 'utf8'));
  const fonts = manifest.files.filter((f) => f.family === 'Nunito' || f.file.includes('a88b72a24fb54c9f94e3b5fdaa7481c9'));
  let fontCSS = '';
  for (const font of fonts) {
    const bytes = await readFile(resolve(fontDir, font.file));
    if (bytes.subarray(0, 4).toString() !== 'wOF2') throw new Error(`Invalid font: ${font.file}`);
    fontCSS += `@font-face{font-family:'${font.family}';font-weight:${font.weight};src:url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2');}`;
  }
  const notices = await readFile(resolve(fontDir, 'NOTICES.txt'), 'utf8');
  const inputY = [198, 246, 294];
  const hiddenY = [181, 229, 277, 325];
  const wires = [];
  for (const y of inputY) for (const [j, nextY] of hiddenY.entries()) {
    wires.push(`<path d="M885 ${y} C932 ${y} 951 ${nextY} 996 ${nextY}" stroke="${j % 2 ? '#e5cb7c' : '#a6ccb6'}" stroke-width="1.8" opacity="0.7" fill="none"/>`);
  }
  for (const y of hiddenY) wires.push(`<path d="M1020 ${y} C1080 ${y} 1090 246 1130 246" stroke="#a6ccb6" stroke-width="2" fill="none"/>`);
  const nodes = [
    ...inputY.map((y) => `<circle cx="875" cy="${y}" r="10" fill="#17352f" stroke="#f6f3e7" stroke-width="2.5"/>`),
    ...hiddenY.map((y, j) => `<circle cx="1008" cy="${y}" r="12" fill="${j % 2 ? '#23453c' : '#a6ccb6'}" stroke="#f6f3e7" stroke-width="2.5"/>`),
    '<circle cx="1152" cy="246" r="21" fill="#e5cb7c"/>',
    '<path d="M1143 246 L1150 253 L1163 237" fill="none" stroke="#17352f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640" role="img" aria-label="Monamotron: your AI explains ideas by drawing them">
<metadata>${escape(notices)}</metadata>
<style>${fontCSS} text{font-family:Nunito,sans-serif;font-weight:500;fill:#f6f3e7}.hand{font-family:Excalifont,sans-serif;font-weight:400}</style>
<defs><pattern id="grain" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.8" fill="#f6f3e7" opacity="0.045"/></pattern></defs>
<rect width="1280" height="640" fill="#17352f"/><rect width="1280" height="640" fill="url(#grain)"/>
<rect x="20" y="20" width="1240" height="600" rx="15" fill="none" stroke="#406157"/>
<path d="M79 51 Q81 63 95 66 Q83 70 81 84 Q77 71 64 68 Q77 64 79 51Z" fill="none" stroke="#e5cb7c" stroke-width="2"/>
<text x="111" y="75" font-size="17" style="fill:#a6ccb6;letter-spacing:2px">PORTABLE AI SKILL</text>
<text x="64" y="203" class="hand" font-size="92">Monamotron</text>
<text x="67" y="284" font-size="40">Your AI explains ideas</text>
<text x="67" y="336" font-size="40">by drawing them.</text>
<text x="68" y="402" font-size="25" style="fill:#c2d5cc">Code-drawn lessons. Animated arrows.</text>
<text x="68" y="439" font-size="25" style="fill:#c2d5cc">Images, video, and editable source.</text>
<rect x="65" y="493" width="631" height="55" rx="10" fill="#23453c" stroke="#406157"/>
<text x="84" y="528" font-size="24">OpenCode / Claude Code / agent skills</text>
<rect x="820" y="119" width="395" height="306" rx="12" fill="#1b3c34" stroke="#406157"/>
<text x="847" y="155" font-size="14" style="fill:#c2d5cc;letter-spacing:1px">CONNECTED VISUAL THINKING</text>
${wires.join('')}${nodes.join('')}
<text x="847" y="391" class="hand" font-size="27" style="fill:#a6ccb6">Draw. Connect. Explain.</text>
<path d="M849 459 Q1010 476 1183 454" fill="none" stroke="#e5cb7c" stroke-width="3" stroke-linecap="round"/>
<text x="857" y="502" class="hand" font-size="29" style="fill:#e5cb7c">One idea at a time.</text>
<text x="68" y="595" font-size="20" style="fill:#c2d5cc">OPEN SOURCE / MIT</text>
</svg>`;
  const media = resolve(root, 'docs/media');
  await writeFile(resolve(media, 'social-preview.svg'), svg);
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
    await page.setContent(`<style>html,body{margin:0;width:1280px;height:640px;overflow:hidden}svg{display:block}</style>${svg}`);
    await page.evaluate(async () => {
      for (const font of ['400 92px Excalifont', '500 40px Nunito']) {
        if (!(await document.fonts.load(font, 'Monamotron visual lessons')).length) throw new Error(`Font failed: ${font}`);
      }
      await document.fonts.ready;
      for (const text of document.querySelectorAll('svg text')) {
        const box = text.getBBox();
        if (box.x < 24 || box.y < 24 || box.x + box.width > 1256 || box.y + box.height > 616) throw new Error(`Social-preview text overflow: ${text.textContent}`);
      }
    });
    await page.screenshot({ path: resolve(media, 'social-preview.png') });
  } finally { await browser.close(); }
  console.log('Created branded 1280×640 Monamotron social preview, with editable SVG and embedded fonts.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await createSocialPreview();
