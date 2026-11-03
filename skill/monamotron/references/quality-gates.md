# Required quality gates

Use these while making the artifact. They are practical craft and correctness checks, not an additional approval process for the user.

## 1. Meaning

- The central teaching claim is accurate and understandable.
- The visual metaphor does not falsely replace the real mechanism.
- Every arrow communicates a defensible relationship and a clear direction.
- Labels explain quantities/conditions where ambiguity matters.
- External factual/media sources exist; unchecked links are identified honestly.

## 2. Design

- The topic is recognizable from its illustrations.
- Composition has a clear focal point, hierarchy, and reading route.
- Palette and stroke treatment are consistent and intentional.
- Text contrast and scale are readable on the actual backgrounds.
- There are no clipped lines, unwanted overlaps, orphan labels, or arrows through text.
- Media crop/caption treatment feels integrated with the board.
- Small-screen reflow remains readable and follows the same lesson.

Score composition, typography, illustration, connection clarity, motion, and teaching usefulness on a 1–5 scale. Target at least 4 in every dimension. A self-score is a refinement aid, not evidence that rendering passed.

## 3. Motion

- Drawing precedes the label that identifies it.
- Typing uses stable line breaks and the intended font.
- Cadence and reading holds are reasonable for the amount of text.
- Arrowheads do not appear before their connection is drawn.
- Captions match the visible ideas.
- Backward seeking restores an earlier state correctly.
- Replay, pause, speed, and chapter controls work.
- Reduced-motion users receive a complete understandable board.

## 4. Engineering

- Scene data validates: unique IDs, existing edge endpoints, finite dimensions/times, supported node/media kinds, valid chapter order, and asset paths.
- Required font files load; all layout measurements happen afterward.
- Geometry and cadence are deterministic for a seed.
- Images decode; a video source is actually playable or explicitly linked.
- Standalone HTML contains its required runtime, fonts, and local image assets.
- User text is inserted through text nodes / escaped JSON, rather than unescaped HTML.
- No browser errors occur during normal use and exports.
- No runtime request is necessary for an offline example.

## 5. Delivered assets

- The HTML opens and teaches the requested topic.
- The editable scene/source is included.
- SVG output retains its intended font/style in the tested browser.
- PNG output has the right dimensions and is visually inspected.
- When requested, a real video file exists, decodes, and includes the progressive story.
- MP4 is genuinely MP4; WebM is genuinely WebM.
- Source/link attributions and bundled font notices accompany the artifact.

## Evidence to collect

Inspect these rendered states rather than only reading the source:

1. Full final board in its primary style.
2. Opening and at least one intermediate teaching beat.
3. A backward seek inside a typed label.
4. Small-screen final board and controls.
5. Reduced-motion behavior.
6. At least one PNG/SVG export.
7. A decoded video export when video is in scope.

The starter provides `npm run check` for scene/timeline/data correctness and `scripts/check-browser.mjs` for actual font/layout/playback/export checks. The generated example has a deliberately short video segment for codec verification; check full-length video when that deliverable is requested.

## Completion wording

Report the files and checks actually produced. “Browser rendering, font loading, narrow layout, PNG/SVG export, and WebM decoding passed” is useful evidence. “Works in every AI model with no problems” is not an evidence-based promise.
