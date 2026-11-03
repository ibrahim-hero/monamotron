// Shared deterministic scene/timeline logic and SVG renderer. No runtime packages.
export const THEMES = {
  'studio-sketch': { name: 'Studio sketch', paper: '#fbf8ee', ink: '#232c3d', muted: '#626773', accent: '#4b62b3', gold: '#f3ce68', mint: '#b3d8c4', lilac: '#c8c2ed', coral: '#eaa99b', surface: '#f2eddf', line: '#ded8ca', texture: 'dots', roughness: 0.9, font: 'excalifont' },
  'clean-board': { name: 'Clean board', paper: '#ffffff', ink: '#202939', muted: '#5d6878', accent: '#315ccd', gold: '#f8da7c', mint: '#b9e0d0', lilac: '#c5d2f4', coral: '#efb5aa', surface: '#f4f6fa', line: '#dce2eb', texture: 'dots', roughness: 0, font: 'nunito' },
  blueprint: { name: 'Blueprint', paper: '#112a43', ink: '#eff7ff', muted: '#c1d2e3', accent: '#80dded', gold: '#edc66a', mint: '#8ac9b4', lilac: '#97aad3', coral: '#d99d8d', surface: '#203c55', line: '#34516a', texture: 'grid', roughness: 0, font: 'mono' },
  chalkboard: { name: 'Chalkboard', paper: '#17352f', ink: '#f6f3e7', muted: '#c2d5cc', accent: '#a9d4e7', gold: '#e5cb7c', mint: '#a6ccb6', lilac: '#beb8da', coral: '#dfb2a4', surface: '#23453c', line: '#406157', texture: 'dots', roughness: 1.15, font: 'excalifont' },
  editorial: { name: 'Editorial', paper: '#fcf7ef', ink: '#302e2b', muted: '#70675e', accent: '#a64932', gold: '#e7c684', mint: '#b7c9ad', lilac: '#d1c7d9', coral: '#dda995', surface: '#efe7dc', line: '#d9cfc1', texture: 'none', roughness: 0.5, font: 'serif' },
  playful: { name: 'Playful', paper: '#fffaf2', ink: '#2c2841', muted: '#676178', accent: '#5351c7', gold: '#f7cf57', mint: '#9ed7be', lilac: '#bfb7ef', coral: '#f0a194', surface: '#f5ecde', line: '#e2d6c4', texture: 'dots', roughness: 1.2, font: 'excalifont' },
  midnight: { name: 'Midnight', paper: '#181b2b', ink: '#f2f3fc', muted: '#c4c8dd', accent: '#c3b5ff', gold: '#edce80', mint: '#9ddbc3', lilac: '#a89adb', coral: '#dfa7ac', surface: '#282c42', line: '#3d425c', texture: 'dots', roughness: 0.6, font: 'excalifont' },
  notebook: { name: 'Notebook', paper: '#faf7ed', ink: '#29394e', muted: '#646d7a', accent: '#a53f37', gold: '#e6c571', mint: '#bfd4b3', lilac: '#c7c7e3', coral: '#e4b1a4', surface: '#f1ecdf', line: '#d7dfe5', texture: 'ruled', roughness: 1, font: 'virgil' },
};

export const FONT_OPTIONS = {
  excalifont: { name: 'Excalifont · handwritten', family: 'Excalifont, sans-serif', weight: 400 },
  virgil: { name: 'Virgil · classic sketch', family: 'Virgil, sans-serif', weight: 400 },
  nunito: { name: 'Nunito · clean', family: 'Nunito, sans-serif', weight: 500 },
  serif: { name: 'Georgia · editorial', family: 'Georgia, serif', weight: 400 },
  mono: { name: 'Monospace · technical', family: 'ui-monospace, Consolas, monospace', weight: 400 },
};

export const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
export const progress = (time, at, duration) => clamp((time - at) / Math.max(1, duration));
export const ease = (p) => p * p * (3 - 2 * p);

