import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseArgs, launchBrowser, blobBase64, inspectVideo, exists } from './lib.mjs';

async function main() {
  const args = parseArgs(process.argv.slice(2), { input: 'value', out: 'value', browser: 'value', width: 'value', fps: 'value', png: 'flag', svg: 'flag', video: 'flag', mp4: 'flag' });
  if (!args.input) throw new Error('Usage: node scripts/export.mjs --input board.html --out exports --png --svg --video [--mp4]');
  const input = resolve(args.input);
  if (!await exists(input)) throw new Error(`Input HTML not found: ${input}`);
  const out = resolve(args.out || resolve(dirname(input), 'exports'));
  await mkdir(out, { recursive: true });
  const browser = await launchBrowser(args.browser);
  const errors = [];
  const manifest = { input, files: [], createdAt: new Date().toISOString() };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(pathToFileURL(input).href);
    await page.waitForFunction(() => Boolean(window.monamotronBoard));
    await page.evaluate(() => window.monamotronBoard.ready);
    const audit = await page.evaluate(() => window.monamotronBoard.audit());
    if (audit.errors.length) throw new Error(`Fix rendered layout before export:\n${audit.errors.join('\n')}`);
    if (args.svg) {
      const svg = await page.evaluate(() => window.monamotronBoard.exportSVG());
      const path = resolve(out, 'explainer.svg'); await writeFile(path, svg); manifest.files.push({ path, kind: 'svg' });
      console.log(`Exported ${path}`);
    }
    if (args.png) {
      const { base64, ...info } = await blobBase64(page, 'png', { width: Number(args.width || 2160) });
      const path = resolve(out, 'explainer.png'); await writeFile(path, Buffer.from(base64, 'base64')); manifest.files.push({ path, kind: 'png', ...info });
      console.log(`Exported ${path}`);
    }
    if (args.video || args.mp4) {
      const duration = await page.evaluate(() => window.monamotronBoard.story.duration);
      console.log(`Rendering the ${(duration / 1000).toFixed(1)}s story as a real WebM video…`);
      const { base64, ...info } = await blobBase64(page, 'video', { width: Number(args.width || 1280), fps: Number(args.fps || 24) });
      const { finalFrame, ...decoded } = await inspectVideo(page, base64);
      if (decoded.width !== info.width || decoded.height !== info.height) throw new Error('Decoded video dimensions differ from the rendered dimensions.');
      const webm = resolve(out, 'explainer.webm'); await writeFile(webm, Buffer.from(base64, 'base64')); manifest.files.push({ path: webm, kind: 'video', ...info });
      manifest.videoDecode = decoded;
      await writeFile(resolve(out, 'video-final-frame.png'), Buffer.from(finalFrame, 'base64'));
      console.log(`Exported ${webm}`);
      if (args.mp4) {
        const mp4 = resolve(out, 'explainer.mp4');
        try { await promisify(execFile)(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { maxBuffer: 10 * 1024 * 1024, windowsHide: true }); }
        catch (error) { throw new Error(`WebM was exported, but MP4 conversion failed. Install FFmpeg or set FFMPEG_PATH.\n${error.stderr || error.message}`); }
        manifest.files.push({ path: mp4, kind: 'video', mime: 'video/mp4' }); console.log(`Exported ${mp4}`);
      }
    }
    if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
    manifest.audit = audit;
    await writeFile(resolve(out, 'exports.json'), JSON.stringify(manifest, null, 2));
    if (!manifest.files.length) throw new Error('Choose at least one export: --png, --svg, --video, or --mp4.');
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
