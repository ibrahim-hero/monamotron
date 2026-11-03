// Original geometry and illustrations for the lesson; no stock artwork.
import { GLYPHS, sigmoid } from './learning.mjs';

const stroke = (d, fill = 'none', color = 'ink', width = 2.5) => ({ d, fill, stroke: color, width });
const circle = (x, y, r) => `M${x - r} ${y} A${r} ${r} 0 1 0 ${x + r} ${y} A${r} ${r} 0 1 0 ${x - r} ${y}`;
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const C = { paper: '#17352f', ink: '#f6f3e7', muted: '#c2d5cc', gold: '#e5cb7c', mint: '#a6ccb6', coral: '#dfb2a4', surface: '#23453c', line: '#406157' };

export function lessonDrawings(run) {
  const cells = [];
  GLYPHS.seven.forEach((row, j) => row.split('').forEach((value, i) => {
    const x = 28 + i * 21; const y = 8 + j * 21;
    cells.push(stroke(`M${x} ${y} H${x + 16} V${y + 16} H${x} Z`, value === '1' ? 'mint' : 'surface', value === '1' ? 'mint' : 'line', 1.1));
  }));
  const lossPoints = Array.from({ length: 55 }, (_, i) => {
    const p = 0.07 + i / 54 * 0.92;
    return `${22 + p * 123},${136 - Math.min(2.8, -Math.log(p)) / 2.8 * 112}`;
  });
  const p = run.initial.probability;
  const inputY = [22, 58, 94, 130, 166];
  const hiddenY = [16, 47, 78, 109, 140, 171];
  const networkLines = [];
  for (let j = 0; j < hiddenY.length; j++) for (let i = 0; i < inputY.length; i++) {
    const weight = run.initial.weights[j][i];
    networkLines.push(stroke(`M62 ${inputY[i]} C136 ${inputY[i]} 183 ${hiddenY[j]} 250 ${hiddenY[j]}`, 'none', weight >= 0 ? 'mint' : 'coral', 0.9 + Math.abs(weight) * 5));
  }
  for (let j = 0; j < hiddenY.length; j++) {
    const weight = run.initial.outputWeights[j];
    networkLines.push(stroke(`M274 ${hiddenY[j]} C345 ${hiddenY[j]} 396 94 459 94`, 'none', weight >= 0 ? 'mint' : 'coral', 1 + Math.abs(weight) * 5));
  }
  return {
    'pixel-seven': { size: 160, strokes: [stroke('M20 1 L138 1 L138 158 L20 158 Z', 'none', 'muted', 1.7), ...cells] },
    'network-six': { size: 520, strokes: [
      ...networkLines,
      stroke('M23 9 Q7 9 7 25 V163 Q7 180 23 180', 'none', 'muted', 1.8),
      ...inputY.map((y, i) => stroke(circle(50, y, 9), i % 2 ? 'surface' : 'mint', i % 2 ? 'ink' : 'mint', 2)),
      stroke('M48 185 L52 185 M48 192 L52 192 M48 199 L52 199', 'none', 'muted', 2.5),
      ...hiddenY.map((y, i) => stroke(circle(262, y, 12), i % 2 ? 'lilac' : 'surface', 'ink', 2.2)),
      stroke(circle(474, 94, 19), 'gold', 'gold', 2.5),
      stroke('M310 202 Q357 192 405 202', 'none', 'gold', 5),
    ] },
    'cross-entropy': { size: 160, strokes: [stroke('M19 14 V139 H151', 'none', 'muted', 1.8), stroke(`M${lossPoints.join(' L')}`, 'none', 'gold', 3.2), stroke(circle(22 + p * 123, 136 - Math.min(2.8, -Math.log(p)) / 2.8 * 112, 4), 'coral', 'coral', 1.5)] },
    'chain-rule': { size: 160, strokes: [stroke('M132 79 H102 M111 70 L102 79 L111 88 M72 79 H42 M51 70 L42 79 L51 88', 'none', 'gold', 3), stroke(circle(142, 79, 13), 'surface', 'gold'), stroke(circle(82, 79, 13), 'surface', 'gold'), stroke(circle(22, 79, 13), 'surface', 'gold')] },
    'weight-dial': { size: 160, strokes: [stroke(circle(80, 80, 52), 'surface', 'coral', 2.6), stroke('M37 119 L43 114 M28 82 H37 M41 43 L47 49 M80 28 V38 M120 43 L113 49 M132 81 H123 M121 119 L114 113', 'none', 'muted', 2), stroke('M80 80 L111 44', 'none', 'gold', 4), stroke(circle(80, 80, 6), 'gold', 'gold', 1)] },
    'loss-trace': { size: 160, strokes: [stroke('M12 18 V144 H152', 'none', 'muted', 1.8), stroke(`M${run.trace.map((s, i) => `${15 + i / run.epochs * 135},${140 - s.training.loss / Math.max(1, run.trace[0].training.loss) * 110}`).join(' L')}`, 'none', 'gold', 3)] },
  };
}

