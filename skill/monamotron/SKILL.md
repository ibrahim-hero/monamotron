---
name: monamotron
description: Create beautifully art-directed Miro- or Excalidraw-style visual explanations from a prompt, with code-drawn illustrations, meaningful arrows, human-paced typing, progressive whiteboard storytelling, images, linked media, and code-rendered video. Use when the user asks for a visual explainer, animated whiteboard, sketchnote, illustrated teaching canvas, or drawing-while-explaining experience.
license: MIT
compatibility: Model-independent instructions. A tool-enabled coding agent can build the included HTML/SVG/Canvas starter; Node.js 20+ builds it, a modern browser plays it, and optional Playwright/FFmpeg export assets.
metadata:
  author: Monamotron
  version: "1.0.0"
---

# Monamotron

Turn the user's subject into a **beautiful visual story that teaches by drawing**. Act as a visual teacher, illustrator, motion designer, and careful engineer. Design quality, code-generated artwork, intelligible connections, progressive explanation, typography, and media support are requirements.

## The contract

When the user gives a topic, **make the artifact**. Default to a self-contained, playable HTML whiteboard, with editable scene/source files. Explain only the assumptions necessary to proceed. Ask a question only if its answer materially changes the meaning or deliverable; otherwise choose sensible defaults and build.

Every explanation must have:

1. A distinctive, topic-appropriate visual direction and clear reading order.
2. Original, meaningful illustrations produced with code: SVG paths, Canvas, procedural graphics, or another suitable renderer. Basic boxes, emoji, and stock icons alone do not meet the bar.
3. Spatial connections whose arrows, endpoints, labels, and direction explain actual relationships.
4. A teachable sequence: orient the viewer, draw an idea, label it, connect it, then reveal the next idea. Synchronize narration/captions with the corresponding visuals.
5. Human-paced text reveal in the selected font, including handwriting-style labels. Even a text-heavy explanation needs visual annotation and purposeful reveal.
6. Image integration and video support. Generate explanatory images in code; add images or verified media links where they help. Provide a code-rendered animation/video path, and create the actual video file when requested. An unrelated video or a link labeled as a rendered video is not completion.
7. Controls for playback, pause, replay, seeking, and speed; a readable final overview and static transcript; reduced-motion behavior.
8. Correct fonts, stable geometry, editable source, and validation of the actual delivered artifact.

These are baseline requirements, not a reason to add irrelevant decoration or filler media. In a minimal topic, express the requirements economically through an annotated drawing, a short progressive sequence, a generated illustration, and a replay/exportable clip.

## Capability-aware execution

These instructions are portable; the host's tools determine execution capabilities.

- **Files + browser/runtime:** build, render, inspect, fix, and deliver the real files.
- **Code/artifact execution only:** produce a runnable self-contained HTML artifact and use the available preview. Keep fonts embedded when possible.
- **Text-only host:** provide complete runnable source and precise run instructions. State which rendering/export checks could not be executed; do not claim to have generated or tested files that do not exist.
- **An existing app/repository:** inspect its instructions and reuse its stack and conventions. The bundled starter is a reference, not a mandate to replace the app.

Do not assume access to an image-generation model, a Miro account, an Excalidraw service, an MCP server, paid APIs, or a particular model vendor. Code-generated artwork and browser playback must work without them. Use available specialist tools when they genuinely improve the output.

## Workflow

### 1. Understand the lesson

Infer topic, audience, language, depth, and intended format from the prompt. Defaults: a curious beginner, the user's language, one focused lesson, 4–7 meaningful beats, a 16:10-ish board, 25–60 seconds of progressive playback, and a browsable final overview. Longer topics can have chapters; preserve conceptual accuracy when simplifying.

Write a short working brief containing the learning outcome, central visual metaphor, sequence, and what the viewer should remember. Separate factual claims from illustrative analogies. Verify time-sensitive or specialized claims when source tools are available.

### 2. Art-direct before coding

Read [references/design-system.md](references/design-system.md). Choose a composition and visual direction for this topic. Specify:

- background, ink, one dominant accent, and supporting semantic colors;
- display, body, annotation, and code fonts;
- stroke weight, controlled roughness, shape language, spacing, and media treatment;
- the hero illustration and focal point;
- desktop and small-screen reading order.

Use one primary style, not a random collection. The starter offers `studio-sketch`, `clean-board`, `blueprint`, `chalkboard`, `editorial`, `playful`, `midnight`, and `notebook`. Adapt or create a style when the subject deserves it. A preset is a starting point; an unchanged template with new nouns is insufficient art direction.

### 3. Storyboard the teaching

Read [references/motion-and-media.md](references/motion-and-media.md). Plan each beat as:

`question/claim → drawing → label → relationship → explanation → reading hold`.

Use a shared, deterministic timeline for drawings, text, captions, media, and exports. Keep important labels visible in the final overview. Choose truthful timing; dense explanations need more reading time than short labels. Retiming a story means retiming all its events, not just changing the total duration.

### 4. Build with code

Read [references/scene-format.md](references/scene-format.md) when using the starter. Locate bundled paths relative to this skill's directory. Work in the user's requested output folder; avoid overwriting the example or unrelated work.

The bundled starter lives in `assets/`; its example scene is `examples/solar-story.json`.

