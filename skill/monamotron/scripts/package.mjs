import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, exists } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
  return c >>> 0;
});
const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 0xffffffff) >>> 0;
};

async function collect(path, prefix = '') {
  const entries = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(item.name)) continue;
    const name = `${prefix}${item.name}`;
    if (item.isDirectory()) entries.push(...await collect(resolve(path, item.name), `${name}/`));
    else if (item.isFile()) entries.push({ name: `monamotron/${name}`, bytes: await readFile(resolve(path, item.name)) });
  }
  return entries;
}

function zip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  const date = new Date();
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const crc = crc32(entry.bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(entry.bytes.length, 18); local.writeUInt32LE(entry.bytes.length, 22); local.writeUInt16LE(name.length, 26);
    locals.push(local, name, entry.bytes);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6); header.writeUInt16LE(0x800, 8);
    header.writeUInt16LE(dosTime, 12); header.writeUInt16LE(dosDate, 14); header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(entry.bytes.length, 20); header.writeUInt32LE(entry.bytes.length, 24); header.writeUInt16LE(name.length, 28);
    header.writeUInt32LE(offset, 42); central.push(header, name);
    offset += local.length + name.length + entry.bytes.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2), { out: 'value', video: 'value', preview: 'value' });
  if (!args.out) throw new Error('Usage: node scripts/package.mjs --out monamotron.zip [--video demo.webm] [--preview demo.png]');
  const entries = await collect(root);
  const demo = resolve(root, 'dist/solar-story.html');
  if (await exists(demo)) entries.push({ name: 'monamotron/examples/solar-story.html', bytes: await readFile(demo) });
  const command = resolve(root, '../../commands/monamotron.md');
  if (await exists(command)) entries.push({ name: 'opencode-command/monamotron.md', bytes: await readFile(command) });
  if (args.video) entries.push({ name: 'monamotron/examples/solar-story.webm', bytes: await readFile(resolve(args.video)) });
  if (args.preview) entries.push({ name: 'monamotron/examples/solar-story-preview.png', bytes: await readFile(resolve(args.preview)) });
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.name) || entry.name.includes('..') || entry.name.startsWith('/')) throw new Error(`Invalid archive entry: ${entry.name}`);
    seen.add(entry.name);
  }
  const output = resolve(args.out);
  await mkdir(dirname(output), { recursive: true });
  const bytes = zip(entries);
  await writeFile(output, bytes);
  console.log(`Packaged ${entries.length} files in ${output} (${(bytes.length / 1048576).toFixed(2)} MiB), including cached fonts and the standalone example.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