const text = (x, y, value, size = 22, color = C.ink, family = 'Nunito', anchor = 'start') => `<text x="${x}" y="${y}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${family === 'Nunito' ? 500 : 400}" text-anchor="${anchor}">${xml(value)}</text>`;
const line = (d, color = C.ink, width = 2.5, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const dot = (x, y, r, fill = C.surface, outline = C.ink) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${outline}" stroke-width="2.5"/>`;
const arrow = (x1, y1, x2, y2, color = C.mint) => line(`M${x1} ${y1} L${x2} ${y2} M${x2 - 10} ${y2 - 6} L${x2} ${y2} L${x2 - 10} ${y2 + 6}`, color);

function documentSVG(width, height, title, content, fontCSS, notices) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(title)}"><metadata>${xml(notices)}</metadata><style>${fontCSS}</style><rect width="${width}" height="${height}" fill="${C.paper}"/><rect x="22" y="22" width="${width - 44}" height="${height - 44}" rx="5" fill="none" stroke="${C.line}" stroke-width="1.5"/>${content}</svg>`;
}

export function neuronSVG(fontCSS, notices) {
  let art = text(64, 83, 'Inside one neuron.', 49, C.ink, 'Excalifont');
  art += text(66, 126, 'A weighted sum, a bias, then an activation.', 23, C.muted);
  const ys = [220, 330, 440]; const values = [1, 0, 1]; const weights = ['+0.4', '-0.2', '+0.6'];
  ys.forEach((y, i) => {
    art += line(`M143 ${y} Q308 ${y} 477 330`, C.mint, 2.5);
    art += dot(109, y, 31);
    art += text(109, y + 9, values[i], 27, C.ink, 'Nunito', 'middle');
    art += text(49, y - 45, `x${i + 1}`, 22, C.muted, 'Excalifont');
    art += text(255, y - 15, `w${i + 1} = ${weights[i]}`, 23, C.mint, 'Excalifont');
  });
  art += dot(520, 330, 43);
  art += text(520, 340, '+', 41, C.gold, 'Excalifont', 'middle');
  art += text(464, 244, 'bias = -0.3', 24, C.coral, 'Excalifont');
  art += line('M520 257 V279 M514 270 L520 279 L526 270', C.coral);
  art += text(520, 407, 'z = 0.7', 25, C.gold, 'Excalifont', 'middle');
  art += arrow(575, 330, 715, 330);
  art += dot(784, 330, 55);
  art += line('M750 358 H816 M752 362 V301', C.line, 1.5);
  art += line('M757 352 C771 352 771 307 811 307', C.gold, 3);
  art += text(784, 245, 'sigmoid', 29, C.ink, 'Excalifont', 'middle');
  art += arrow(852, 330, 970, 330);
  art += dot(1025, 330, 43, C.mint, C.mint);
  art += text(1025, 340, sigmoid(0.7).toFixed(3), 26, C.paper, 'Nunito', 'middle');
  art += text(1025, 245, 'activation', 24, C.ink, 'Excalifont', 'middle');
  art += text(1025, 406, 'to the next layer', 20, C.muted, 'Nunito', 'middle');
  art += line('M67 487 H1125', C.line, 1);
  art += text(67, 535, 'z = (1 x 0.4) + (0 x -0.2) + (1 x 0.6) - 0.3 = 0.7', 24);
  art += text(67, 577, 'sigmoid(0.7) = 0.668  /  A three-input worked example.', 21, C.muted);
  return documentSVG(1200, 625, 'Inside one neuron: a worked weighted sum and sigmoid activation', art, fontCSS, notices);
}

export function curvesSVG(run, fontCSS, notices) {
  let art = text(64, 82, 'Practice changes the numbers.', 48, C.ink, 'Excalifont');
  art += text(66, 126, 'Measured losses from our tiny 35-input / 6-hidden-unit classifier.', 22, C.muted);
  art += text(75, 191, `Training loss: ${run.first.training.loss.toFixed(3)} to ${run.final.training.loss.toFixed(3)}`, 23, C.gold);
  art += text(655, 191, `Held-out loss: ${run.first.heldOut.loss.toFixed(3)} to ${run.final.heldOut.loss.toFixed(3)}`, 23, C.mint);
  const x = 135; const top = 245; const width = 940; const height = 305;
  const maximum = Math.ceil(Math.max(...run.trace.flatMap((s) => [s.training.loss, s.heldOut.loss])) * 5) / 5;
  for (let i = 0; i <= 4; i++) {
    const value = maximum * i / 4; const y = top + height - value / maximum * height;
    art += line(`M${x} ${y} H${x + width}`, C.line, 1, 'opacity="0.65"');
    art += text(x - 19, y + 6, value.toFixed(2), 18, C.muted, 'Nunito', 'end');
  }
  art += line(`M${x} ${top - 12} V${top + height} H${x + width + 12}`, C.muted, 2);
  for (const epoch of [0, 50, 100, 150, 200]) art += text(x + epoch / run.epochs * width, top + height + 33, epoch, 19, C.muted, 'Nunito', 'middle');
  for (const [key, color] of [['training', C.gold], ['heldOut', C.mint]]) {
    const points = run.trace.map((s) => `${x + s.epoch / run.epochs * width},${top + height - s[key].loss / maximum * height}`);
    art += line(`M${points.join(' L')}`, color, 3.8);
    const last = run.final[key];
    art += dot(x + width, top + height - last.loss / maximum * height, 4, color, color);
  }
  art += text(64, 228, 'Mean binary cross-entropy', 17, C.muted);
  art += text(603, 623, 'Full-batch training passes', 21, C.muted, 'Nunito', 'middle');
  art += text(66, 665, `120 training digits / 48 separate check digits / ${run.final.heldOut.correct} of 48 checks correct`, 19, C.muted);
  return documentSVG(1200, 708, 'Actual training and held-out loss curves from the reproducible toy classifier', art, fontCSS, notices);
}