```sh
# Run from this skill's directory. Windows PowerShell can use npm.cmd.
node scripts/build.mjs --scene examples/solar-story.json --out dist/solar-story.html

# Build a user-authored scene. Paths below are examples; use the actual paths.
node scripts/build.mjs --scene /path/to/story.json --out /path/to/explainer/index.html
```

The builder embeds the player, SVG renderer, supported local media, and cached font bytes. The finished HTML plays offline. The first build downloads the documented open fonts if they are absent; do not silently replace a failed required font. Use `--offline` after fonts have been cached.

The starter supports hand-drawn illustrations and arbitrary custom SVG path drawings, labeled connectors, character reveal, multiple palettes/fonts, responsive reflow, image/media cards, captions, a transcript, and browser exports to SVG, PNG, and WebM. The AI authors the lesson and scene; the runtime does not infer accurate lessons from a raw prompt on its own.

For a richer reconstruction, use SVG/Canvas, Rough.js, D3, Three.js, Python/Pillow, Manim, Remotion, or another suitable stack. Keep text editable in HTML/SVG whenever possible. Never rasterize all content simply to hide layout problems. If Miro/Excalidraw-native editing is explicitly requested, create a validated native format or use their available integration; a similar-looking HTML file is not a native board.

### 5. Typography and human presence

- Excalidraw's modern handwritten family is **Excalifont**; **Virgil** is its classic handwritten family. **Nunito** is a clean family available in Excalidraw. The starter bundles these upstream open font files and notices.
- Miro has multiple text fonts and changing UI typography. Use an intentionally clean Miro-inspired board with handwritten annotations; do not invent a single universal “Miro font” or claim an unverified exact match.
- Load the actual requested font before measuring, wrapping, animating, or exporting. Wait for `document.fonts.load(...)` and `document.fonts.ready`.
- Reveal grapheme clusters, preserve ligatures/bidirectional shaping, and pre-wrap the full string so lines do not jump while typing. Never draw one isolated Arabic glyph at a time.
- Use bounded, seeded cadence variation and modest punctuation pauses. A typing effect is not proof of handwriting; use stroke animation only where actual stroke paths exist.
- At most two primary families per board, plus a code/math family if needed. Font choices are deliberate, not randomized character by character.
- Bundle script-appropriate fonts for Arabic, CJK, or another uncovered language. Excalifont's bundled subsets do not cover every writing system. Adjust RTL alignment and connectors as needed.

### 6. Images and videos

Make useful diagrams, images, posters, thumbnails, and motion graphics with code. Use external photographs or videos only when their real-world detail improves the lesson, and verify the source/link when tools allow it. Keep attribution near the asset or in the source list. Use a designed poster and explanatory caption for each video.

Exports must reuse the same scene, typography, and timeline. Default browser video is a real WebM; optional FFmpeg creates MP4. File extensions must agree with the actual container. Narration is optional unless requested; captions and teaching text remain available. Never invent a voiceover, checked link, native export, or generated video.

```sh
# Optional export tooling; only necessary for automated exports/checks.
npm install
node scripts/export.mjs --input dist/solar-story.html --out dist/exports --png --svg --video

# MP4 needs an installed FFmpeg (or FFMPEG_PATH).
node scripts/export.mjs --input dist/solar-story.html --out dist/exports --video --mp4
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. The export tooling uses installed Edge/Chrome when available, otherwise Playwright Chromium. If a browser is missing, use `npx playwright install chromium` in a tool-enabled host.

### 7. Verify and refine

Read [references/quality-gates.md](references/quality-gates.md). Validate the JSON/schema, font loading, paths, timings, links, and file formats. Render the actual deliverable; inspect the opening, intermediate beats, final overview, a narrow viewport, and exports. Fix clipped or colliding content rather than shrinking it until it becomes unreadable.

Run the bundled meaningful checks if using the starter:

```sh
npm run check
node scripts/check-browser.mjs --input dist/solar-story.html
```

The browser check exercises every bundled style/font, timeline seeking, playback, narrow-screen layout, reduced motion, PNG/SVG output, and a short real video export. It reports failures; a source-only check cannot establish rendered quality. Do not say “zero problems” or “pixel-perfect” without evidence. State the checks actually run.

### 8. Deliver

Return a short description of the visual direction, a clear path/link to the playable artifact, editable source location, and actual exported assets. Include how to open or run it and any specific unexecuted capability requested by the user. The artifact should carry the explanation; the final chat should not repeat its entire lesson.

## Design failures to actively fix

- A wall of labeled rectangles presented as illustration.
- Generic dashboard cards with decorative arrows and no teaching sequence.
- Random colors, wobbly text, excessive roughness, or constant camera movement.
- Arrows passing through text or suggesting incorrect causality.
- Text appearing before the drawing it names, or changing line breaks mid-reveal.
- Tiny labels that only work in a large screenshot.
- Fonts substituted in image/video exports.
- Unsupported media URLs, misleading video buttons, or internet-dependent assets in an “offline” artifact.
- “Done” after producing a plan, a prompt, a Mermaid-only graph, or unrendered fragments.

## Example invocation

> Use monamotron to explain how solar panels power a home. Make it a premium warm-paper sketch with Excalifont labels, animated drawings and typing, a helpful generated image, a connected energy-flow story, and an exported video.

Build the lesson, draw it, verify it, and return the playable board plus the real assets.
