import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

export function parseArgs(argv, spec) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || !spec[key]) throw new Error(`Unknown argument: ${argv[i]}`);
    if (spec[key] === 'flag') result[key] = true;
    else {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`--${key} needs a value.`);
      result[key] = argv[++i];
    }
  }
  return result;
}

export function scriptSafeJSON(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function escapeHTML(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function exists(path) {
  try { await access(path, constants.F_OK); return true; } catch { return false; }
}

export async function launchBrowser(executablePath) {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { throw new Error('Automated exports/checks need Playwright. Run npm install from the skill directory.'); }
  const paths = [executablePath, process.env.BROWSER_EXECUTABLE,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  ].filter(Boolean);
  const found = [];
  for (const path of paths) if (await exists(path)) found.push(resolve(path));
  if (executablePath && !found.includes(resolve(executablePath))) throw new Error(`Browser executable not found: ${executablePath}`);
  try {
    return await chromium.launch({ headless: true, executablePath: found[0], args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--autoplay-policy=no-user-gesture-required'] });
  } catch (error) { throw new Error(`Could not launch a browser. Set BROWSER_EXECUTABLE or run npx playwright install chromium.\n${error.message}`); }
}

export async function blobBase64(page, kind, options = {}) {
  return page.evaluate(async ({ kind, options }) => {
    const result = kind === 'video' ? await window.monamotronBoard.exportVideo(options) : await window.monamotronBoard.exportPNG(options);
    const data = new Uint8Array(await result.blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < data.length; i += 32768) binary += String.fromCharCode(...data.subarray(i, i + 32768));
    const { blob, ...metadata } = result;
    return { base64: btoa(binary), ...metadata };
  }, { kind, options });
}

export async function inspectVideo(page, base64) {
  return page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
    const video = document.createElement('video'); video.muted = true;
    try {
      const loaded = new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('Exported video could not decode.'));
      });
      video.src = url;
      await loaded;
      if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('Exported video has no finite positive duration.');
      const seeked = new Promise((resolve, reject) => { video.onseeked = resolve; video.onerror = () => reject(new Error('Exported video could not seek.')); });
      video.currentTime = Math.max(0.01, video.duration - 0.25);
      await seeked;
      const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      return { duration: video.duration, width: video.videoWidth, height: video.videoHeight, finalFrame: canvas.toDataURL('image/png').split(',')[1] };
    } finally { video.pause(); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); }
  }, base64);
}
