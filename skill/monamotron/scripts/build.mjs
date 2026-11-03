import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateStory } from '../assets/core.mjs';
import { parseArgs, scriptSafeJSON, escapeHTML, exists } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mimeTypes = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.webm': 'video/webm', '.mp4': 'video/mp4', '.ogg': 'video/ogg' };

function verifyFont(bytes, item) {
  if (bytes.subarray(0, 4).toString() !== 'wOF2') throw new Error(`${item.file} is not a WOFF2 font.`);
  const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (hash !== item.gitBlob) throw new Error(`${item.file} differs from the documented upstream font. Inspect the source before updating its hash.`);
  return hash;
}

async function fontCSS(offline) {
  const manifest = JSON.parse(await readFile(resolve(root, 'assets/fonts/sources.json'), 'utf8'));
  const cache = [];
  let css = '';
  for (const item of manifest.files) {
    const path = resolve(root, 'assets/fonts', item.file);
    let bytes;
    if (await exists(path)) bytes = await readFile(path);
    else {
      if (offline) throw new Error(`Offline build needs cached font: ${item.file}. Run one online build or supply the unchanged upstream file.`);
      const response = await fetch(new URL(item.upstream, manifest.baseURL), { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`Font download failed (${response.status}): ${item.file}`);
      bytes = Buffer.from(await response.arrayBuffer());
      verifyFont(bytes, item);
      await writeFile(path, bytes);
      console.log(`Cached ${item.family}: ${item.file}`);
    }
    const gitBlob = verifyFont(bytes, item);
    cache.push({ file: item.file, gitBlob, bytes: bytes.length });
    css += `@font-face{font-family:'${item.family}';font-style:normal;font-weight:${item.weight};font-display:block;src:url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2');${item.range ? `unicode-range:${item.range};` : ''}}\n`;
  }
  await writeFile(resolve(root, 'assets/fonts/font-cache.json'), JSON.stringify(cache, null, 2));
  return css;
}

async function embedAsset(value, sceneDir, { video = false } = {}) {
  if (/^data:/i.test(value)) {
    if (!(video ? /^data:video\/(webm|mp4|ogg);base64,/i : /^data:image\/(svg\+xml|png|jpeg|webp|gif);base64,/i).test(value)) throw new Error('Embedded media must use a supported base64 image/video MIME type.');
    return value;
  }
  if (/^https?:/i.test(value)) throw new Error(`Download/embed ${value} before building, or use a clearly labeled outbound media url.`);
  const path = resolve(sceneDir, value);
  const mime = mimeTypes[extname(path).toLowerCase()];
  if (!mime || video !== mime.startsWith('video/')) throw new Error(`Unsupported ${video ? 'video' : 'image'} asset: ${path}`);
  const bytes = await readFile(path);
  if (mime === 'image/svg+xml') {
    const text = bytes.toString('utf8');
    if (!/<svg\b/i.test(text) || /<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|url)\s*[=(]\s*["']?(?:https?:|javascript:)/i.test(text)) throw new Error(`SVG asset must be authored, valid, and self-contained: ${path}`);
  }
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2), { scene: 'value', out: 'value', offline: 'flag' });
  if (!args.scene || !args.out) throw new Error('Usage: node scripts/build.mjs --scene path/to/story.json --out path/to/index.html [--offline]');
  const scenePath = resolve(args.scene);
  const out = resolve(args.out);
  const story = validateStory(JSON.parse(await readFile(scenePath, 'utf8')));
  for (const item of story.media) {
    if (item.src) item.src = await embedAsset(item.src, dirname(scenePath), { video: item.kind === 'video' });
    if (item.poster) item.poster = await embedAsset(item.poster, dirname(scenePath));
  }
  const css = await fontCSS(args.offline);
  const [template, playerCSS, core, video, player, notices] = await Promise.all([
    readFile(resolve(root, 'assets/template.html'), 'utf8'), readFile(resolve(root, 'assets/player.css'), 'utf8'),
    readFile(resolve(root, 'assets/core.mjs'), 'utf8'), readFile(resolve(root, 'assets/video.mjs'), 'utf8'),
    readFile(resolve(root, 'assets/player.js'), 'utf8'), readFile(resolve(root, 'assets/fonts/NOTICES.txt'), 'utf8'),
  ]);
  const coreJS = core.replace(/^export /gm, '') + '\nwindow.MonamotronCore = { BoardRenderer, THEMES, FONT_OPTIONS, validateStory, clamp };';
  const videoJS = video.replace(/^export /gm, '') + '\nwindow.MonamotronVideo = { withWebMDuration };';
  let html = template;
  for (const [token, content] of [
    ['MONAMOTRON_PAGE_TITLE', escapeHTML(`${story.title.replace(/\n/g, ' ')} — Monamotron`)],
    ['/* MONAMOTRON_FONT_CSS */', css], ['/* MONAMOTRON_PLAYER_CSS */', playerCSS], ['MONAMOTRON_SCENE_JSON', scriptSafeJSON(story)],
    ['MONAMOTRON_FONT_NOTICES', notices.replace(/<\/script/gi, '<\\/script')],
    ['/* MONAMOTRON_CORE_JS */', coreJS.replace(/<\/script/gi, '<\\/script')],
    ['/* MONAMOTRON_VIDEO_JS */', videoJS.replace(/<\/script/gi, '<\\/script')],
    ['/* MONAMOTRON_PLAYER_JS */', player.replace(/<\/script/gi, '<\\/script')],
  ]) {
    if (!html.includes(token)) throw new Error(`Template slot not found: ${token}`);
    html = html.replace(token, () => content);
  }
  if (story.language && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(story.language)) html = html.replace('<html lang="en">', `<html lang="${story.language}">`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, html);
  await writeFile(resolve(dirname(out), 'FONT-NOTICES.txt'), notices);
  console.log(`Built ${out} (${Math.round(Buffer.byteLength(html) / 1024)} KiB). Runtime, fonts, and local media are embedded.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
