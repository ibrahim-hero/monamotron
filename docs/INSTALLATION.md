# Installation

## Download A Release

Download and extract `monamotron-v1.0.0.zip`, then locate:

```text
skill/monamotron/
```

Copy that entire folder, preserving all adjacent `assets`, `references`, `scripts`, examples, tests, fonts, and `SKILL.md`. Copying only `SKILL.md` removes the runtime and detailed design guidance.

## OpenCode

### Project Scope

```text
your-project/
└── .opencode/
    └── skills/
        └── monamotron/
            └── SKILL.md
```

Optional slash command:

```text
commands/opencode/monamotron.md
→ your-project/.opencode/commands/monamotron.md
```

### Global Scope

```text
~/.config/opencode/skills/monamotron/
~/.config/opencode/commands/monamotron.md
```

Quit and restart OpenCode after adding the skill or command. Configuration-time files are not hot-reloaded.

Invoke it with:

```text
/monamotron Explain how solar panels power a house. Use a warm sketch style and export a video.
```

Or ask the model directly to load `monamotron`.

## Claude Code

Project scope:

```text
.claude/skills/monamotron/
```

Global scope:

```text
~/.claude/skills/monamotron/
```

## Agents-Compatible Hosts

Depending on the host, use:

```text
.agents/skills/monamotron/
```

or:

```text
~/.agents/skills/monamotron/
```

Check the host's skill-discovery documentation if it uses a different location.

## Hosts Without Skill Discovery

Provide `skill/monamotron/SKILL.md` as system/project instructions and make the whole skill directory available to the model. A text-only model can author source, but it cannot truthfully claim that image/video files were rendered or checked without tools.

## Build Tooling

The runtime itself uses browser APIs and produces standalone HTML. Automated builds and checks require Node.js 20+:

```sh
cd skill/monamotron
npm install
npm run check
npm run build
npm run check:browser
```

If no local Edge/Chrome/Chromium is available:

```sh
npx playwright install chromium
```

FFmpeg is optional and only required for MP4 conversion.

## Verify Discovery

After restarting the host, ask:

```text
List the installed skill named monamotron and summarize when it should be used.
```

Then create a small test lesson and confirm the host writes an actual HTML artifact rather than returning only a plan.
