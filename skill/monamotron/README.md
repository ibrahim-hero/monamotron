# Monamotron

A portable AI skill for premium, code-made visual teaching: illustrated whiteboards, meaningful arrows, human-paced typing, multiple visual directions, supporting images/media, and real video exports.

## Use the skill

In a skill-aware coding agent, load **`monamotron`** and give it your topic:

> Use monamotron to explain how a solar panel powers a house. Give it a beautiful warm-paper sketch design, Excalifont labels that type in, hand-drawn animated arrows and illustrations, an original image, and a code-rendered video.

The skill instructs the AI to author and build the complete visual story, inspect the rendered output, and return the playable artifact plus source and requested exports.

## Install in different hosts

Copy this **whole `monamotron` folder**, preserving `SKILL.md`, `references/`, `assets/`, and `scripts/`, to the host's skill directory.

| Host | Common location |
| --- | --- |
| OpenCode, project | `.opencode/skills/monamotron/` |
| OpenCode, global | `~/.config/opencode/skills/monamotron/` |
| Claude Code, project | `.claude/skills/monamotron/` |
| Claude Code, global | `~/.claude/skills/monamotron/` |
| Agents-standard-compatible tools | `.agents/skills/monamotron/` or `~/.agents/skills/monamotron/`, depending on the host |
| A model/host without a skill loader | Supply `SKILL.md` as instructions and make its referenced guides/assets available as attachments or files |

The instructions do not depend on a model provider. Automatic skill discovery, file execution, artifact preview, and video rendering depend on the host's tools. A text-only chat can supply runnable code; it cannot execute a video export without a runtime.

The repository release ZIP is a ready-to-copy bundle with instructions, runtime/source, cached fonts, and example files. Its optional `opencode-command/monamotron.md` can be copied into `.opencode/commands/`.

For OpenCode, quit and restart after installation so the new skill and optional command are discovered. The workspace also provides `/monamotron <your topic and requirements>` in `.opencode/commands/monamotron.md`.

## Open the example

`examples/solar-story.html` in the portable ZIP (or `dist/solar-story.html` after building) is a complete offline demo. Double-click it in a modern browser. It includes:

- An illustrated four-part solar-energy story.
- **Eight** art directions and **five** display font choices.
- Real Excalifont, Virgil, and Nunito font bytes embedded in the file.
- Stroke-by-stroke drawings, arrow reveals, and grapheme-aware typing.
- Replay, pause, seek, chapters, speed, and reduced-motion behavior.
- An original SVG home illustration and a code-rendered video preview.
- A written explanation and verified U.S. Department of Energy source links.
- Browser exports to SVG, PNG, scene JSON, and animated WebM.

The rendering runtime uses browser APIs without runtime packages or online services. Outbound source links require the internet when clicked; the board itself does not.

## Build your own scene

Requires Node.js 20+.

```sh
node scripts/build.mjs --scene examples/solar-story.json --out dist/solar-story.html
```

The first build downloads nine documented, integrity-checked upstream font files if they are not already in `assets/fonts/`. They are cached and embedded. Cached builds work offline:

```sh
node scripts/build.mjs --scene examples/solar-story.json --out dist/solar-story.html --offline
```

For a new topic, have the AI author JSON and custom SVG paths using `references/scene-format.md`. Preserve conceptual accuracy and create a topic-specific design. The script renders authored scene data; it is not itself a prompt-to-lesson AI service.

## Automated checks and exports

```sh
npm install
npm run check
npm run check:browser
npm run export
```

On Windows PowerShell, use `npm.cmd` if script policy blocks `npm.ps1`. The tools use installed Edge/Chrome where available; otherwise install Chromium with `npx playwright install chromium`. `BROWSER_EXECUTABLE` can specify a browser path.

The browser check validates all 40 style/font combinations, real font loading, typography bounds, playback and reverse seeking, phone reflow, reduced motion, media dialogs, PNG/SVG output, and a short actual WebM recording that decodes and plays. It saves screenshots and a JSON report to `dist/checks/`.

Full export:

```sh
node scripts/export.mjs --input dist/solar-story.html --out dist/exports --png --svg --video
```

The full exporter also decodes and seeks the delivered video, saves its final frame, and records actual dimensions/duration in `exports.json`.

Optional MP4 conversion:

```sh
node scripts/export.mjs --input dist/solar-story.html --out dist/exports --video --mp4
```

MP4 requires local FFmpeg or `FFMPEG_PATH`. Default video is actual WebM. Browser recording has a target frame rate and takes approximately the story's playback duration; use a frame/encoder pipeline for exact frame schedules. No synthesized voice track is included by default.

## What to customize

1. **Lesson and composition:** `examples/*.json` and `references/scene-format.md`.
2. **Illustrations:** custom `drawings` in the JSON, or `DRAWINGS` in `assets/core.mjs`.
3. **Art directions/fonts:** `THEMES`, `FONT_OPTIONS`, font source manifest and notices.
4. **Motion and layout:** `BoardRenderer` in `assets/core.mjs`.
5. **Player/UI/video:** `assets/player.js`, `assets/player.css`, `assets/video.mjs`.
6. **AI behavior and quality bar:** `SKILL.md` and `references/`.

The provided font subsets are not universal script coverage. For Arabic/CJK or another unsupported script, bundle a matching open font and use appropriate direction/shaping. The player preserves grapheme clusters and full-line prefix shaping.

To create a portable ZIP from this folder, run `npm run package`. Optional `--video` and `--preview` inputs on `scripts/package.mjs` include generated example assets. The archive excludes development dependencies and temporary check output.

## Portability and licenses

`SKILL.md` is plain Markdown with standard skill metadata. All instruction paths are relative to this folder. The runtime/source is MIT-licensed. Excalifont, Virgil, and Nunito retain SIL OFL 1.1; their full notices are in `assets/fonts/NOTICES.txt` and embedded into the HTML/SVG output. “Clean board” is Miro-inspired; the package does not claim one universal Miro typeface or native Miro/Excalidraw file compatibility.
