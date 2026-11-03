# Drawing, typing, images, and code-rendered video

## One deterministic clock

Use `renderAt(t)` with `t` in milliseconds. Every geometry, reveal, caption, media appearance, and active chapter must be derivable from `t` and a fixed seed. Playback, seeking, previews, screenshots, and video export use this same renderer.

Do not implement irreversible `setTimeout` chains for the lesson. They break reverse seeking and exports. `requestAnimationFrame` advances the playback clock; it should not create random geometry.

Suggested beat timing:

1. Orient or ask a question: 0.3–0.8s.
2. Draw the important shape: 0.8–2.2s.
3. Type its short label: 0.5–1.4s.
4. Draw and label a connection: 0.5–1.2s.
5. Reveal the explanation: variable, based on its length.
6. Hold for reading: 1–3s or longer for dense content.

Do not force long paragraphs into those label timings. Use the transcript for deeper detail and let the board carry the core idea. Captions should explain the currently revealed state rather than narrating invisible objects.

## Stroke reveal

For an SVG path, measure its length once, then use:

```js
const p = Math.max(0, Math.min(1, (time - start) / duration));
path.setAttribute('stroke-dasharray', `${length} ${length}`);
path.setAttribute('stroke-dashoffset', String(length * (1 - p)));
```

Schedule strokes in a sensible drawing order: silhouette → structural detail → emphasis. Distribute drawing time by path length with sensible minimums. Fade a fill after enough contour exists to establish the shape. A dashed decorative path can have a separate reveal mask or explicit stroke pattern; overwriting its dash pattern changes its meaning.

Compute seeded sketch variations once. Keep endpoint ports stable. A moving pen cursor can follow the active stroke's `getPointAtLength`; avoid letting a fake pen race over unrelated completed paths.

True handwriting-stroke animation requires real glyph stroke data or custom paths. A normal WOFF/TTF font contains filled outlines, not pen trajectories. Use character reveal for typed handwritten fonts unless actual stroke data is available.

## Human-paced typing without broken layout

- Split into grapheme clusters with `Intl.Segmenter`.
- Precompute full-string wrapping after fonts load.
- Reveal each line's prefix at stable positions; do not re-wrap incomplete text.
- Use deterministic 15–30% cadence variation, smaller whitespace delays, and modest comma/full-stop pauses.
- Keep the full line as a text string so Arabic, Indic scripts, combining marks, and ligatures can shape together.
- For RTL, align to the right and move the caret with measured shaped text, not assumed left-to-right glyph widths.
- Stop the caret when the line is finished. Avoid distracting permanent blinking.
- Keep full, nonanimated text accessible in the transcript.

The bundled renderer uses full-line prefix strings and precomputed grapheme timing. The agent must add script-appropriate font files for scripts not covered by the bundled subsets.

## Code-generated image options

| Tool | Useful for | Delivery |
| --- | --- | --- |
| SVG paths | Hand-drawn objects, clean diagrams, editable labels | SVG + PNG |
| Canvas | Procedural textures, plotted illustrations, frame generation | PNG + video frames |
| D3 | Quantitative visuals and relationship maps | SVG/HTML |
| Three.js | Spatial mechanisms and 3D explainers | Browser + captured video |
| Python/Pillow | Raster illustrations and image composition | PNG |
| Manim | Math constructions and technical motion | MP4 + source |
| Remotion | Designed motion graphics and composited media | Video + source |

Choose for the lesson, not for the number of dependencies. Use actual explanatory detail: a solar panel's cells, a router's ports, a heart's chambers, a leaf's veins. Do not fill every subject with the same anonymous rounded square.

If an image-generation tool is available, combine its artwork with vector text and connectors so labels remain precise. Do not rely on generated raster text for technical accuracy.

## Asset and link handling

Resolve local paths relative to the scene file, validate MIME type, and embed supported assets for standalone output. Inline SVG assets must be valid and self-contained. Keep executable/untrusted SVG out of the illustration pipeline; use authored geometry and plain image loading.

For external media, record its title, publisher, exact URL, what it teaches, and whether it was actually checked. Use real direct media URLs for playback and ordinary page URLs for links. Do not send a YouTube page URL to an HTML `<video>` element. Use its supported embed or a clearly labeled outbound link.

Cross-origin images can taint a Canvas. Fetch/embed permitted assets ahead of time or use authored local assets. External websites, fonts, thumbnails, and iframes must not be required for an artifact described as offline. Outbound reference links may remain online-only.

## Actual video generation

### Browser baseline: WebM

Render the board into Canvas at the export resolution with the same embedded fonts. Capture it using `canvas.captureStream(fps)` and an available `MediaRecorder` WebM codec. Start with a real first frame, hold the final frame, flush the recorder, and stop every stream track.

Codec negotiation should test `MediaRecorder.isTypeSupported`. Use a `.webm` extension only when the container is WebM. Explicitly requested MP4 requires a supported MP4 recorder or a real conversion.

The starter has a code-generated video preview and an **Export WebM** action. `scripts/export.mjs --video` writes the actual bytes; its video contains the board's progressive drawing and typing. It has no synthesized voice track. Captions can be composited into the generated video.

### Deterministic frame pipeline

For exact frame schedules or long/high-resolution renders, use a frame exporter and encoder:

```text
for frame = 0 … N-1:
    t = frame / fps
    renderAt(t)
    write frame
encode frames at fps
```

Use fixed scene geometry and loaded font bytes. Include an explicit final hold. Keep the same composition and caption timing as the browser artifact.

### MP4 with FFmpeg

```sh
ffmpeg -i explainer.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart explainer.mp4
```

Set even output dimensions for H.264. If narration is present, mix and normalize it deliberately; synchronize to the same timeline. The starter's optional `--mp4` conversion uses the actual local FFmpeg binary and checks its exit code.

## Generated video cards

The bundled `generated: "story"` card opens a live code-rendered preview of the story and exposes a video export. A supplied `src` opens an actual HTML video with controls. A supplied `url` is an outbound resource link. Never confuse these behaviors or imply that a preview is an already-written MP4.

## Export fidelity

- Embed the fonts in the exported SVG, not only the surrounding HTML.
- Wait for media decode and font readiness before export.
- Preserve text, contours, captions, backgrounds, and colors.
- Export without app controls and without a transient cursor unless explicitly wanted.
- Check the PNG has real pixels and the expected size.
- Check the video actually decodes, has positive duration, and reaches the final board.
- Open the final SVG in a browser and inspect its text and paths; nonbrowser SVG viewers vary in support for embedded web fonts.

## Playback ergonomics

Show a readable overview initially, with a prominent “Watch it unfold” action. Replay starts from the beginning. Seeking must work forward and backward, including before/inside/after a text reveal. Pause freezes both typing and drawing. Speed multiplies the shared clock.

Respect `prefers-reduced-motion` for normal playback: show the completed board and make chapter navigation immediate. An explicit video export may still render the requested animation. Keep keyboard-accessible controls and a static, selectable transcript.
