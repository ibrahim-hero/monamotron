# How a Neural Network Learns

A self-contained, chalkboard-style visual explanation generated with the Monamotron skill.

## Open it

Double-click `index.html` in Edge, Chrome, or another modern browser. The board works offline; only the explicitly linked further-reading pages require a connection.

The player includes drawing and typing animation, pause/replay/seeking/speed controls, chapters, a transcript, reduced-motion behavior, two original supporting illustrations, and browser exports.

## Editable source

- `story.source.json`: authored lesson, layout, timing, captions, sources, and media.
- `learning.mjs`: actual 35→6→1 toy neural network, backpropagation, gradient descent, and separately generated held-out data.
- `art.mjs`: original SVG geometry, chalk drawings, and supporting images.
- `build.mjs`: computes all displayed results, generates assets and `story.json`, then produces the standalone HTML.
- `brief.md`: learning goal, art direction, sequence, and numerical-integrity notes.

The toy task distinguishes noisy 5×7 glyphs for 7 and 1. It is designed to explain the training mechanism, not claim performance on real handwriting datasets.

## Rebuild and verify

```sh
node build.mjs
node --test tests/learning.test.mjs
node check-browser.mjs
```

The unit tests independently finite-difference selected gradients. Browser checks exercise the real rendered board, images, timeline, backward seeking, phone layout, reduced motion, SVG/PNG, and a decoded WebM segment.

## Exports

```sh
node ../../skill/monamotron/scripts/export.mjs --input index.html --out exports --png --svg --video --width 1600
```

`exports/explainer.webm` is the real full animated lesson, including captions. It has no synthesized voice track. `exports/exports.json` records the actual codec, dimensions, duration, and browser audit; `exports/video-final-frame.png` is decoded from the delivered video.