export function seededRandom(seed) {
  let n = seed >>> 0;
  return () => {
    n += 0x6d2b79f5;
    let t = Math.imul(n ^ (n >>> 15), 1 | n);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(text) {
  let hash = 2166136261;
  for (const c of text) hash = Math.imul(hash ^ c.codePointAt(0), 16777619);
  return hash >>> 0;
}

export function graphemes(text) {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

export function typingSchedule(text, { cps = 34, seed = 42 } = {}) {
  const chars = graphemes(text);
  const random = seededRandom(seed);
  const times = [];
  let elapsed = 0;
  for (const char of chars) {
    elapsed += (1000 / cps) * (0.8 + random() * 0.4) * (/^\s$/u.test(char) ? 0.55 : 1);
    times.push(elapsed);
    if (/[,;:،]/u.test(char)) elapsed += 75;
    if (/[.!?。؟]/u.test(char)) elapsed += 155;
    if (char === '\n') elapsed += 100;
  }
  return { chars, times, duration: elapsed };
}

export function visibleCount(times, elapsed) {
  let low = 0;
  let high = times.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (times[middle] <= elapsed) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function wrapText(text, maxWidth, measure) {
  const result = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) { result.push(''); continue; }
    let line = '';
    const words = paragraph.match(/\S+\s*/gu) || [''];
    for (const word of words) {
      if (measure(line + word.trimEnd()) <= maxWidth) { line += word; continue; }
      if (line.trim()) { result.push(line.trimEnd()); line = ''; }
      let part = '';
      for (const char of graphemes(word.trimEnd())) {
        if (part && measure(part + char) > maxWidth) { result.push(part); part = ''; }
        part += char;
      }
      line = part + (word.endsWith(' ') ? ' ' : '');
    }
    result.push(line.trimEnd());
  }
  return result;
}

export function validateStory(input) {
  const errors = [];
  const story = typeof structuredClone === 'function' ? structuredClone(input) : JSON.parse(JSON.stringify(input));
  const number = (value, path, minimum = 0) => {
    if (!Number.isFinite(value) || value < minimum) errors.push(`${path} must be a finite number >= ${minimum}.`);
  };
  const string = (value, path, required = true) => {
    if (typeof value !== 'string' || (required && !value.trim())) errors.push(`${path} must be ${required ? 'a nonempty' : 'a'} string.`);
  };
  const url = (value, path) => {
    try { if (!['https:', 'http:'].includes(new URL(value).protocol)) throw new Error(); }
    catch { errors.push(`${path} must be an absolute HTTP(S) URL.`); }
  };
  if (!story || typeof story !== 'object' || Array.isArray(story)) throw new Error('Scene must be a JSON object.');
  if (story.version !== 1) errors.push('version must be 1.');
  string(story.title, 'title');
  story.subtitle ??= '';
  story.eyebrow ??= 'A VISUAL EXPLANATION';
  string(story.subtitle, 'subtitle', false);
  string(story.eyebrow, 'eyebrow', false);
  if (story.headerNote !== undefined) string(story.headerNote, 'headerNote', false);
  if (story.language !== undefined) string(story.language, 'language');
  story.style ??= 'studio-sketch';
  story.font ??= THEMES[story.style]?.font || 'excalifont';
  if (!THEMES[story.style]) errors.push(`Unknown style: ${story.style}.`);
  if (!FONT_OPTIONS[story.font]) errors.push(`Unknown font: ${story.font}.`);
  story.width ??= 1440;
  story.height ??= 960;
  story.seed ??= 42;
  story.direction ??= 'ltr';
  number(story.width, 'width', 320);
  number(story.height, 'height', 320);
  number(story.duration, 'duration', 1000);
  number(story.seed, 'seed');
  if (!['ltr', 'rtl'].includes(story.direction)) errors.push('direction must be ltr or rtl.');
  story.nodes ??= [];
  story.connections ??= [];
  story.chapters ??= [];
  story.media ??= [];
  story.captions ??= [];
  story.sources ??= [];
  story.drawings ??= {};
  for (const key of ['nodes', 'connections', 'chapters', 'media', 'captions', 'sources']) {
    if (!Array.isArray(story[key])) errors.push(`${key} must be an array.`);
    else story[key].forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) errors.push(`${key}[${index}] must be an object.`);
    });
  }
  if (!story.drawings || typeof story.drawings !== 'object' || Array.isArray(story.drawings)) errors.push('drawings must be an object.');
  if (errors.length) throw new Error(errors.join('\n'));
  if (!story.nodes.length) errors.push('At least one illustrated teaching node is required.');
  const ids = new Set();
  const id = (value, path) => {
    if (typeof value !== 'string' || !/^[a-z][a-z0-9-]*$/u.test(value)) errors.push(`${path} must be a lowercase hyphen-separated ID.`);
    if (ids.has(value)) errors.push(`Duplicate ID: ${value}.`);
    ids.add(value);
  };
  const bounds = (item, path) => {
    number(item.x, `${path}.x`); number(item.y, `${path}.y`);
    number(item.width, `${path}.width`, 40); number(item.height, `${path}.height`, 40);
    if (item.x + item.width > story.width || item.y + item.height > story.height) errors.push(`${path} is outside the canvas.`);
  };
  const event = (item, path, durationKey = 'drawDuration') => {
    number(item.at, `${path}.at`); number(item[durationKey], `${path}.${durationKey}`, 1);
    if (item.at + item[durationKey] > story.duration) errors.push(`${path} animation extends beyond the story duration.`);
  };
  let chapterEnd = 0;
  for (const [i, chapter] of story.chapters.entries()) {
    id(chapter.id, `chapters[${i}].id`); string(chapter.title, `chapters[${i}].title`);
    number(chapter.start, `chapters[${i}].start`); number(chapter.end, `chapters[${i}].end`, 1);
    if (chapter.start < chapterEnd || chapter.end <= chapter.start || chapter.end > story.duration) errors.push(`chapters[${i}] has overlapping, reversed, or out-of-range timing.`);
    chapterEnd = chapter.end;
  }
  for (const [i, node] of story.nodes.entries()) {
    const path = `nodes[${i}]`;
    id(node.id, `${path}.id`);
    node.kind ??= 'illustration'; node.at ??= 0; node.drawDuration ??= 1400;
    node.title ??= ''; node.body ??= ''; node.cps ??= 36;
    string(node.title, `${path}.title`, false); string(node.body, `${path}.body`, false);
    if (typeof node.title !== 'string' || typeof node.body !== 'string') continue;
    node.titleAt ??= node.at + node.drawDuration + 120;
    node.bodyAt ??= node.titleAt + typingSchedule(node.title, { cps: node.cps, seed: story.seed }).duration + 180;
    if (!['illustration', 'card', 'note', 'text'].includes(node.kind)) errors.push(`${path}.kind is unsupported.`);
    bounds(node, path); event(node, path);
    string(node.title, `${path}.title`, false); string(node.body, `${path}.body`, false);
    number(node.cps, `${path}.cps`, 1);
    for (const key of ['titleSize', 'bodySize', 'artSize', 'artTop', 'titleOffset', 'bodyOffset', 'haloWidth', 'haloHeight', 'titleMaxLines', 'bodyMaxLines']) if (node[key] !== undefined) number(node[key], `${path}.${key}`, key.endsWith('Lines') ? 1 : 0);
    for (const key of ['kicker', 'role', 'fill']) if (node[key] !== undefined) string(node[key], `${path}.${key}`, false);
    if (node.bodyFont && !FONT_OPTIONS[node.bodyFont]) errors.push(`${path}.bodyFont is unsupported.`);
    if (node.ports) for (const [side, point] of Object.entries(node.ports)) {
      if (!['left', 'right', 'top', 'bottom'].includes(side) || !Array.isArray(point) || point.length !== 2 || point.some((n) => !Number.isFinite(n))) errors.push(`${path}.ports.${side} must be two finite coordinates on a named port.`);
    }
    for (const key of ['titleAt', 'bodyAt']) number(node[key], `${path}.${key}`);
    if (node.titleAt < node.at + node.drawDuration) errors.push(`${path}.titleAt must follow the drawing.`);
    if (node.bodyAt < node.titleAt) errors.push(`${path}.bodyAt must follow the title.`);
    for (const [text, at] of [[node.title, node.titleAt], [node.body, node.bodyAt]]) {
      if (at + typingSchedule(text, { cps: node.cps, seed: story.seed ^ hashString(node.id) }).duration > story.duration) errors.push(`${path} text does not finish within duration.`);
    }
    if (node.chapter && !story.chapters.some((c) => c.id === node.chapter)) errors.push(`${path}.chapter does not exist.`);
    if (node.kind === 'illustration' && !DRAWINGS[node.icon] && !story.drawings[node.icon]) errors.push(`${path}.icon must name a built-in or custom drawing.`);
  }
  const nodeIDs = new Set(story.nodes.map((n) => n.id));
  const ports = ['left', 'right', 'top', 'bottom'];
  for (const [i, edge] of story.connections.entries()) {
    const path = `connections[${i}]`;
    id(edge.id, `${path}.id`); edge.at ??= 0; edge.drawDuration ??= 800;
    edge.fromPort ??= 'right'; edge.toPort ??= 'left'; edge.label ??= '';
    if (!nodeIDs.has(edge.from) || !nodeIDs.has(edge.to) || edge.from === edge.to) errors.push(`${path} endpoints must name two existing, different nodes.`);
    if (!ports.includes(edge.fromPort) || !ports.includes(edge.toPort)) errors.push(`${path} has an invalid port.`);
    string(edge.label, `${path}.label`, false); event(edge, path);
    for (const key of ['labelX', 'labelY']) if (edge[key] !== undefined && !Number.isFinite(edge[key])) errors.push(`${path}.${key} must be finite.`);
    if (edge.color !== undefined) string(edge.color, `${path}.color`);
    if (edge.controlPoints && (!Array.isArray(edge.controlPoints) || edge.controlPoints.length !== 4 || edge.controlPoints.some((n) => !Number.isFinite(n)))) errors.push(`${path}.controlPoints must contain four finite numbers.`);
  }
  for (const [i, media] of story.media.entries()) {
    const path = `media[${i}]`;
    id(media.id, `${path}.id`); bounds(media, path);
    media.at ??= Math.max(0, story.duration - 4500);
    number(media.at, `${path}.at`); string(media.title, `${path}.title`);
    media.caption ??= ''; string(media.caption, `${path}.caption`, false);
    if (!['image', 'video', 'link'].includes(media.kind)) errors.push(`${path}.kind is unsupported.`);
    if (media.kind === 'image') string(media.src, `${path}.src`);
    if (media.kind === 'link') url(media.url, `${path}.url`);
    if (media.kind === 'video' && !media.src && !media.url && media.generated !== 'story') errors.push(`${path} needs video src, an outbound url, or generated: "story".`);
    if (media.url) url(media.url, `${path}.url`);
    if (media.at >= story.duration) errors.push(`${path}.at must be before the story ends.`);
  }
  let captionEnd = 0;
  for (const [i, caption] of story.captions.entries()) {
    number(caption.start, `captions[${i}].start`); number(caption.end, `captions[${i}].end`);
    string(caption.text, `captions[${i}].text`);
    if (caption.start < captionEnd || caption.end <= caption.start || caption.end > story.duration) errors.push(`captions[${i}] has invalid timing.`);
    captionEnd = caption.end;
  }
  for (const [i, source] of story.sources.entries()) {
    string(source.title, `sources[${i}].title`); url(source.url, `sources[${i}].url`);
  }
  if (story.summary) {
    string(story.summary.text, 'summary.text'); story.summary.at ??= story.duration - 6500;
    story.summary.y ??= 687; number(story.summary.at, 'summary.at'); number(story.summary.y, 'summary.y');
    if (story.summary.at >= story.duration) errors.push('summary.at must be before duration.');
  }
  for (const [name, drawing] of Object.entries(story.drawings)) {
    if (!drawing || typeof drawing !== 'object' || !Array.isArray(drawing.strokes) || !drawing.strokes.length) { errors.push(`drawings.${name}.strokes must be a nonempty array.`); continue; }
    for (const [i, stroke] of drawing.strokes.entries()) {
      const path = `drawings.${name}.strokes[${i}]`;
      if (!stroke || typeof stroke !== 'object') { errors.push(`${path} must be an object.`); continue; }
      string(stroke.d, `${path}.d`);
      if (stroke.width !== undefined) number(stroke.width, `${path}.width`, 0.01);
      for (const key of ['fill', 'stroke']) if (stroke[key] !== undefined) string(stroke[key], `${path}.${key}`);
    }
    if (drawing.size !== undefined) number(drawing.size, `drawings.${name}.size`, 1);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return story;
}

