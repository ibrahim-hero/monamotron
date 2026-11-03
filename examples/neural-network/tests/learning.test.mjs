import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork, copyNetwork, forward, binaryLoss, gradients, update, dataset, experiment, GLYPHS, pixels } from '../learning.mjs';

test('backpropagation agrees with independent central finite differences', () => {
  const model = createNetwork();
  const samples = [{ x: pixels(GLYPHS.seven), y: 1 }, { x: pixels(GLYPHS.one), y: 0 }];
  const analytic = gradients(model, samples).gradient;
  const loss = (m) => samples.reduce((sum, { x, y }) => sum + binaryLoss(forward(m, x).logit, y), 0) / samples.length;
  const parameters = [
    ...[0, 2, 5].map((j) => ({ read: (m) => m.V[j], write: (m, v) => { m.V[j] = v; }, derivative: analytic.V[j] })),
    ...[0, 3].map((j) => ({ read: (m) => m.b[j], write: (m, v) => { m.b[j] = v; }, derivative: analytic.b[j] })),
    ...[[0, 0], [1, 4], [2, 17], [5, 30]].map(([j, i]) => ({ read: (m) => m.W[j][i], write: (m, v) => { m.W[j][i] = v; }, derivative: analytic.W[j][i] })),
    { read: (m) => m.c, write: (m, v) => { m.c = v; }, derivative: analytic.c },
  ];
  for (const parameter of parameters) {
    const plus = copyNetwork(model); const minus = copyNetwork(model); const epsilon = 1e-5;
    parameter.write(plus, parameter.read(model) + epsilon); parameter.write(minus, parameter.read(model) - epsilon);
    const numeric = (loss(plus) - loss(minus)) / (2 * epsilon);
    assert.ok(Math.abs(numeric - parameter.derivative) < 1e-7, `Expected ${numeric}, received ${parameter.derivative}`);
  }
});

test('the illustrated first update reduces this example loss without mutating the old network', () => {
  const model = createNetwork(); const before = JSON.stringify(model);
  const sample = { x: pixels(GLYPHS.seven), y: 1 };
  const grad = gradients(model, [sample]).gradient;
  const next = update(model, grad, 0.35);
  assert.equal(JSON.stringify(model), before);
  assert.ok(binaryLoss(forward(next, sample.x).logit, 1) < binaryLoss(forward(model, sample.x).logit, 1));
  assert.notDeepEqual(next.b, model.b);
  assert.notEqual(next.c, model.c);
});

test('training creates measured learning and independently evaluated held-out results', () => {
  const run = experiment();
  assert.equal(run.parameters, 223);
  assert.equal(run.training.length, 120); assert.equal(run.checks.length, 48);
  assert.equal(run.trace.length, 201);
  assert.ok(run.initial.probability < 0.5 && run.final.probability > 0.9);
  assert.ok(run.final.training.loss < run.initial.training.loss * 0.15);
  assert.ok(run.final.heldOut.accuracy >= 0.9);
  assert.ok(run.trace.every((s) => Number.isFinite(s.training.loss) && Number.isFinite(s.heldOut.loss)));
  assert.ok(Math.abs(run.selectedWeight.after - (run.selectedWeight.before - run.firstLearningRate * run.selectedWeight.gradient)) < 1e-12);
});

test('toy datasets are balanced, seeded, and independent across seeds', () => {
  assert.deepEqual(dataset(12, 7), dataset(12, 7));
  assert.notDeepEqual(dataset(12, 7), dataset(12, 8));
  assert.equal(dataset(12, 7).filter((s) => s.y === 1).length, 6);
});

test('cross-entropy remains numerically stable at extreme logits', () => {
  assert.equal(binaryLoss(1000, 0), 1000);
  assert.equal(binaryLoss(-1000, 1), 1000);
  assert.ok(Number.isFinite(binaryLoss(1000, 1)));
  assert.throws(() => forward(createNetwork(), [1, 0]), /35 finite/);
});
