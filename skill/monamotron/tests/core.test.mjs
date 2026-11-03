import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateStory, graphemes, typingSchedule, visibleCount, wrapText, layoutStory, seededRandom } from '../assets/core.mjs';
import { withWebMDuration } from '../assets/video.mjs';
import { scriptSafeJSON, parseArgs } from '../scripts/lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const example = JSON.parse(await readFile(resolve(root, 'examples/solar-story.json'), 'utf8'));

test('the complete example validates without modifying the authored scene', () => {
  const before = JSON.stringify(example);
  const story = validateStory(example);
  assert.equal(story.nodes.length, 4);
  assert.equal(story.media.find((m) => m.kind === 'video').generated, 'story');
  assert.equal(JSON.stringify(example), before);
});

test('invalid relationships, duplicate IDs, and out-of-canvas content are rejected', () => {
  const broken = structuredClone(example);
  broken.connections[0].to = 'missing';
  broken.nodes[1].id = 'sun';
  broken.nodes[0].x = broken.width;
  assert.throws(() => validateStory(broken), /Duplicate ID: sun/);
  assert.throws(() => validateStory(broken), /outside the canvas/);
  assert.throws(() => validateStory(broken), /endpoints/);
});

test('impossible timing and unsupported drawings fail before rendering', () => {
  const broken = structuredClone(example);
  broken.nodes[0].titleAt = broken.nodes[0].at;
  broken.nodes[1].icon = 'nonexistent';
  broken.captions[1].start = 100;
  assert.throws(() => validateStory(broken), /must follow the drawing/);
  assert.throws(() => validateStory(broken), /built-in or custom drawing/);
  assert.throws(() => validateStory(broken), /invalid timing/);
});

test('custom drawings can supply meaningful new subject artwork', () => {
  const story = structuredClone(example);
  story.drawings = { molecule: { size: 160, strokes: [{ d: 'M20 80 L80 20 L140 80 L80 140 Z' }] } };
  story.nodes[0].icon = 'molecule';
  assert.equal(validateStory(story).nodes[0].icon, 'molecule');
});

test('malformed collection entries and font/port values produce useful validation errors', () => {
  const badEntry = structuredClone(example); badEntry.nodes[0] = null;
  assert.throws(() => validateStory(badEntry), /nodes\[0\] must be an object/);
  const badFont = structuredClone(example); badFont.nodes[0].bodyFont = 'invented-font';
  badFont.nodes[0].ports = { right: [NaN, 10] };
  assert.throws(() => validateStory(badFont), /bodyFont is unsupported/);
  assert.throws(() => validateStory(badFont), /two finite coordinates/);
});

test('grapheme reveal preserves joined emoji, combining marks, and Arabic marks', () => {
  assert.deepEqual(graphemes('A👩‍👩‍👧‍👦e\u0301'), ['A', '👩‍👩‍👧‍👦', 'e\u0301']);
  assert.deepEqual(graphemes('سَلام'), ['سَ', 'ل', 'ا', 'م']);
});

test('human typing cadence is seeded, monotonic, and reversible by time', () => {
  const a = typingSchedule('Light, then power.', { seed: 28 });
  const b = typingSchedule('Light, then power.', { seed: 28 });
  const c = typingSchedule('Light, then power.', { seed: 29 });
  assert.deepEqual(a.times, b.times);
  assert.notDeepEqual(a.times, c.times);
  assert.ok(a.times.every((t, i) => i === 0 || t > a.times[i - 1]));
  assert.equal(visibleCount(a.times, -1), 0);
  assert.equal(visibleCount(a.times, a.duration), a.chars.length);
  assert.equal(visibleCount(a.times, a.times[3]), 4);
  assert.equal(visibleCount(a.times, a.times[1]), 2);
  const r1 = seededRandom(28); const r2 = seededRandom(28);
  assert.deepEqual(Array.from({ length: 12 }, r1), Array.from({ length: 12 }, r2));
});

test('full-text wrapping respects explicit breaks and does not split graphemes', () => {
  const measure = (s) => graphemes(s).length * 10;
  const lines = wrapText('A useful explanation\n👩‍👩‍👧‍👦e\u0301 longerword', 70, measure);
  assert.ok(lines.every((line) => measure(line) <= 70));
  assert.ok(lines.join('\n').includes('👩‍👩‍👧‍👦e\u0301'));
  assert.deepEqual(wrapText('one\n\ntwo', 100, measure), ['one', '', 'two']);
});

test('small-screen reflow preserves order and routes connectors vertically', () => {
  const story = layoutStory(validateStory(example), true);
  assert.equal(story.width, 600);
  assert.deepEqual(story.nodes.map((n) => n.id), example.nodes.map((n) => n.id));
  assert.ok(story.nodes.every((n, i) => i === 0 || n.y > story.nodes[i - 1].y + story.nodes[i - 1].height));
  assert.ok(story.connections.every((c) => c.fromPort === 'bottom' && c.toPort === 'top'));
  assert.ok(story.media.at(-1).y + story.media.at(-1).height < story.height);
});

test('embedded JSON cannot close its script element', () => {
  const malicious = { text: '</script><img src=x onerror=alert(1)>\u2028' };
  const safe = scriptSafeJSON(malicious);
  assert.ok(!safe.includes('</script>'));
  assert.deepEqual(JSON.parse(safe), malicious);
});

test('CLI arguments reject unknown options and missing values', () => {
  assert.deepEqual(parseArgs(['--scene', 'my file.json', '--offline'], { scene: 'value', offline: 'flag' }), { scene: 'my file.json', offline: true });
  assert.throws(() => parseArgs(['--scene'], { scene: 'value' }), /needs a value/);
  assert.throws(() => parseArgs(['--magic'], {}), /Unknown argument/);
});

test('WebM metadata gains a finite duration without losing clusters', () => {
  const bytes = new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3, 0x80,
    0x18, 0x53, 0x80, 0x67, 0xff,
    0x15, 0x49, 0xa9, 0x66, 0x87,
    0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40,
    0x1f, 0x43, 0xb6, 0x75, 0x80,
  ]);
  const result = withWebMDuration(bytes, 2500);
  assert.equal(result.length, bytes.length + 11);
  assert.equal(result[14], 0x92);
  assert.equal(new DataView(result.buffer).getFloat64(25, false), 2500);
  assert.deepEqual(result.slice(-5), bytes.slice(-5));
  const replaced = withWebMDuration(result, 1100);
  assert.equal(replaced.length, result.length);
  assert.equal(new DataView(replaced.buffer).getFloat64(25, false), 1100);
  assert.throws(() => withWebMDuration(new Uint8Array([0]), 1000), /EBML/);
});

test('the skill metadata and all its referenced guides are present', async () => {
  const skill = await readFile(resolve(root, 'SKILL.md'), 'utf8');
  assert.match(skill, /^---\r?\nname: monamotron\r?\ndescription: .+/);
  for (const match of skill.matchAll(/\]\((references\/[^)]+)\)/g)) await access(resolve(root, match[1]));
});