export function layoutStory(story, mobile = false) {
  if (!mobile) return story;
  const width = 600;
  const nodes = story.nodes.map((node, index) => ({ ...node, x: 64, y: 340 + index * 372, width: 472, height: 318, ...(story.mobile?.nodes?.[node.id] || {}) }));
  const lastBottom = Math.max(...nodes.map((n) => n.y + n.height));
  const summary = story.summary ? { ...story.summary, y: lastBottom + 72 } : undefined;
  const mediaY = lastBottom + (summary ? 260 : 84);
  const media = story.media.map((item, index) => ({ ...item, x: 64, y: mediaY + index * 166, width: 472, height: 138 }));
  return { ...story, width, height: Math.max(mediaY + media.length * 166 + 55, lastBottom + 170), nodes, summary, media,
    connections: story.connections.map((edge) => ({ ...edge, fromPort: 'bottom', toPort: 'top', controlPoints: undefined, labelX: undefined, labelY: undefined, ...(story.mobile?.connections?.[edge.id] || {}) })), mobileLayout: true };
}

const S = (d, fill = 'none', stroke = 'ink', width = 2.8) => ({ d, fill, stroke, width });
export const DRAWINGS = {
  sun: { size: 160, strokes: [
    S('M112 82 C113 124 47 128 45 83 C42 41 111 39 112 82 Z', 'gold'),
    ...Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return S(`M${80 + Math.cos(a) * 48} ${82 + Math.sin(a) * 48} Q${80 + Math.cos(a) * 57 + 0.7} ${82 + Math.sin(a) * 57 - 0.5} ${80 + Math.cos(a) * 69} ${82 + Math.sin(a) * 69}`); }),
    S('M59 91 Q80 105 100 90', 'none', 'ink', 2), S('M67 72 L69 73 M93 71 L95 72', 'none', 'ink', 3),
  ] },
  panel: { size: 160, strokes: [
    S('M26 33 Q82 34 133 28 L148 116 Q81 121 13 128 Z', 'lilac'),
    S('M34 43 L125 39 L136 107 L26 116 Z', 'surface', 'ink', 1.8),
    S('M55 42 L51 113 M78 41 L80 111 M101 40 L108 108', 'none', 'accent', 1.6),
    S('M31 65 L129 58 M28 89 L134 82', 'none', 'accent', 1.6),
    S('M55 124 L51 144 L36 145 M106 119 L114 138 L128 138'),
    S('M147 134 L156 127 M146 144 L158 145', 'none', 'gold', 3.2),
  ] },
  inverter: { size: 160, strokes: [
    S('M42 20 Q34 20 34 32 L33 130 Q33 140 45 140 L115 140 Q127 140 127 128 L127 31 Q126 20 114 20 Z', 'lilac'),
    S('M45 34 L115 34 L115 73 L45 73 Z', 'surface', 'ink', 1.8),
    S('M52 54 L72 54 M80 53 C86 35 96 74 107 53', 'none', 'accent', 2.8),
    S('M54 90 L107 90 M54 99 L107 99 M54 108 L91 108', 'none', 'ink', 1.7),
    S('M76 122 A4 4 0 1 0 84 122 A4 4 0 1 0 76 122', 'mint', 'ink', 1.8),
    S('M33 119 L16 119 L16 103 M127 119 L144 119 L144 102'),
  ] },
  house: { size: 160, strokes: [
    S('M26 68 L26 138 L134 138 L134 68 L80 23 Z', 'surface'),
    S('M12 77 L79 15 Q115 45 148 77', 'none', 'ink', 3.5),
    S('M105 36 L105 18 L124 18 L124 54', 'surface'),
    S('M43 80 L66 80 L66 106 L43 106 Z', 'gold', 'ink', 2.2),
    S('M93 80 L116 80 L116 106 L93 106 Z', 'gold', 'ink', 2.2),
    S('M68 138 L68 111 Q82 104 91 111 L91 138', 'lilac'),
    S('M54 81 L54 105 M94 93 L115 93', 'none', 'ink', 1.5),
    S('M16 144 L145 144', 'none', 'ink', 2),
    S('M137 139 C125 116 148 111 148 91 C163 111 158 128 137 139 Z', 'mint', 'ink', 1.8),
  ] },
  server: { size: 160, strokes: [
    S('M30 19 L130 19 L130 142 L30 142 Z', 'lilac'),
    ...[31, 68, 105].map((y) => S(`M42 ${y} L118 ${y} L118 ${y + 25} L42 ${y + 25} Z`, 'surface', 'ink', 1.8)),
    S('M50 43 L54 43 M50 80 L54 80 M50 117 L54 117', 'none', 'mint', 4),
    S('M75 43 L108 43 M75 80 L108 80 M75 117 L108 117', 'none', 'ink', 1.7),
  ] },
  leaf: { size: 160, strokes: [
    S('M31 127 C11 45 75 27 139 20 C142 99 91 144 31 127 Z', 'mint'),
    S('M18 145 Q67 92 123 36', 'none', 'ink', 3),
    S('M53 108 L46 73 M75 88 L69 52 M94 69 L119 70 M68 98 L106 102', 'none', 'ink', 1.7),
  ] },
  book: { size: 160, strokes: [
    S('M79 37 Q51 17 16 31 L16 132 Q49 119 79 141 Q111 121 145 132 L145 30 Q109 17 79 37 Z', 'surface'),
    S('M79 39 L79 139'), S('M29 51 Q51 43 67 55 M29 73 Q51 66 67 76 M29 95 Q51 88 67 101', 'none', 'accent', 2),
    S('M95 52 Q113 42 132 52 M95 74 Q113 64 132 74 M95 96 Q113 86 132 96', 'none', 'accent', 2),
  ] },
  cloud: { size: 160, strokes: [
    S('M31 116 C1 114 5 73 31 71 C24 32 77 20 91 52 C117 29 144 49 137 77 C168 79 158 121 132 117 Z', 'lilac'),
    S('M57 133 L57 146 M80 135 L80 152 M103 132 L103 146', 'none', 'accent', 2.5),
  ] },
};

