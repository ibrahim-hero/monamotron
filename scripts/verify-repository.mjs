import { access, readFile, readdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staleBranding = [
  ['Astra', ' Visual ', 'Explainer'].join(''),
  ['astra', '-visual', '-explainer'].join(''),
  ['visual', '-', 'explainer'].join(''),
  ['Astra', 'Core'].join(''),
  ['Astra', 'Video'].join(''),
  ['astra', 'Board'].join(''),
];
const required = [
  'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'CONTRIBUTING.md', 'SECURITY.md',
  'skill/monamotron/SKILL.md', 'skill/monamotron/assets/core.mjs',
  'skill/monamotron/references/scene.schema.json', 'commands/opencode/monamotron.md',
  'examples/neural-network/index.html', 'examples/neural-network/story.source.json',
  'docs/index.html', 'docs/media/neural-network-demo.webm', 'docs/media/neural-network-preview.png',
  'docs/media/social-preview.png', '.github/workflows/ci.yml',
  'docs/media/social-preview.svg', 'docs/GITHUB_LAUNCH_PLAYBOOK.md', 'docs/LAUNCH_POSTS.md',
  'scripts/configure-github.mjs', 'scripts/create-social-preview.mjs', 'github.config.json',
  'docs/ARCHITECTURE.md', 'docs/video.html', 'scripts/create-demo-media.mjs',
  'docs/media/neural-network-demo.mp4', 'docs/media/neural-network-demo.gif',
];

async function exists(path) {
  try { await access(path, constants.F_OK); return true; } catch { return false; }
}

async function files(path) {
  const output = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (['node_modules', '.git', '.artifacts', 'dist', 'checks', 'generic-checks', 'exports'].includes(entry.name)) continue;
    const absolute = resolve(path, entry.name);
    if (entry.isDirectory()) output.push(...await files(absolute));
    else output.push(absolute);
  }
  return output;
}

const failures = [];
for (const path of required) if (!await exists(resolve(root, path))) failures.push(`Missing required path: ${path}`);

const github = JSON.parse(await readFile(resolve(root, 'github.config.json'), 'utf8'));
if (!github.description || github.description.length > 350) failures.push('GitHub About description must contain 1–350 characters.');
if (!Array.isArray(github.topics) || github.topics.length > 20 || github.topics.some((t) => !/^[a-z0-9-]{1,50}$/u.test(t))) failures.push('GitHub topics must be at most 20 lowercase hyphenated names, each 1–50 characters.');

const skill = await readFile(resolve(root, 'skill/monamotron/SKILL.md'), 'utf8');
if (!/^---\r?\nname: monamotron\r?\ndescription: .+/u.test(skill)) failures.push('SKILL.md frontmatter is missing its discoverable name/description.');

const fontsDir = resolve(root, 'skill/monamotron/assets/fonts');
const fonts = (await readdir(fontsDir)).filter((name) => name.endsWith('.woff2'));
if (fonts.length < 3) failures.push('Expected the documented offline WOFF2 fonts.');
for (const font of fonts) {
  const bytes = await readFile(resolve(fontsDir, font));
  if (bytes.subarray(0, 4).toString() !== 'wOF2') failures.push(`Invalid WOFF2 signature: ${font}`);
}

const video = await readFile(resolve(root, 'docs/media/neural-network-demo.webm'));
if (video.subarray(0, 4).toString('hex') !== '1a45dfa3') failures.push('Demo video is not an EBML/WebM file.');
if (video.length >= 100 * 1024 * 1024) failures.push('Demo video exceeds GitHub\'s normal 100 MB file limit.');

const mp4 = await readFile(resolve(root, 'docs/media/neural-network-demo.mp4'));
if (mp4.subarray(4, 8).toString() !== 'ftyp') failures.push('Demo MP4 is missing its file-type signature.');
const gif = await readFile(resolve(root, 'docs/media/neural-network-demo.gif'));
if (!/^GIF8[79]a$/u.test(gif.subarray(0, 6).toString())) failures.push('README preview is not a GIF.');
else if (gif.readUInt16LE(6) !== 960 || gif.readUInt16LE(8) !== 672) failures.push('README preview must be 960x672.');
for (const [name, bytes] of [['MP4', mp4], ['GIF', gif]]) {
  if (bytes.length >= 100 * 1024 * 1024) failures.push(`${name} demo exceeds GitHub's normal 100 MB file limit.`);
}

const watchPage = await readFile(resolve(root, 'docs/video.html'), 'utf8');
for (const match of watchPage.matchAll(/\b(?:href|src|poster)="([^"]+)"/gu)) {
  const target = match[1];
  if (/^(?:https?:|data:|#)/iu.test(target)) continue;
  const path = decodeURIComponent(target.split('#')[0].split('?')[0]);
  if (path && !await exists(resolve(root, 'docs', path))) failures.push(`Broken watch-page asset/link: ${target}`);
}

function pngSize(bytes) {
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG signature.');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
try {
  const social = pngSize(await readFile(resolve(root, 'docs/media/social-preview.png')));
  if (social.width !== 1280 || social.height !== 640) failures.push(`Social preview must be 1280x640, found ${social.width}x${social.height}.`);
  pngSize(await readFile(resolve(root, 'docs/media/neural-network-preview.png')));
} catch (error) { failures.push(error.message); }

for (const htmlPath of ['docs/index.html', 'examples/neural-network/index.html']) {
  const html = await readFile(resolve(root, htmlPath), 'utf8');
  if (!html.includes('window.monamotronBoard')) failures.push(`${htmlPath} is not a built standalone lesson.`);
}

const allFiles = await files(root);
for (const path of allFiles.filter((path) => extname(path).toLowerCase() === '.md')) {
  const markdown = await readFile(path, 'utf8');
  const prose = markdown.replace(/```[\s\S]*?```/gu, '').replace(/`[^`\r\n]+`/gu, '');
  for (const match of prose.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/gu)) {
    const target = match[1].trim();
    if (/^(?:https?:|mailto:|#)/iu.test(target)) continue;
    const clean = decodeURIComponent(target.split('#')[0].split('?')[0]);
    if (clean && !await exists(resolve(dirname(path), clean))) failures.push(`Broken local Markdown link in ${path.slice(root.length + 1)}: ${target}`);
  }
}

for (const path of allFiles.filter((path) => ['.md', '.mjs', '.json', '.yml', '.yaml', '.html', '.css'].includes(extname(path).toLowerCase()) || /(^|[\\/])LICENSE$/u.test(path))) {
  const text = await readFile(path, 'utf8');
  if (/G:\\opencode projects|C:\\Users\\/iu.test(text)) failures.push(`Machine-specific absolute path in ${path.slice(root.length + 1)}.`);
  if (staleBranding.some((name) => text.includes(name))) failures.push(`Stale pre-Monamotron branding in ${path.slice(root.length + 1)}.`);
}

if (failures.length) {
  console.error(`Repository verification failed:\n- ${[...new Set(failures)].join('\n- ')}`);
  process.exitCode = 1;
} else {
  const size = (await stat(resolve(root, 'docs/media/neural-network-demo.webm'))).size;
  console.log(`Monamotron repository verified: ${required.length} required paths, ${fonts.length} fonts, local Markdown/watch-page links, 1280x640 social preview, ${(size / 1048576).toFixed(2)} MiB WebM, MP4, and 960x672 GIF.`);
}
