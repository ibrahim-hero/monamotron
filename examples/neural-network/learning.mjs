// A small, reproducible supervised-learning experiment for the illustration.
// Binary task: classify noisy 5x7 pixel glyphs as a 7 (1) or a 1 (0).
export const INPUTS = 35;
export const HIDDEN = 6;
export const VISIBLE_INPUTS = [0, 4, 10, 17, 30];
export const GLYPHS = {
  seven: ['11111', '00001', '00010', '00100', '00100', '01000', '01000'],
  sevenAlt: ['11111', '00001', '00001', '00010', '00100', '00100', '00100'],
  one: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  oneAlt: ['00010', '00110', '00010', '00010', '00010', '00010', '00111'],
};

export function random(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ value >>> 15, 1 | value);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

export const pixels = (rows) => rows.join('').split('').map(Number);
export const sigmoid = (z) => z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
export const binaryLoss = (z, y) => Math.max(z, 0) + Math.log1p(Math.exp(-Math.abs(z))) - y * z;

export function createNetwork(seed = 17) {
  const r = random(seed);
  return {
    W: Array.from({ length: HIDDEN }, () => Array.from({ length: INPUTS }, () => (r() - 0.5) * 0.6)),
    b: Array(HIDDEN).fill(0),
    V: Array.from({ length: HIDDEN }, () => (r() - 0.5) * 0.5),
    c: -0.6,
  };
}

export function copyNetwork(model) {
  return { W: model.W.map((row) => [...row]), b: [...model.b], V: [...model.V], c: model.c };
}

export function forward(model, x) {
  if (x.length !== INPUTS || x.some((v) => !Number.isFinite(v))) throw new Error('A sample must contain 35 finite pixel values.');
  const hidden = model.W.map((row, j) => sigmoid(row.reduce((sum, w, i) => sum + w * x[i], model.b[j])));
  const logit = model.V.reduce((sum, v, j) => sum + v * hidden[j], model.c);
  return { hidden, logit, probability: sigmoid(logit) };
}

export function gradients(model, samples) {
  if (!samples.length) throw new Error('Training requires at least one labeled example.');
  const gradient = { W: Array.from({ length: HIDDEN }, () => Array(INPUTS).fill(0)), b: Array(HIDDEN).fill(0), V: Array(HIDDEN).fill(0), c: 0 };
  let loss = 0;
  for (const { x, y } of samples) {
    if (y !== 0 && y !== 1) throw new Error('Binary labels must be 0 or 1.');
    const { hidden, probability, logit } = forward(model, x);
    loss += binaryLoss(logit, y);
    // d(binary cross-entropy)/d(output logit) = sigmoid(logit) - label.
    const outputDerivative = probability - y;
    gradient.c += outputDerivative;
    for (let j = 0; j < HIDDEN; j++) {
      gradient.V[j] += outputDerivative * hidden[j];
      const hiddenDerivative = outputDerivative * model.V[j] * hidden[j] * (1 - hidden[j]);
      gradient.b[j] += hiddenDerivative;
      for (let i = 0; i < INPUTS; i++) gradient.W[j][i] += hiddenDerivative * x[i];
    }
  }
  const count = samples.length;
  gradient.c /= count;
  for (let j = 0; j < HIDDEN; j++) {
    gradient.V[j] /= count; gradient.b[j] /= count;
    for (let i = 0; i < INPUTS; i++) gradient.W[j][i] /= count;
  }
  return { gradient, loss: loss / count };
}

export function update(model, gradient, learningRate) {
  if (!Number.isFinite(learningRate) || learningRate <= 0) throw new Error('The learning rate must be positive.');
  const next = copyNetwork(model);
  next.c -= learningRate * gradient.c;
  for (let j = 0; j < HIDDEN; j++) {
    next.b[j] -= learningRate * gradient.b[j]; next.V[j] -= learningRate * gradient.V[j];
    for (let i = 0; i < INPUTS; i++) next.W[j][i] -= learningRate * gradient.W[j][i];
  }
  return next;
}

export function dataset(count, seed, noise = 0.08) {
  if (count % 2 !== 0 || count < 2) throw new Error('Use an even sample count for the balanced toy dataset.');
  const r = random(seed);
  return Array.from({ length: count }, (_, index) => {
    const y = index % 2;
    const alternate = Math.floor(index / 2) % 2;
    const glyph = y ? (alternate ? GLYPHS.sevenAlt : GLYPHS.seven) : (alternate ? GLYPHS.oneAlt : GLYPHS.one);
    const x = pixels(glyph).map((value) => r() < noise ? 1 - value : value);
    return { x, y };
  });
}

export function evaluate(model, samples) {
  let loss = 0; let correct = 0;
  for (const { x, y } of samples) {
    const output = forward(model, x);
    loss += binaryLoss(output.logit, y);
    correct += Number(Number(output.probability >= 0.5) === y);
  }
  return { loss: loss / samples.length, correct, count: samples.length, accuracy: correct / samples.length };
}

function snapshot(model, example, training, checks, epoch) {
  const output = forward(model, example.x);
  return {
    epoch, probability: output.probability, exampleLoss: binaryLoss(output.logit, example.y), hidden: output.hidden,
    weights: model.W.map((row) => VISIBLE_INPUTS.map((i) => row[i])), outputWeights: [...model.V],
    training: evaluate(model, training), heldOut: evaluate(model, checks),
  };
}

export function experiment({ epochs = 200, learningRate = 0.6 } = {}) {
  const example = { x: pixels(GLYPHS.seven), y: 1 };
  const training = dataset(120, 103, 0.08);
  const checks = dataset(48, 809, 0.1);
  const initialModel = createNetwork(17);
  const initial = snapshot(initialModel, example, training, checks, -1);
  const firstGradient = gradients(initialModel, [example]).gradient;
  const firstLearningRate = 0.35;
  let model = update(initialModel, firstGradient, firstLearningRate);
  const first = snapshot(model, example, training, checks, 0);
  const trace = [first];
  for (let epoch = 1; epoch <= epochs; epoch++) {
    model = update(model, gradients(model, training).gradient, learningRate);
    trace.push(snapshot(model, example, training, checks, epoch));
  }
  return {
    task: 'Noisy 5x7 glyphs: 7 versus 1', architecture: [INPUTS, HIDDEN, 1], parameters: INPUTS * HIDDEN + HIDDEN + HIDDEN + 1,
    epochs, learningRate, firstLearningRate, example, initial, first, final: trace.at(-1), trace,
    selectedWeight: { index: 0, before: initialModel.V[0], gradient: firstGradient.V[0], after: first.outputWeights[0] },
    firstGradient, initialModel, finalModel: copyNetwork(model), training, checks,
  };
}