const SVG_NS = 'http://www.w3.org/2000/svg';
function element(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) if (value !== undefined) node.setAttribute(key, String(value));
  if (parent) parent.append(node);
  return node;
}

export class BoardRenderer {
  constructor(story, { style = story.style, font = story.font, mobile = false, fontCSS = '', notices = '' } = {}) {
    this.story = layoutStory(story, mobile);
    this.theme = THEMES[style];
    this.fontKey = font;
    this.display = FONT_OPTIONS[font];
    this.body = FONT_OPTIONS.nunito;
    this.fontCSS = fontCSS;
    this.notices = notices;
    this.mobile = mobile;
    this.strokes = []; this.texts = []; this.fades = []; this.arrows = []; this.mediaTargets = [];
    this.layoutErrors = [];
    this.measureContext = document.createElement('canvas').getContext('2d');
    this.svg = element('svg', { xmlns: SVG_NS, viewBox: `0 0 ${this.story.width} ${this.story.height}`, width: this.story.width, height: this.story.height, role: 'img', 'aria-label': `${story.title.replace(/\n/g, ' ')}. An illustrated visual explanation.`, 'data-board': 'true' });
    this.build();
    this.renderAt(story.duration);
  }

  color(name = 'ink') { return this.theme[name] || name; }

  measure(text, family, size, weight = 400) {
    this.measureContext.font = `${weight} ${size}px ${family}`;
    return this.measureContext.measureText(text).width;
  }

