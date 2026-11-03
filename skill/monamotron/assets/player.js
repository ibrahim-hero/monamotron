(() => {
  'use strict';
  const { BoardRenderer, THEMES, FONT_OPTIONS, validateStory, clamp } = window.MonamotronCore;
  const story = validateStory(JSON.parse(document.getElementById('story-data').textContent));
  const fontCSS = document.getElementById('font-styles').textContent;
  const notices = document.getElementById('font-notice-data').textContent;
  const $ = (id) => document.getElementById(id);
  const state = { time: story.duration, playing: false, style: story.style, font: story.font, speed: 1, busy: false };
  const narrow = matchMedia('(max-width:700px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let renderer;
  let frame;
  let lastTick;
  let noticeTimer;
  let stopPreview;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const formatTime = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const slug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'monamotron';

  function notify(text, persistent = false) {
    clearTimeout(noticeTimer);
    $('notice').textContent = text;
    $('notice').classList.add('visible');
    if (!persistent) noticeTimer = setTimeout(() => $('notice').classList.remove('visible'), 4500);
  }

  async function loadFonts() {
    const required = [
      ['400 24px Excalifont', 'Monamotron Ω Привет'],
      ['400 24px Virgil', 'Monamotron visual story'],
      ['500 24px Nunito', 'Monamotron visual story'],
    ];
    for (const [font, sample] of required) {
      const loaded = await document.fonts.load(font, sample);
      if (!loaded.length || !document.fonts.check(font, sample)) throw new Error(`Required font did not load: ${font}`);
    }
    await document.fonts.ready;
  }

  function options(select, items) {
    for (const [key, value] of Object.entries(items)) {
      const option = document.createElement('option'); option.value = key; option.textContent = value.name; select.append(option);
    }
  }

  function setPalette() {
    const theme = THEMES[state.style];
    for (const name of ['paper', 'ink', 'muted', 'surface', 'line', 'accent']) document.documentElement.style.setProperty(`--${name}`, theme[name]);
    document.documentElement.style.setProperty('--shell', theme.paper === '#ffffff' ? '#eef0f4' : theme.surface);
    $('style-select').value = state.style;
    $('font-select').value = state.font;
  }

  function rebuild() {
    setPalette();
    renderer = new BoardRenderer(story, { style: state.style, font: state.font, mobile: narrow.matches, fontCSS, notices });
    renderer.renderAt(state.time, { cursor: state.playing && !reduced.matches });
    $('board-mount').replaceChildren(renderer.svg);
    for (const { group, item } of renderer.mediaTargets) {
      group.addEventListener('click', () => openMedia(item));
      group.addEventListener('keydown', (event) => {
        if (['Enter', ' '].includes(event.key)) { event.preventDefault(); event.stopPropagation(); openMedia(item); }
      });
    }
    updateControls();
  }

  function updateControls() {
    const complete = state.time >= story.duration;
    $('play-label').textContent = reduced.matches ? 'Show full board' : state.playing ? 'Pause the story' : complete ? 'Watch it unfold' : 'Continue the story';
    $('play-icon').textContent = state.playing ? 'Ⅱ' : '▶';
    $('play-button').setAttribute('aria-label', $('play-label').textContent);
    $('timeline').value = state.time;
    $('time-display').textContent = `${formatTime(state.time)} / ${formatTime(story.duration)}`;
    const caption = story.captions.find((c) => state.time >= c.start && state.time < c.end) || (complete ? story.captions.at(-1) : undefined);
    $('caption-text').textContent = caption?.text || 'Follow the drawings, one idea at a time.';
    for (const button of $('chapter-nav').children) {
      const chapter = story.chapters.find((c) => c.id === button.dataset.chapter);
      button.setAttribute('aria-current', state.time >= chapter.start && (state.time < chapter.end || complete && chapter.end === story.duration) ? 'true' : 'false');
    }
  }

  function pause() {
    state.playing = false;
    cancelAnimationFrame(frame);
    renderer?.renderAt(state.time, { cursor: false });
    updateControls();
  }

  function seek(time) {
    state.time = clamp(Number(time), 0, story.duration);
    lastTick = performance.now();
    renderer.renderAt(state.time, { cursor: state.playing && !reduced.matches });
    updateControls();
  }

  function play() {
    if (state.busy) return;
    if (reduced.matches) { pause(); seek(story.duration); return; }
    if (state.time >= story.duration) seek(0);
    if (state.playing) return;
    state.playing = true;
    lastTick = performance.now();
    updateControls();
    frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.playing) return;
    state.time = Math.min(story.duration, state.time + (now - lastTick) * state.speed);
    lastTick = now;
    renderer.renderAt(state.time, { cursor: true });
    updateControls();
    if (state.time >= story.duration) pause();
    else frame = requestAnimationFrame(tick);
  }

  function chapterUI() {
    story.chapters.forEach((chapter, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.chapter = chapter.id;
      const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0');
      button.append(number, chapter.title);
      button.addEventListener('click', () => { pause(); seek(reduced.matches ? chapter.end : chapter.start); });
      $('chapter-nav').append(button);
    });
  }

  function transcriptUI() {
    const container = $('transcript-content');
    const title = document.createElement('h2'); title.textContent = story.title.replace(/\n/g, ' '); container.append(title);
    const intro = document.createElement('p'); intro.textContent = story.subtitle; container.append(intro);
    for (const chapter of story.chapters) {
      const heading = document.createElement('h3'); heading.textContent = chapter.title;
      const text = document.createElement('p'); text.textContent = chapter.explanation || story.nodes.filter((n) => n.chapter === chapter.id).map((n) => `${n.title}: ${n.body.replace(/\n/g, ' ')}`).join(' ');
      container.append(heading, text);
    }
    if (story.summary) { const text = document.createElement('p'); text.textContent = story.summary.text; container.append(text); }
    if (story.sources.length) {
      const heading = document.createElement('h3'); heading.textContent = 'Sources & further reading'; container.append(heading);
      const list = document.createElement('ul');
      for (const source of story.sources) {
        const item = document.createElement('li'); const link = document.createElement('a');
        link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.title;
        item.append(link);
        if (source.checked) item.append(` · checked ${source.checked}`);
        list.append(item);
      }
      container.append(list);
    }
    $('notices-content').textContent = notices;
  }

  function exportRenderer() { return new BoardRenderer(story, { style: state.style, font: state.font, mobile: false, fontCSS, notices }); }

  async function exportPNG({ width = 2160, time = story.duration, captions = false } = {}) {
    await ready;
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = Math.round(width * story.height / story.width);
    await exportRenderer().paintTo(canvas, time, { captions });
    const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('PNG encoding failed.')), 'image/png'));
    return { blob, width: canvas.width, height: canvas.height };
  }

  function setBusy(value) {
    state.busy = value;
    for (const node of document.querySelectorAll('button,select,input')) node.disabled = value;
    $('export-menu').style.pointerEvents = value ? 'none' : '';
  }

  async function exportVideo({ width = 1280, fps = 24, start = 0, end = story.duration, finalHold = 1000, captions = true, onProgress } = {}) {
    await ready;
    if (state.busy) throw new Error('An export is already running.');
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser does not support Canvas video recording. Use Chromium/Edge or a frame-rendering tool.');
    if (![width, fps, start, end, finalHold].every(Number.isFinite) || width < 320 || fps < 1 || fps > 60 || start < 0 || end <= start || end > story.duration || finalHold < 0) throw new Error('Invalid video size, frame rate, or time range.');
    const mime = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
    if (!mime) throw new Error('A supported WebM recorder was not found.');
    pause();
    setBusy(true);
    let stream;
    let recorder;
    try {
      const board = exportRenderer();
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width / 2) * 2;
      canvas.height = Math.round(canvas.width * story.height / story.width / 2) * 2;
      await board.paintTo(canvas, start, { captions });
      stream = canvas.captureStream(fps);
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });
      const chunks = [];
      let rejectStopped;
      const stopped = new Promise((resolve, reject) => { rejectStopped = reject; recorder.addEventListener('stop', resolve, { once: true }); });
      recorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener('error', (event) => rejectStopped(event.error || new Error('Video recording failed.')));
      recorder.start(250);
      const begin = performance.now();
      const span = end - start;
      let elapsed = 0;
      while (elapsed < span) {
        const frameStart = performance.now();
        elapsed = Math.min(span, frameStart - begin);
        await board.paintTo(canvas, start + elapsed, { captions });
        onProgress?.(clamp(elapsed / (span + finalHold)));
        if (recorder.state !== 'recording') throw new Error('Video recording stopped unexpectedly.');
        await wait(Math.max(0, 1000 / fps - (performance.now() - frameStart)));
      }
      await board.paintTo(canvas, end, { captions });
      await wait(finalHold);
      const actualDuration = performance.now() - begin;
      recorder.stop();
      await stopped;
      if (!chunks.length) throw new Error('The recorder produced no video data.');
      const original = new Blob(chunks, { type: 'video/webm' });
      const corrected = window.MonamotronVideo.withWebMDuration(await original.arrayBuffer(), actualDuration);
      const blob = new Blob([corrected], { type: 'video/webm' });
      onProgress?.(1);
      return { blob, mime: 'video/webm', codec: mime, duration: actualDuration / 1000, width: canvas.width, height: canvas.height, fps };
    } finally {
      if (recorder?.state === 'recording') recorder.stop();
      stream?.getTracks().forEach((track) => track.stop());
      setBusy(false);
      updateControls();
    }
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  async function runExport(kind) {
    $('export-menu').open = false;
    try {
      if (kind === 'svg') { download(new Blob([exportRenderer().serialize()], { type: 'image/svg+xml' }), `${slug}.svg`); notify('Editable SVG exported, with the fonts embedded.'); }
      if (kind === 'png') { const result = await exportPNG(); download(result.blob, `${slug}.png`); notify('High-resolution PNG exported.'); }
      if (kind === 'scene') { download(new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' }), `${slug}.json`); notify('Scene JSON exported with its embedded media.'); }
      if (kind === 'video') {
        notify('Rendering the video from code. Keep this tab open…', true);
        const result = await exportVideo({ onProgress: (p) => notify(`Rendering WebM · ${Math.round(p * 100)}%`, true) });
        download(result.blob, `${slug}.webm`); notify('Your animated whiteboard video is ready.');
      }
    } catch (error) { notify(error.message); console.error(error); }
  }

  async function openMedia(item) {
    if (state.busy) return;
    if (item.url && !item.src && item.generated !== 'story') { window.open(item.url, '_blank', 'noopener,noreferrer'); return; }
    pause();
    stopPreview?.();
    $('media-title').textContent = item.title;
    $('media-caption').textContent = item.caption;
    $('media-content').replaceChildren();
    $('dialog-export').hidden = item.generated !== 'story';
    if (item.kind === 'image') {
      const image = document.createElement('img'); image.src = item.src; image.alt = item.title; $('media-content').append(image);
    } else if (item.src) {
      const video = document.createElement('video'); video.src = item.src; video.controls = true; video.playsInline = true;
      if (item.poster) video.poster = item.poster;
      $('media-content').append(video);
      stopPreview = () => { video.pause(); video.removeAttribute('src'); video.load(); };
    } else {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = Math.round(960 * story.height / story.width);
      $('media-content').append(canvas);
      const board = exportRenderer();
      let cancelled = false;
      let pending = false;
      let previewFrame;
      const begin = performance.now();
      const previewTick = async (now) => {
        if (cancelled) return;
        if (!pending) {
          pending = true;
          try { await board.paintTo(canvas, reduced.matches ? story.duration : Math.min(story.duration, now - begin), { captions: true }); }
          catch (error) { notify(error.message); cancelled = true; }
          finally { pending = false; }
        }
        if (!cancelled && now - begin < story.duration && !reduced.matches) previewFrame = requestAnimationFrame(previewTick);
      };
      stopPreview = () => { cancelled = true; cancelAnimationFrame(previewFrame); };
      previewFrame = requestAnimationFrame(previewTick);
    }
    $('media-dialog').showModal();
  }

  function audit() {
    const saved = renderer.time;
    renderer.renderAt(story.duration, { cursor: false });
    const errors = [...renderer.layoutErrors];
    for (const text of renderer.svg.querySelectorAll('text')) {
      if (!text.textContent || text.closest('[data-caption]')) continue;
      const box = text.getBBox();
      if (box.x < 20 || box.y < 0 || box.x + box.width > renderer.story.width - 20 || box.y + box.height > renderer.story.height - 10) errors.push(`Text outside canvas: ${text.textContent}`);
      const group = text.closest('[data-node]');
      if (group) {
        const node = renderer.story.nodes.find((n) => n.id === group.dataset.node);
        if (box.x < node.x - 3 || box.x + box.width > node.x + node.width + 3 || box.y < node.y - 3 || box.y + box.height > node.y + node.height + 3) errors.push(`Text outside node ${node.id}: ${text.textContent}`);
      }
    }
    for (let i = 0; i < renderer.story.nodes.length; i++) for (let j = i + 1; j < renderer.story.nodes.length; j++) {
      const a = renderer.story.nodes[i]; const b = renderer.story.nodes[j];
      if (!a.allowOverlap && !b.allowOverlap && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) errors.push(`Overlapping nodes: ${a.id}, ${b.id}`);
    }
    renderer.renderAt(saved, { cursor: state.playing });
    return { errors: Array.from(new Set(errors)), style: state.style, font: state.font, mobile: narrow.matches, width: renderer.story.width, height: renderer.story.height, strokes: renderer.strokes.length, texts: renderer.texts.length, fontsReady: ['400 24px Excalifont', '400 24px Virgil', '500 24px Nunito'].every((f) => document.fonts.check(f)), horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
  }

  const ready = (async () => {
    options($('style-select'), THEMES); options($('font-select'), FONT_OPTIONS);
    await loadFonts();
    $('timeline').max = story.duration;
    chapterUI(); transcriptUI(); rebuild();
    $('play-button').addEventListener('click', () => state.playing ? pause() : play());
    $('replay-button').addEventListener('click', () => { pause(); seek(0); play(); });
    $('overview-button').addEventListener('click', () => { pause(); seek(story.duration); });
    $('timeline').addEventListener('input', (event) => { pause(); seek(event.target.value); });
    $('speed-select').addEventListener('change', (event) => { state.speed = Number(event.target.value); });
    $('style-select').addEventListener('change', (event) => { state.style = event.target.value; state.font = THEMES[state.style].font; rebuild(); });
    $('font-select').addEventListener('change', (event) => { state.font = event.target.value; rebuild(); });
    for (const button of document.querySelectorAll('[data-export]')) button.addEventListener('click', () => runExport(button.dataset.export));
    $('dialog-export').addEventListener('click', () => runExport('video'));
    $('close-dialog').addEventListener('click', () => $('media-dialog').close());
    $('media-dialog').addEventListener('close', () => { stopPreview?.(); stopPreview = undefined; });
    narrow.addEventListener('change', rebuild);
    reduced.addEventListener('change', () => { if (reduced.matches) { pause(); seek(story.duration); } });
    document.addEventListener('keydown', (event) => {
      if (state.busy || $('media-dialog').open || event.target.closest('input,select,button,a,summary,[data-media]')) return;
      if (event.key === ' ') { event.preventDefault(); state.playing ? pause() : play(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); pause(); seek(state.time + 2000); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); pause(); seek(state.time - 2000); }
      if (event.key === 'Home') { event.preventDefault(); pause(); seek(0); }
      if (event.key === 'End') { event.preventDefault(); pause(); seek(story.duration); }
    });
    return true;
  })();

  window.monamotronBoard = {
    ready, story, play, pause, seek, audit, exportPNG, exportVideo,
    getState: () => ({ ...state, mobile: narrow.matches, reducedMotion: reduced.matches }),
    setStyle: (style) => { if (!THEMES[style]) throw new Error(`Unknown style: ${style}`); state.style = style; state.font = THEMES[style].font; rebuild(); },
    setFont: (font) => { if (!FONT_OPTIONS[font]) throw new Error(`Unknown font: ${font}`); state.font = font; rebuild(); },
    exportSVG: (options = {}) => exportRenderer().serialize(options.time ?? story.duration, options),
  };
  ready.catch((error) => { $('loading-state')?.replaceChildren(document.createTextNode(`Could not prepare the board: ${error.message}`)); notify(error.message, true); console.error(error); });
})();
