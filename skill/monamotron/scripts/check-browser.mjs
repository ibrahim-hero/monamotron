import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { THEMES, FONT_OPTIONS } from '../assets/core.mjs';
import { parseArgs, launchBrowser, blobBase64, exists } from './lib.mjs';

function luminance(hex) {
  const colors = hex.slice(1).match(/../g).map((c) => parseInt(c, 16) / 255).map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return colors[0] * 0.2126 + colors[1] * 0.7152 + colors[2] * 0.0722;
}
function contrast(a, b) { const x = luminance(a); const y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

async function main() {
  const args = parseArgs(process.argv.slice(2), { input: 'value', out: 'value', browser: 'value' });
  if (!args.input) throw new Error('Usage: node scripts/check-browser.mjs --input board.html [--out checks]');
  const input = resolve(args.input);
  assert.ok(await exists(input), `Missing input: ${input}`);
  const out = resolve(args.out || resolve(dirname(input), 'checks'));
  await mkdir(out, { recursive: true });
  const browser = await launchBrowser(args.browser);
  const pageErrors = [];
  const network = [];
  const report = { input, checks: [], styleFontCombinations: 0 };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('request', (request) => { if (/^https?:/.test(request.url())) network.push(request.url()); });
    await page.goto(pathToFileURL(input).href);
    await page.waitForFunction(() => Boolean(window.monamotronBoard));
    await page.evaluate(() => window.monamotronBoard.ready);
    const original = await page.evaluate(() => ({ style: window.monamotronBoard.story.style, font: window.monamotronBoard.story.font, duration: window.monamotronBoard.story.duration }));
    const assertAudit = async () => {
      const audit = await page.evaluate(() => window.monamotronBoard.audit());
      assert.deepEqual(audit.errors, [], `${audit.style}/${audit.font}: ${audit.errors.join('; ')}`);
      assert.ok(audit.fontsReady, 'The exact required fonts must load.');
      assert.ok(!audit.horizontalOverflow, 'The page must not overflow horizontally.');
      return audit;
    };
    await assertAudit();
    for (const [style, theme] of Object.entries(THEMES)) {
      assert.ok(contrast(theme.ink, theme.paper) >= 4.5, `${style}: primary text contrast`);
      assert.ok(contrast(theme.muted, theme.paper) >= 4.5, `${style}: secondary text contrast`);
      await page.selectOption('#style-select', style);
      for (const font of Object.keys(FONT_OPTIONS)) { await page.selectOption('#font-select', font); await assertAudit(); report.styleFontCombinations++; }
    }
    report.checks.push('Every style/font combination renders without text overflow; paper text contrast meets 4.5:1.');
    await page.selectOption('#style-select', original.style); await page.selectOption('#font-select', original.font);
    await page.locator('[data-board]').screenshot({ path: resolve(out, 'final-board.png') });
    await page.screenshot({ path: resolve(out, 'player-desktop.png'), fullPage: true });

    const first = await page.evaluate(() => window.monamotronBoard.story.nodes[0]);
    const getTitle = () => page.locator(`[data-text="${first.id}-title"]`).textContent();
    await page.evaluate((time) => window.monamotronBoard.seek(time), first.titleAt + 70);
    const early = await getTitle();
    await page.evaluate((time) => window.monamotronBoard.seek(time), first.titleAt + 350);
    const later = await getTitle();
    assert.ok(later.length > early.length && first.title.startsWith(later), 'Typing must reveal a correctly shaped prefix.');
    await page.evaluate((time) => window.monamotronBoard.seek(time), first.titleAt + 70);
    assert.equal(await getTitle(), early, 'Backward seek must restore the identical typed prefix.');
    await page.evaluate((time) => window.monamotronBoard.seek(time), first.at + first.drawDuration / 2);
    await page.locator('[data-board]').screenshot({ path: resolve(out, 'mid-drawing.png') });
    await page.evaluate(() => { window.monamotronBoard.pause(); window.monamotronBoard.seek(0); });
    await page.click('#play-button'); await page.waitForTimeout(250);
    assert.ok((await page.evaluate(() => window.monamotronBoard.getState())).time > 100, 'Playback must advance.');
    await page.click('#play-button');
    const paused = (await page.evaluate(() => window.monamotronBoard.getState())).time;
    await page.waitForTimeout(150);
    assert.equal((await page.evaluate(() => window.monamotronBoard.getState())).time, paused, 'Pause must freeze the shared clock.');
    await page.selectOption('#speed-select', '2');
    assert.equal((await page.evaluate(() => window.monamotronBoard.getState())).speed, 2);
    await page.click('#overview-button');
    assert.equal((await page.evaluate(() => window.monamotronBoard.getState())).time, original.duration);
    await page.click('#replay-button'); await page.waitForTimeout(80);
    assert.ok((await page.evaluate(() => window.monamotronBoard.getState())).time < 1000, 'Replay must restart the story.');
    await page.evaluate(() => { window.monamotronBoard.pause(); window.monamotronBoard.seek(window.monamotronBoard.story.duration); });
    report.checks.push('Typing, backward seek, playback, pause, speed, replay, and final overview.');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForFunction(() => window.monamotronBoard.getState().mobile);
    const mobile = await assertAudit();
    assert.equal(mobile.width, 600);
    await page.locator('[data-board]').screenshot({ path: resolve(out, 'mobile-board.png') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.click('#play-button');
    const reduced = await page.evaluate(() => window.monamotronBoard.getState());
    assert.ok(reduced.reducedMotion && !reduced.playing && reduced.time === original.duration, 'Reduced motion must show a completed board.');
    await assertAudit();
    report.checks.push('375px vertical reflow and reduced-motion playback.');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.waitForFunction(() => !window.monamotronBoard.getState().mobile);

    const imageCard = await page.evaluate(() => window.monamotronBoard.story.media.find((m) => m.kind === 'image')?.id);
    if (imageCard) {
      await page.locator(`[data-media="${imageCard}"]`).click();
      await page.locator('#media-content img').evaluate((image) => image.decode());
      await page.click('#close-dialog');
    }
    const videoCard = await page.evaluate(() => window.monamotronBoard.story.media.find((m) => m.generated === 'story')?.id);
    if (videoCard) {
      await page.locator(`[data-media="${videoCard}"]`).click();
      await page.waitForTimeout(120);
      assert.equal(await page.locator('#media-content canvas').count(), 1);
      await page.click('#close-dialog');
    }
    const svg = await page.evaluate(() => window.monamotronBoard.exportSVG());
    assert.ok(svg.includes('data:font/woff2;base64,') && svg.includes('SIL OPEN FONT LICENSE'), 'SVG must embed its fonts and notices.');
    await writeFile(resolve(out, 'export.svg'), svg);
    const png = await blobBase64(page, 'png', { width: 1440 });
    assert.equal(png.width, 1440); assert.ok(png.height > 500);
    const pngBytes = Buffer.from(png.base64, 'base64');
    assert.equal(pngBytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    await writeFile(resolve(out, 'export.png'), pngBytes);
    report.checks.push('Image media opens; generated video preview opens; PNG/SVG export includes real pixels and embedded fonts.');

    const start = first.at;
    const end = Math.min(original.duration, first.titleAt + 800);
    const recording = await blobBase64(page, 'video', { width: 640, fps: 12, start, end, finalHold: 250 });
    const bytes = Buffer.from(recording.base64, 'base64');
    assert.equal(bytes.subarray(0, 4).toString('hex'), '1a45dfa3');
    assert.ok(bytes.length > 2000, 'The video must contain actual encoded frames.');
    await writeFile(resolve(out, 'drawing-check.webm'), bytes);
    const decoded = await page.evaluate(async (base64) => {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
      const video = document.createElement('video'); video.muted = true; video.src = url;
      try {
        await new Promise((resolve, reject) => { video.onloadedmetadata = resolve; video.onerror = () => reject(new Error('WebM could not decode.')); });
        await video.play();
        await new Promise((resolve) => setTimeout(resolve, 180));
        return { duration: video.duration, width: video.videoWidth, height: video.videoHeight, currentTime: video.currentTime };
      } finally { video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); }
    }, recording.base64);
    assert.ok(Number.isFinite(decoded.duration) && decoded.duration > 1, 'Video metadata must report a finite positive duration.');
    assert.equal(decoded.width, 640); assert.ok(decoded.height > 300 && decoded.currentTime > 0);
    report.video = { bytes: bytes.length, ...decoded };
    report.checks.push('A real code-rendered WebM encodes, decodes, plays, and reports correct dimensions and finite duration.');
    assert.deepEqual(pageErrors, [], `Browser errors: ${pageErrors.join('; ')}`);
    assert.deepEqual(network, [], 'The standalone player must make no network requests.');
    report.checks.push('No browser errors and no runtime network requests.');
    report.status = 'passed';
    await writeFile(resolve(out, 'report.json'), JSON.stringify(report, null, 2));
    console.log(`PASS: ${report.styleFontCombinations} style/font combinations; timeline, mobile, fonts, media, PNG/SVG, and real WebM playback. Evidence: ${out}`);
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