  text(parent, text, { x, y, width, size = 22, font = this.display, color = 'ink', at = 0, cps = 36, lineHeight = size * 1.3, maxLines, name = 'text', direction = this.story.direction } = {}) {
    const measure = (s) => this.measure(s, font.family, size, font.weight);
    const lines = wrapText(text, width, measure);
    if (maxLines && lines.length > maxLines) this.layoutErrors.push(`${name}: ${lines.length} lines exceed the available ${maxLines}.`);
    const schedule = typingSchedule(lines.join('\n'), { cps, seed: this.story.seed ^ hashString(`${name}:${text}`) });
    const group = element('g', { 'data-text': name, 'aria-hidden': 'true' }, parent);
    let offset = 0;
    const lineRefs = lines.map((line, index) => {
      const chars = graphemes(line);
      const node = element('text', { x: direction === 'rtl' ? x + width : x, y: y + index * lineHeight, 'font-family': font.family, 'font-size': size, 'font-weight': font.weight, fill: this.color(color), direction, 'text-anchor': direction === 'rtl' ? 'end' : 'start', 'unicode-bidi': 'plaintext', 'xml:space': 'preserve' }, group);
      const result = { node, chars, offset, y: y + index * lineHeight };
      offset += chars.length + 1;
      return result;
    });
    this.texts.push({ lineRefs, schedule, at, x, width, size, font, measure, direction, group, name });
    if (at + schedule.duration > this.story.duration) this.layoutErrors.push(`${name}: wrapped text does not finish before the story ends.`);
    return group;
  }

