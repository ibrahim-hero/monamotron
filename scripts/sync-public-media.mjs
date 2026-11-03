import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSocialPreview } from './create-social-preview.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checks = resolve(root, 'examples/neural-network/checks');
const exportsDir = resolve(root, 'examples/neural-network/exports');
const media = resolve(root, 'docs/media');
await mkdir(media, { recursive: true });

for (const [from, to] of [
  [resolve(checks, 'final-board.png'), resolve(media, 'neural-network-preview.png')],
  [resolve(checks, 'mobile-board.png'), resolve(media, 'neural-network-mobile.png')],
  [resolve(checks, 'neuron-image.png'), resolve(media, 'neuron-detail.png')],
  [resolve(checks, 'curves-image.png'), resolve(media, 'learning-curves.png')],
  [resolve(exportsDir, 'explainer.webm'), resolve(media, 'neural-network-demo.webm')],
]) await copyFile(from, to);

await createSocialPreview();

console.log('Synced branded example images, video, and social preview to docs/media.');
