# Monamotron v1.0.0 — Code-drawn visual lessons for AI agents

**Prompt in. Visual story out.**

Monamotron is a portable AI skill that turns any topic into an illustrated, animated lesson — original code-drawn art, handwritten explanations, meaningful arrows, and a video you can actually export. Works with OpenCode, Claude Code, and skill-aware agents.

**Try it first**

- [Watch the 73-second demo](https://ibrahim-hero.github.io/monamotron/video.html) — chapters, transcript, MP4/WebM downloads
- [Play the interactive lesson](https://ibrahim-hero.github.io/monamotron/) — pause, seek, change style, export
- [Animated preview in the README](https://github.com/ibrahim-hero/monamotron#see-it-in-action)

## What's in v1.0.0

- Portable `monamotron` skill: model-independent instructions, design system, scene format, and quality gates
- Eight visual directions (chalkboard, blueprint, editorial, studio sketch, and more) with five font choices
- Deterministic SVG renderer: stroke-by-stroke drawing, human-paced typing, labeled arrows, captions
- Standalone HTML builds with embedded fonts and media — no server, no CDN, works offline
- Exports: PNG, SVG, scene JSON, real WebM, optional FFmpeg MP4
- Featured neural-network lesson backed by a reproducible **35 → 6 → 1** toy classifier — displayed gradients and learning curves come from tested code, not invented numbers
- New: [architecture guide](https://github.com/ibrahim-hero/monamotron/blob/main/docs/ARCHITECTURE.md), [video watch page](https://ibrahim-hero.github.io/monamotron/video.html), full-speed MP4, and animated README preview
- CI with source tests, finite-difference gradient checks, builds, and rendered browser checks (desktop + mobile)

## Install

1. Download `monamotron-v1.0.0.zip` from the release assets and extract it.
2. Copy `skill/monamotron/` into `.opencode/skills/` or `.claude/skills/`.
3. Restart your host and paste a prompt:

   ```text
   Load monamotron and explain how neural networks learn.
   Use a chalkboard design, original illustrations, and export a video.
   ```

Full instructions: https://github.com/ibrahim-hero/monamotron/blob/main/docs/INSTALLATION.md

## Requirements

- **Making lessons:** a tool-enabled AI host, Node.js 20+, Edge/Chrome/Chromium
- **Watching:** any modern browser
- **MP4 conversion (optional):** FFmpeg

## Downloads

| File | What it is |
| --- | --- |
| `monamotron-v1.0.0.zip` | Complete repository + installable skill |
| `neural-network-demo.mp4` | Full demo, 1600 × 1120, ~72 s, H.264 |
| `neural-network-demo.webm` | Original code-rendered recording |
| `neural-network-preview.png` | Full finished board |

MIT licensed · Fonts under SIL OFL 1.1 · https://github.com/ibrahim-hero/monamotron
