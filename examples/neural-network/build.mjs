import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { experiment } from './learning.mjs';
import { lessonDrawings, neuronSVG, curvesSVG } from './art.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const skill = resolve(root, '../../skill/monamotron');
const assets = resolve(root, 'assets');

async function embeddedFontCSS() {
  const manifest = JSON.parse(await readFile(resolve(skill, 'assets/fonts/sources.json'), 'utf8'));
  let css = '';
  for (const item of manifest.files) {
    const bytes = await readFile(resolve(skill, 'assets/fonts', item.file));
    css += `@font-face{font-family:'${item.family}';font-style:normal;font-weight:${item.weight};font-display:block;src:url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2');${item.range ? `unicode-range:${item.range};` : ''}}\n`;
  }
  return css;
}

function replaceValues(value, values) {
  if (typeof value === 'string') return value.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, name) => {
    if (!(name in values)) throw new Error(`Unknown computed placeholder: ${name}`);
    return values[name];
  });
  if (Array.isArray(value)) return value.map((item) => replaceValues(item, values));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceValues(item, values)]));
  return value;
}

async function main() {
  await mkdir(assets, { recursive: true });
  const run = experiment();
  const source = JSON.parse(await readFile(resolve(root, 'story.source.json'), 'utf8'));
  const signed = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(3)}`;
  const values = {
    initialProbability: run.initial.probability.toFixed(3), initialLoss: run.initial.exampleLoss.toFixed(3),
    selectedGradient: signed(run.selectedWeight.gradient), weightBefore: signed(run.selectedWeight.before), weightAfter: signed(run.selectedWeight.after),
    firstProbability: run.first.probability.toFixed(3), heldOutCorrect: String(run.final.heldOut.correct),
  };
  const story = replaceValues(source, values);
  story.$schema = '../../skill/monamotron/references/scene.schema.json';
  story.drawings = lessonDrawings(run);
  const node = Object.fromEntries(story.nodes.map((item) => [item.id, item]));
  node.network.body = `Before training: p(7) = ${values.initialProbability}.\n35 → 6 → 1 / ${run.parameters} parameters.`;
  node.loss.body = `Target y = 1.\nLoss = ${values.initialLoss}.`;
  node.backprop.body = `Gradient for one weight: ${values.selectedGradient}.\nNo weights change yet.`;
  node.update.body = `w: ${values.weightBefore} → ${values.weightAfter}.\np(7): ${values.initialProbability} → ${values.firstProbability}.`;
  node.practice.body = `Held-out: ${run.final.heldOut.correct}/${run.final.heldOut.count} correct.\nLoss: ${run.first.heldOut.loss.toFixed(3)} → ${run.final.heldOut.loss.toFixed(3)}.`;
  const notices = await readFile(resolve(skill, 'assets/fonts/NOTICES.txt'), 'utf8');
  const fontCSS = await embeddedFontCSS();
  await writeFile(resolve(assets, 'inside-a-neuron.svg'), neuronSVG(fontCSS, notices));
  await writeFile(resolve(assets, 'learning-curves.svg'), curvesSVG(run, fontCSS, notices));
  await writeFile(resolve(root, 'story.json'), `${JSON.stringify(story, null, 2)}\n`);
  await writeFile(resolve(root, 'experiment-results.json'), `${JSON.stringify({
    task: run.task, architecture: run.architecture, parameters: run.parameters, epochs: run.epochs,
    trainingSamples: run.training.length, heldOutSamples: run.checks.length,
    initial: run.initial, afterFirstExample: run.first, final: run.final,
    selectedWeight: run.selectedWeight,
  }, null, 2)}\n`);
  await promisify(execFile)(process.execPath, [resolve(skill, 'scripts/build.mjs'), '--scene', resolve(root, 'story.json'), '--out', resolve(root, 'index.html'), '--offline'], { cwd: skill, windowsHide: true });
  console.log(`Built ${resolve(root, 'index.html')}. p(7): ${values.initialProbability} → ${values.firstProbability}; held-out: ${run.final.heldOut.correct}/${run.final.heldOut.count}.`);
}

main().catch((error) => { console.error(error.stderr || error.message); process.exitCode = 1; });
