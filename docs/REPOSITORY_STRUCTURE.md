# Repository Structure

This repository separates the portable skill, editable demonstrations, public GitHub media, and development tooling so users know exactly what to install and contributors know what to edit.

```text
monamotron/
├── skill/monamotron/
│   ├── SKILL.md                    # Model instructions and quality contract
│   ├── README.md                   # Skill-specific build/use documentation
│   ├── assets/
│   │   ├── core.mjs                # Scene validation, timing, SVG renderer
│   │   ├── player.js               # Playback, media, browser exports
│   │   ├── player.css              # Responsive application design
│   │   ├── template.html           # Standalone artifact shell
│   │   ├── video.mjs               # WebM duration metadata handling
│   │   └── fonts/                  # Offline font files and licenses
│   ├── examples/
│   │   ├── solar-story.json        # Starter scene
│   │   └── assets/solar-roof.svg   # Original generated illustration
│   ├── references/
│   │   ├── design-system.md        # Art-direction rules
│   │   ├── motion-and-media.md     # Timeline and export rules
│   │   ├── quality-gates.md        # Required verification
│   │   ├── scene-format.md         # Scene authoring guide
│   │   └── scene.schema.json       # JSON Schema assistance
│   ├── scripts/
│   │   ├── build.mjs               # Standalone HTML builder
│   │   ├── check-browser.mjs       # Rendered behavior checks
│   │   ├── export.mjs              # PNG, SVG, WebM, MP4 exports
│   │   └── package.mjs             # Skill-only archive helper
│   └── tests/core.test.mjs         # Runtime and validation tests
├── examples/neural-network/
│   ├── index.html                  # Built standalone lesson
│   ├── story.source.json           # Human-authored lesson structure
│   ├── story.json                  # Generated scene with custom drawings
│   ├── learning.mjs                # Reproducible toy neural network
│   ├── art.mjs                     # Lesson-specific illustration code
│   ├── build.mjs                   # Computes data, art, and final artifact
│   ├── check-browser.mjs           # Lesson-specific rendered checks
│   ├── experiment-results.json     # Displayed numerical evidence
│   ├── assets/                     # Generated neuron and curve illustrations
│   └── tests/learning.test.mjs     # Finite-difference gradient tests
├── commands/opencode/
│   └── monamotron.md         # Optional `/monamotron` command
├── docs/
│   ├── index.html                  # GitHub Pages live demo
│   ├── demo/solar.html             # Secondary live demo
│   ├── media/                      # README, Pages, and release media
│   ├── GITHUB_LAUNCH_PLAYBOOK.md    # Upload instructions, positioning, and growth plan
│   ├── LAUNCH_POSTS.md              # Copy-ready announcements
│   └── *.md                        # Publishing and installation guides
├── scripts/
│   ├── configure-github.mjs         # Fill account-specific URLs locally
│   ├── create-social-preview.mjs    # Branded social artwork, SVG + PNG
│   ├── sync-demo.mjs               # Syncs rebuilt example into `/docs`
│   ├── verify-repository.mjs       # Package/link/media verification
│   └── create-release-zip.mjs      # Clean distributable ZIP
├── .github/                        # CI and contributor workflow files
├── github.config.json              # Copy-ready GitHub fields and account URLs
└── root community/documentation files
```

## What Users Install

Users installing the agent skill copy only:

```text
skill/monamotron/
```

OpenCode users may additionally copy:

```text
commands/opencode/monamotron.md
```

The rest of the repository demonstrates, tests, documents, and publishes the skill.

## What Contributors Edit

- Change general AI behavior in `skill/monamotron/SKILL.md` and `references/`.
- Change renderer behavior in `skill/monamotron/assets/`.
- Change the scene contract in `scene-format.md`, `scene.schema.json`, and `core.mjs` together.
- Add reusable tests to `skill/monamotron/tests/`.
- Add a new complete lesson under `examples/<topic>/`.
- Put public compressed previews/videos in `docs/media/`, not beside runtime source.

## Generated Files

The following are generated but intentionally tracked because they make the repository immediately demonstrable:

- `docs/index.html`
- `docs/demo/solar.html`
- `docs/media/*`
- `examples/neural-network/index.html`
- `examples/neural-network/story.json`
- `examples/neural-network/experiment-results.json`
- `examples/neural-network/assets/*.svg`

Temporary browser-check screenshots and local export directories remain ignored.
