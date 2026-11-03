import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'docs'), { recursive: true });
await copyFile(resolve(root, 'examples/neural-network/index.html'), resolve(root, 'docs/index.html'));
console.log('Synced the neural-network standalone lesson to docs/index.html.');
