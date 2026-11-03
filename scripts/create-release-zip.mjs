import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { deflateRawSync } from 'node:zlib';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')).version;
const requested = process.argv.indexOf('--out');
if (requested >= 0 && !process.argv[requested + 1]) throw new Error('--out needs a path.');
const output = resolve(requested >= 0 ? process.argv[requested + 1] : resolve(root, 'dist', `monamotron-v${version}.zip`));

const excludedDirectories = new Set(['.git', 'node_modules', '.artifacts', 'dist', 'checks', 'generic-checks', 'exports']);
const excludedFiles = new Set(['.DS_Store', 'Thumbs.db']);

async function collect(path) {
  const entries = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    if (item.isDirectory() && excludedDirectories.has(item.name) || item.isFile() && excludedFiles.has(item.name)) continue;
    const absolute = resolve(path, item.name);
    if (item.isDirectory()) entries.push(...await collect(absolute));
    else if (item.isFile()) entries.push({ name: `monamotron/${relative(root, absolute).replaceAll('\\', '/')}`, bytes: await readFile(absolute) });
  }
  return entries;
}

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let i = 0; i < 8; i++) crc = crc & 1 ? 0xedb88320 ^ crc >>> 1 : crc >>> 1;
  return crc >>> 0;
});
const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
  return (crc ^ 0xffffffff) >>> 0;
};

function makeZip(entries) {
  const localParts = []; const centralParts = []; let offset = 0;
  const date = new Date();
  const dosTime = date.getHours() << 11 | date.getMinutes() << 5 | Math.floor(date.getSeconds() / 2);
  const dosDate = date.getFullYear() - 1980 << 9 | date.getMonth() + 1 << 5 | date.getDate();
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8'); const crc = crc32(entry.bytes);
    const compressed = deflateRawSync(entry.bytes, { level: 9 });
    const useDeflate = compressed.length < entry.bytes.length; const body = useDeflate ? compressed : entry.bytes; const method = useDeflate ? 8 : 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(method, 8);
    local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18); local.writeUInt32LE(entry.bytes.length, 22); local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, body);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt16LE(method, 10);
    central.writeUInt16LE(dosTime, 12); central.writeUInt16LE(dosDate, 14); central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20); central.writeUInt32LE(entry.bytes.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + body.length;
  }
  const directory = Buffer.concat(centralParts); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, directory, end]);
}

const entries = await collect(root);
await mkdir(dirname(output), { recursive: true });
const zip = makeZip(entries);
await writeFile(output, zip);
console.log(`Created ${output}: ${entries.length} files, ${(zip.length / 1048576).toFixed(2)} MiB.`);
