# Installation

[← README](../README.md) · [Architecture](ARCHITECTURE.md)

## What You Need

- **To watch an existing lesson:** a modern browser. Download the repository and open `docs/index.html`, `docs/demo/solar.html`, or `docs/video.html`.
- **To make new lessons:** a tool-enabled AI host, Node.js 20+, and Edge, Chrome, or Chromium for rendered checks and exports.
- **For MP4 conversion or regenerating the README GIF:** FFmpeg. HTML, PNG, SVG, and WebM tooling works without it.

## Get The Files

```sh
git clone https://github.com/ibrahim-hero/monamotron.git
cd monamotron
```

You can also choose **Code → Download ZIP** on GitHub or download a published release. Extract the archive and locate:

```text
skill/monamotron/
```

Install that entire folder, preserving `assets`, `references`, `scripts`, examples, tests, fonts, and `SKILL.md`.

## Install Globally

Global installation makes the skill available across your projects. Run these commands from the downloaded repository root.

### Windows PowerShell

Choose the destination for your host:

```powershell
# OpenCode
$destination = Join-Path $HOME ".config/opencode/skills"
```

For Claude Code, use this destination instead:

```powershell
$destination = Join-Path $HOME ".claude/skills"
```

Then install:

```powershell
New-Item -ItemType Directory -Force $destination | Out-Null
Copy-Item .\skill\monamotron $destination -Recurse -Force
npm.cmd --prefix "$destination/monamotron" ci
```

### macOS / Linux

For OpenCode:

```sh
destination="$HOME/.config/opencode/skills"
```

For Claude Code:

```sh
destination="$HOME/.claude/skills"
```

Then install:

```sh
mkdir -p "$destination"
cp -R skill/monamotron "$destination/"
npm --prefix "$destination/monamotron" ci
```

## Project-Local And Other Hosts

For project-local installation, copy `skill/monamotron/` to the matching destination inside your working project:

| Host | Project destination | Global destination |
| --- | --- | --- |
| OpenCode | `.opencode/skills/monamotron/` | `~/.config/opencode/skills/monamotron/` |
| Claude Code | `.claude/skills/monamotron/` | `~/.claude/skills/monamotron/` |
| Agents-compatible hosts | `.agents/skills/monamotron/` | `~/.agents/skills/monamotron/`, when supported |

The final layout should have `SKILL.md` directly inside the `monamotron` folder:

```text
your-project/
└── .opencode/
    └── skills/
        └── monamotron/
            ├── SKILL.md
            ├── assets/
            ├── references/
            ├── scripts/
            └── package.json
```

For hosts without skill discovery, provide `SKILL.md` as project instructions and make the adjacent assets and references available. Check the host's documentation for its supported discovery paths.

## Prepare The Browser Tools

Open a terminal **inside the installed `monamotron` skill folder**, then run:

```sh
npm ci
npm run check
```

The global-install commands above already perform `npm ci`. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

The tools look for common Edge, Chrome, and Chromium installations. If no supported browser is available, run this from the same installed skill folder:

```sh
npx playwright install chromium
```

Use `npx.cmd` on Windows if needed. A custom browser executable can also be selected through `BROWSER_EXECUTABLE`.

To check the installed copy end to end:

```sh
npm run build
npm run check:browser
```

Open `dist/solar-story.html` inside that installed copy. You should see an interactive solar-energy lesson with drawing, typing, playback controls, and export actions.

## Optional OpenCode Command

From the downloaded repository root, install the supplied command globally.

**Windows PowerShell:**

```powershell
$commands = Join-Path $HOME ".config/opencode/commands"
New-Item -ItemType Directory -Force $commands | Out-Null
Copy-Item .\commands\opencode\monamotron.md $commands -Force
```

**macOS / Linux:**

```sh
mkdir -p "$HOME/.config/opencode/commands"
cp commands/opencode/monamotron.md "$HOME/.config/opencode/commands/"
```

For a project-local command, copy the same file to `your-project/.opencode/commands/monamotron.md`.

## Verify Discovery

Quit and restart your AI host after installation. In the project where you want the lesson saved, ask:

```text
List the installed skill named monamotron and summarize when it should be used.
```

Then paste:

```text
Load monamotron and explain how solar panels power a house for a beginner.
Use a warm sketch design, original illustrations, and animated arrows.
Build and check the interactive lesson, then export a PNG and a video.
```

With the optional OpenCode command installed, you can also run:

```text
/monamotron Explain how solar panels power a house. Use a warm sketch style and export a video.
```

Expect a saved HTML artifact, editable scene source, and the requested exports. The agent should report the checks it actually ran.

## Update An Installation

Get the current source with `git pull` in your downloaded repository, or extract a fresh ZIP. Re-run the copy and dependency-install commands for your host, then restart it. Keep your authored lessons in your working project so they remain independent of the installed skill.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The host cannot find `monamotron` | Confirm the discovery path, check that `SKILL.md` is directly inside the skill folder, and restart the host |
| `/monamotron` is unavailable in OpenCode | Install the optional command file as well as the skill, then restart OpenCode |
| `node` or `npm` is not recognized | Install Node.js 20+ and reopen the terminal |
| PowerShell blocks `npm.ps1` | Run `npm.cmd` and `npx.cmd` |
| An export cannot import Playwright | Run `npm ci` inside the installed skill folder |
| Browser launch fails | Run `npx playwright install chromium` there, or set `BROWSER_EXECUTABLE` |
| MP4 conversion cannot find FFmpeg | Install FFmpeg or set `FFMPEG_PATH`; WebM export remains available |
| The agent returns only text | Use a host with file-writing, command execution, and browser tools; ask it to build and check the artifact |