  path(parent, stroke, { at = 0, duration = 1000, transform = { x: 0, y: 0, scale: 1 }, name } = {}) {
    const path = element('path', { d: stroke.d, fill: this.color(stroke.fill || 'none'), stroke: this.color(stroke.stroke || 'ink'), 'stroke-width': stroke.width || 2.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'fill-opacity': 0, 'data-stroke': name }, parent);
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length === 0) this.layoutErrors.push(`${name || 'drawing'}: invalid or empty path.`);
    path.setAttribute('stroke-dasharray', `${length} ${length}`);
    this.strokes.push({ path, length, at, duration, transform });
    return path;
  }

  drawing(parent, drawing, x, y, size, at, duration, name) {
    const scale = size / (drawing.size || 160);
    const group = element('g', { transform: `translate(${x} ${y}) scale(${scale})`, 'data-drawing': name }, parent);
    const lengths = drawing.strokes.map((stroke) => { const path = element('path', { d: stroke.d }, group); const length = path.getTotalLength(); path.remove(); return Math.max(length, 16); });
    const total = lengths.reduce((a, b) => a + b, 0);
    let cursor = at;
    drawing.strokes.forEach((stroke, index) => {
      const span = duration * lengths[index] / total;
      this.path(group, stroke, { at: cursor, duration: span, transform: { x, y, scale }, name: `${name}-${index}` });
      cursor += span;
    });
    return group;
  }

  build() {
    const { width, height } = this.story;
    const defs = element('defs', {}, this.svg);
    const pattern = element('pattern', { id: 'paper-texture', width: this.theme.texture === 'ruled' ? 32 : 24, height: this.theme.texture === 'ruled' ? 32 : 24, patternUnits: 'userSpaceOnUse' }, defs);
    if (this.theme.texture === 'dots') element('circle', { cx: 2, cy: 2, r: 0.85, fill: this.color('ink'), opacity: 0.07 }, pattern);
    if (this.theme.texture === 'grid') element('path', { d: 'M24 0 H0 V24', fill: 'none', stroke: this.color('line'), 'stroke-width': 0.8, opacity: 0.5 }, pattern);
    if (this.theme.texture === 'ruled') element('path', { d: 'M0 31 H32', fill: 'none', stroke: this.color('line'), 'stroke-width': 0.8, opacity: 0.45 }, pattern);
    element('rect', { width, height, fill: this.color('paper') }, this.svg);
    if (this.theme.texture !== 'none') element('rect', { width, height, fill: 'url(#paper-texture)' }, this.svg);
    if (this.theme.texture === 'ruled') element('line', { x1: 45, y1: 0, x2: 45, y2: height, stroke: this.color('coral'), 'stroke-width': 1, opacity: 0.35 }, this.svg);
    this.content = element('g', {}, this.svg);
    this.header();
    // Connections are underneath drawings/text and are routed through the gaps.
    for (const edge of this.story.connections) this.connection(edge);
    this.story.nodes.forEach((node, index) => this.node(node, index));
    if (this.story.summary) this.summary(this.story.summary);
    for (const item of this.story.media) this.media(item);
    const footer = element('text', { x: 64, y: height - 23, fill: this.color('muted'), 'font-family': this.body.family, 'font-size': this.mobile ? 16 : 13, 'font-weight': 500 }, this.content);
    footer.textContent = 'ILLUSTRATED WITH CODE  /  MONAMOTRON VISUAL STORIES';
    this.cursor = element('g', { opacity: 0, 'aria-hidden': 'true', 'data-cursor': 'true' }, this.svg);
    element('circle', { cx: 0, cy: 0, r: 7, fill: this.color('paper'), stroke: this.color('ink'), 'stroke-width': 1.6 }, this.cursor);
    element('path', { d: 'M-3 3 L4 -4 L7 -1 L0 6 Z', fill: this.color('accent'), stroke: this.color('ink'), 'stroke-width': 1 }, this.cursor);
    this.captionGroup = element('g', { opacity: 0, 'data-caption': 'true' }, this.svg);
    element('rect', { x: 32, y: height - 70, width: width - 64, height: 54, rx: 10, fill: this.color('ink') }, this.captionGroup);
    this.captionText = element('text', { x: width / 2, y: height - 37, 'text-anchor': 'middle', 'font-family': this.body.family, 'font-size': this.mobile ? 17 : 20, 'font-weight': 500, fill: this.color('paper') }, this.captionGroup);
  }

  header() {
    const width = this.mobile ? 472 : Math.min(890, this.story.width - 128);
    this.text(this.content, this.story.eyebrow, { x: 64, y: 66, width, size: this.mobile ? 16 : 14, font: this.body, color: 'muted', at: 0, cps: 70, maxLines: 1, name: 'eyebrow' });
    this.text(this.content, this.story.title, { x: 64, y: this.mobile ? 132 : 144, width, size: this.mobile ? 51 : 70, lineHeight: this.mobile ? 60 : 77, at: 250, cps: 30, maxLines: 2, name: 'hero-title' });
    this.text(this.content, this.story.subtitle, { x: 68, y: this.mobile ? 255 : 261, width: this.mobile ? 464 : 940, size: this.mobile ? 21 : 22, font: this.body, at: 2050, cps: 54, lineHeight: 28, maxLines: this.mobile ? 3 : 2, name: 'subtitle' });
    if (!this.mobile && this.story.headerNote) {
      const group = element('g', { transform: `rotate(-4 ${this.story.width - 237} 145)` }, this.content);
      this.text(group, this.story.headerNote, { x: this.story.width - 363, y: 128, width: 294, size: 26, font: FONT_OPTIONS.excalifont, at: 1350, cps: 40, maxLines: 3, name: 'header-note' });
      this.path(group, S(`M${this.story.width - 357} 185 Q${this.story.width - 235} 191 ${this.story.width - 118} 182`, 'none', 'gold', 7), { at: 3000, duration: 650, name: 'note-underline' });
      this.path(group, S(`M${this.story.width - 102} 200 Q${this.story.width - 76} 221 ${this.story.width - 84} 243 M${this.story.width - 94} 235 L${this.story.width - 84} 245 L${this.story.width - 75} 235`, 'none', 'muted', 2), { at: 3700, duration: 500, name: 'note-arrow' });
    }
  }

  node(node, index) {
    const group = element('g', { 'data-node': node.id, 'aria-hidden': 'true' }, this.content);
    const { x, y, width, height } = node;
    if (node.kind === 'card' || node.kind === 'note') {
      const jitter = this.theme.roughness;
      const r = seededRandom(this.story.seed ^ hashString(node.id));
      const d = `M${x + jitter * r()} ${y + 2} Q${x + width / 2} ${y - jitter} ${x + width - 2} ${y + 2} L${x + width} ${y + height - 2} Q${x + width / 2} ${y + height + jitter} ${x + 1} ${y + height} Z`;
      this.path(group, S(d, node.kind === 'note' ? (node.fill || 'gold') : 'surface', 'ink', 1.8), { at: node.at, duration: node.drawDuration, name: `${node.id}-frame` });
    }
    if (node.kind === 'illustration') {
      const size = Math.min(node.artSize || 184, width - 45);
      const artX = x + (width - size) / 2;
      const artY = y + (node.artTop ?? 37);
      const haloWidth = node.haloWidth ?? size * 1.16;
      const haloHeight = node.haloHeight ?? size * 1.06;
      const halo = element('ellipse', { cx: x + width / 2, cy: artY + haloHeight / 2, rx: haloWidth / 2, ry: haloHeight / 2, fill: this.color(node.fill || 'surface'), opacity: 0 }, group);
      this.fades.push({ element: halo, at: node.at, duration: 700, opacity: 0.6 });
      this.drawing(group, this.story.drawings[node.icon] || DRAWINGS[node.icon], artX, artY, size, node.at, node.drawDuration, node.id);
      this.text(group, node.kicker || `${String(index + 1).padStart(2, '0')} / ${node.role || 'THE NEXT IDEA'}`, { x: x + 16, y: y + 15, width: width - 32, size: 13, font: this.body, color: 'muted', at: node.at, cps: 90, maxLines: 1, name: `${node.id}-kicker` });
    }
    const titleY = y + (node.titleOffset ?? (node.kind === 'illustration' ? 246 : 45));
    this.text(group, node.title, { x: x + 16, y: titleY, width: width - 32, size: node.titleSize || 30, at: node.titleAt, cps: node.cps, maxLines: node.titleMaxLines ?? (node.kind === 'illustration' ? 1 : 2), name: `${node.id}-title` });
    const bodyY = y + (node.bodyOffset ?? (node.kind === 'illustration' ? 284 : 100));
    this.text(group, node.body, { x: x + 17, y: bodyY, width: width - 34, size: node.bodySize || 20, font: node.bodyFont ? FONT_OPTIONS[node.bodyFont] : this.body, at: node.bodyAt, cps: node.cps, lineHeight: 27, maxLines: node.bodyMaxLines ?? (node.kind === 'illustration' ? Math.floor((height - 276) / 27) + 1 : Math.floor((height - 94) / 27)), name: `${node.id}-body` });
  }

  port(node, side) {
    const { x, y, width, height } = node;
    if (node.ports?.[side]) return { x: x + node.ports[side][0], y: y + node.ports[side][1] };
    if (side === 'left') return { x: x - 8, y: y + 127 };
    if (side === 'right') return { x: x + width + 8, y: y + 127 };
    if (side === 'top') return { x: x + width / 2, y: y - 8 };
    return { x: x + width / 2, y: y + height + 8 };
  }

  connection(edge) {
    const start = this.port(this.story.nodes.find((n) => n.id === edge.from), edge.fromPort);
    const end = this.port(this.story.nodes.find((n) => n.id === edge.to), edge.toPort);
    const vertical = ['top', 'bottom'].includes(edge.fromPort);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const jitter = this.theme.roughness * 3;
    const points = edge.controlPoints || (vertical ? [start.x + jitter, start.y + dy * 0.35, end.x - jitter, end.y - dy * 0.35] : [start.x + dx * 0.35, start.y - 10 - jitter, end.x - dx * 0.35, end.y + 7 + jitter]);
    const group = element('g', { 'data-edge': edge.id }, this.content);
    const path = this.path(group, S(`M${start.x} ${start.y} C${points[0]} ${points[1]} ${points[2]} ${points[3]} ${end.x} ${end.y}`, 'none', edge.color || 'ink', 2.4), { at: edge.at, duration: edge.drawDuration, name: edge.id });
    const angle = Math.atan2(end.y - points[3], end.x - points[2]);
    const tip = element('path', { d: `M${end.x - 10 * Math.cos(angle - 0.55)} ${end.y - 10 * Math.sin(angle - 0.55)} L${end.x} ${end.y} L${end.x - 10 * Math.cos(angle + 0.55)} ${end.y - 10 * Math.sin(angle + 0.55)}`, fill: 'none', stroke: this.color(edge.color || 'ink'), 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, group);
    this.arrows.push({ tip, at: edge.at, duration: edge.drawDuration });
    const labelWidth = vertical ? 180 : Math.max(60, Math.abs(dx) + 36);
    const labelX = edge.labelX ?? (vertical ? start.x + 30 : (start.x + end.x - labelWidth) / 2);
    const labelY = edge.labelY ?? (vertical ? (start.y + end.y) / 2 + 5 : Math.min(start.y, end.y) - 24);
    this.text(group, edge.label, { x: labelX, y: labelY, width: labelWidth, size: vertical ? 17 : 16, font: this.display, color: 'muted', at: edge.at + edge.drawDuration, cps: 36, lineHeight: 20, maxLines: vertical ? 2 : 2, name: `${edge.id}-label` });
    return path;
  }

  summary(summary) {
    const group = element('g', { 'data-summary': 'true' }, this.content);
    element('line', { x1: 64, y1: summary.y - 33, x2: this.story.width - 64, y2: summary.y - 33, stroke: this.color('line'), 'stroke-width': 1 }, group);
    this.path(group, S(`M72 ${summary.y + 8} Q159 ${summary.y - 1} 255 ${summary.y + 6}`, 'none', 'gold', 18), { at: summary.at, duration: 450, name: 'takeaway-swash' });
    this.text(group, summary.title || 'The big idea', { x: 81, y: summary.y + 12, width: 196, size: 26, at: summary.at + 400, cps: 42, maxLines: 1, name: 'summary-title' });
    this.text(group, summary.text, { x: this.mobile ? 80 : 300, y: summary.y + (this.mobile ? 58 : 10), width: this.mobile ? 440 : this.story.width - 365, size: this.mobile ? 23 : 24, font: this.body, at: summary.at + 850, cps: 42, lineHeight: 31, maxLines: this.mobile ? 4 : 2, name: 'summary-body' });
  }

  media(item) {
    const group = element('g', { 'data-media': item.id, role: 'button', tabindex: 0, 'aria-label': `${item.title}. ${item.caption}`, opacity: 0, cursor: 'pointer' }, this.content);
    const { x, y, width, height } = item;
    element('rect', { x, y, width, height, rx: 13, fill: this.color('surface'), stroke: this.color('line'), 'stroke-width': 1 }, group);
    const thumb = this.mobile ? 112 : 88;
    const thumbX = x + 12;
    const thumbY = y + 12;
    element('rect', { x: thumbX, y: thumbY, width: thumb, height: height - 24, rx: 9, fill: this.color(item.kind === 'video' ? 'lilac' : item.kind === 'image' ? 'mint' : 'gold'), opacity: 0.65 }, group);
    if (item.src && item.kind === 'image' || item.poster) {
      const src = item.poster || item.src;
      const clipId = `thumb-${item.id}`;
      const clip = element('clipPath', { id: clipId }, this.svg.querySelector('defs'));
      element('rect', { x: thumbX, y: thumbY, width: thumb, height: height - 24, rx: 9 }, clip);
      element('image', { x: thumbX, y: thumbY, width: thumb, height: height - 24, href: src, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${clipId})` }, group);
    } else {
      const cx = thumbX + thumb / 2;
      const cy = y + height / 2;
      element('path', { d: item.kind === 'video' ? `M${cx - 9} ${cy - 15} L${cx + 16} ${cy} L${cx - 9} ${cy + 15} Z` : `M${cx - 14} ${cy + 11} L${cx + 11} ${cy - 14} M${cx - 10} ${cy - 14} H${cx + 11} V${cy + 7}`, fill: item.kind === 'video' ? this.color('ink') : 'none', stroke: this.color('ink'), 'stroke-width': 2.5, 'stroke-linecap': 'round' }, group);
    }
    const textX = x + thumb + 26;
    const textWidth = width - thumb - 43;
    this.text(group, item.title, { x: textX, y: y + (this.mobile ? 40 : 34), width: textWidth, size: this.mobile ? 21 : 20, font: this.body, at: item.at + 180, cps: 58, maxLines: 2, lineHeight: 25, name: `${item.id}-title` });
    this.text(group, item.caption, { x: textX, y: y + (this.mobile ? 95 : 75), width: textWidth, size: this.mobile ? 17 : 14, font: this.body, color: 'muted', at: item.at + 800, cps: 65, maxLines: 2, lineHeight: 19, name: `${item.id}-caption` });
    this.fades.push({ element: group, at: item.at, duration: 400, opacity: 1 });
    this.mediaTargets.push({ group, item });
  }

  renderAt(time, { cursor = true, captions = false } = {}) {
    const t = clamp(time, 0, this.story.duration);
    let pen;
    for (const stroke of this.strokes) {
      const p = progress(t, stroke.at, stroke.duration);
      stroke.path.setAttribute('stroke-dashoffset', String(stroke.length * (1 - p)));
      stroke.path.setAttribute('stroke-opacity', p > 0 ? '1' : '0');
      stroke.path.setAttribute('fill-opacity', String(ease(clamp((p - 0.6) / 0.4))));
      if (p > 0 && p < 1) {
        const point = stroke.path.getPointAtLength(stroke.length * p);
        pen = { x: stroke.transform.x + point.x * stroke.transform.scale, y: stroke.transform.y + point.y * stroke.transform.scale };
      }
    }
    for (const arrow of this.arrows) arrow.tip.setAttribute('opacity', String(progress(t, arrow.at + arrow.duration * 0.92, arrow.duration * 0.08)));
    for (const fade of this.fades) {
      const opacity = ease(progress(t, fade.at, fade.duration)) * fade.opacity;
      fade.element.setAttribute('opacity', String(opacity));
      if (fade.element.hasAttribute('data-media')) {
        fade.element.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        fade.element.setAttribute('tabindex', opacity < 0.1 ? '-1' : '0');
        fade.element.setAttribute('aria-hidden', opacity < 0.1 ? 'true' : 'false');
      }
    }
    for (const text of this.texts) {
      const count = visibleCount(text.schedule.times, t - text.at);
      for (const line of text.lineRefs) {
        const n = clamp(count - line.offset, 0, line.chars.length);
        const value = line.chars.slice(0, n).join('');
        if (line.node.textContent !== value) line.node.textContent = value;
        if (n > 0 && n < line.chars.length && !pen) pen = { x: text.direction === 'rtl' ? text.x + text.width - text.measure(value) : text.x + text.measure(value), y: line.y - text.size * 0.4 };
      }
    }
    this.cursor.setAttribute('opacity', cursor && pen ? '0.85' : '0');
    if (pen) this.cursor.setAttribute('transform', `translate(${pen.x} ${pen.y})`);
    const caption = this.story.captions.find((c) => t >= c.start && t < c.end) || (t === this.story.duration ? this.story.captions.at(-1) : undefined);
    this.captionText.textContent = caption?.text || '';
    this.captionGroup.setAttribute('opacity', captions && caption ? '1' : '0');
    this.time = t;
    return this;
  }

  serialize(time = this.story.duration, { captions = false, width = this.story.width } = {}) {
    const previousTime = this.time;
    this.renderAt(time, { cursor: false, captions });
    const clone = this.svg.cloneNode(true);
    clone.querySelector('[data-cursor]')?.remove();
    clone.setAttribute('width', width);
    clone.setAttribute('height', Math.round(width * this.story.height / this.story.width));
    clone.removeAttribute('role');
    const style = element('style');
    style.textContent = this.fontCSS;
    clone.insertBefore(style, clone.firstChild);
    const metadata = element('metadata');
    metadata.textContent = `${this.story.title}\nMonamotron\n${this.notices}`;
    clone.insertBefore(metadata, clone.firstChild);
    const output = new XMLSerializer().serializeToString(clone);
    this.renderAt(previousTime);
    return output;
  }

  async paintTo(canvas, time, { captions = false } = {}) {
    const serialized = this.serialize(time, { captions, width: canvas.width });
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = this.theme.paper;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    } finally { URL.revokeObjectURL(url); }
  }
}
