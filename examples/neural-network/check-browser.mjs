import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser, blobBase64, inspectVideo } from '../../skill/monamotron/scripts/lib.mjs';
import { experiment } from './learning.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = resolve(root, 'checks');
const run = experiment();

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await launchBrowser();
  const errors = []; const requests = [];
  const report = { checks: [], expected: { initialProbability: run.initial.probability, firstProbability: run.first.probability, heldOutCorrect: run.final.heldOut.correct } };
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1220 } });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.goto(pathToFileURL(resolve(root, 'index.html')).href);
    await page.waitForFunction(() => Boolean(window.monamotronBoard));
    await page.evaluate(() => window.monamotronBoard.ready);
    const audit = await page.evaluate(() => window.monamotronBoard.audit());
    assert.deepEqual(audit.errors, []); assert.equal(audit.style, 'chalkboard'); assert.equal(audit.font, 'excalifont'); assert.ok(audit.fontsReady);
    const state = await page.evaluate(() => window.monamotronBoard.getState());
    assert.equal(state.time, 72000); assert.equal(state.playing, false);
    const networkStrokes = await page.locator('[data-drawing="network"] path').count();
    assert.ok(networkStrokes >= 45, `Expected a detailed network; found ${networkStrokes} strokes.`);
    const completedText = await page.locator('[data-board]').textContent();
    for (const text of ['35 → 6 → 1', '223 parameters', `${run.final.heldOut.correct}/${run.final.heldOut.count} correct`, 'No weights change yet']) assert.ok(completedText.includes(text), `Missing computed board text: ${text}`);
    await page.locator('[data-board]').screenshot({ path: resolve(out, 'final-board.png') });
    await page.screenshot({ path: resolve(out, 'player-desktop.png'), fullPage: true });
    report.checks.push('Primary chalkboard style, embedded fonts, computed values, and detailed 35→6→1 network.');

    const states = [{ name: 'input', time: 10400 }, { name: 'forward', time: 18800 }, { name: 'gradient', time: 41500 }, { name: 'update', time: 53200 }];
    for (const item of states) {
      await page.evaluate((time) => window.monamotronBoard.seek(time), item.time);
      await page.locator('[data-board]').screenshot({ path: resolve(out, `${item.name}.png`) });
    }
    await page.evaluate(() => window.monamotronBoard.seek(47650));
    const updateBefore = await page.locator('[data-text="update-body"]').textContent();
    await page.evaluate(() => window.monamotronBoard.seek(48150));
    const updateDuring = await page.locator('[data-text="update-body"]').textContent();
    await page.evaluate(() => window.monamotronBoard.seek(52000));
    const updateAfter = await page.locator('[data-text="update-body"]').textContent();
    assert.ok(updateBefore.length <= updateDuring.length && updateDuring.length < updateAfter.length);
    await page.evaluate(() => window.monamotronBoard.seek(48150));
    assert.equal(await page.locator('[data-text="update-body"]').textContent(), updateDuring);
    report.checks.push('Intermediate teaching beats and reversible human-paced typing.');

    await page.evaluate(() => { window.monamotronBoard.seek(0); window.monamotronBoard.play(); }); await page.waitForTimeout(180);
    const advancing = await page.evaluate(() => window.monamotronBoard.getState().time); assert.ok(advancing > 50);
    await page.evaluate(() => window.monamotronBoard.pause()); const paused = await page.evaluate(() => window.monamotronBoard.getState().time); await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => window.monamotronBoard.getState().time), paused);
    report.checks.push('Playback and pause share the deterministic lesson clock.');

    await page.evaluate(() => window.monamotronBoard.seek(72000));
    for (const id of ['neuron-image', 'curves-image']) {
      await page.locator(`[data-media="${id}"]`).click();
      const dimensions = await page.locator('#media-content img').evaluate(async (image) => { await image.decode(); return [image.naturalWidth, image.naturalHeight]; });
      assert.ok(dimensions[0] >= 1200 && dimensions[1] >= 600);
      await page.locator('#media-content img').screenshot({ path: resolve(out, `${id}.png`) });
      await page.click('#close-dialog');
    }
    const transcript = await page.locator('#transcript-content').textContent();
    for (const claim of ['does not itself change the weights', 'held-out digits never enter gradient calculations', 'not a result on real handwriting data']) assert.ok(transcript.toLowerCase().includes(claim));
    report.checks.push('Original supporting images decode, and transcript preserves the key caveats.');

    const svg = await page.evaluate(() => window.monamotronBoard.exportSVG());
    assert.ok(svg.includes('data:font/woff2;base64,') && svg.includes('How a neural'));
    await writeFile(resolve(out, 'board.svg'), svg);
    const png = await blobBase64(page, 'png', { width: 1600 });
    const pngBytes = Buffer.from(png.base64, 'base64'); assert.equal(pngBytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    await writeFile(resolve(out, 'board.png'), pngBytes);
    const clip = await blobBase64(page, 'video', { width: 800, fps: 12, start: 12500, end: 16500, finalHold: 300 });
    const decoded = await inspectVideo(page, clip.base64);
    assert.ok(decoded.duration > 4 && decoded.width === 800 && decoded.height > 500);
    await writeFile(resolve(out, 'motion-check.webm'), Buffer.from(clip.base64, 'base64'));
    await writeFile(resolve(out, 'motion-final-frame.png'), Buffer.from(decoded.finalFrame, 'base64'));
    report.shortVideo = { duration: decoded.duration, width: decoded.width, height: decoded.height };
    report.checks.push('SVG/PNG exports and a real decoded WebM segment.');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForFunction(() => window.monamotronBoard.getState().mobile);
    await page.evaluate(() => window.monamotronBoard.seek(72000));
    const mobileAudit = await page.evaluate(() => window.monamotronBoard.audit());
    assert.deepEqual(mobileAudit.errors, []); assert.ok(!mobileAudit.horizontalOverflow);
    await page.locator('[data-board]').screenshot({ path: resolve(out, 'mobile-board.png') });
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.click('#play-button');
    const reduced = await page.evaluate(() => window.monamotronBoard.getState()); assert.ok(reduced.reducedMotion && !reduced.playing && reduced.time === 72000);
    report.checks.push('375px reflow and reduced-motion completed-board behavior.');

    assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    report.checks.push('No browser errors and no runtime network requests.'); report.status = 'passed';
    await writeFile(resolve(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(`PASS: ${report.checks.length} rendered checks. Evidence: ${out}`);
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
