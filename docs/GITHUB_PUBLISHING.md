# Publish Monamotron On GitHub

This file is the complete publishing checklist for the prepared repository. GitHub automatically displays the root `README.md`; you do not need to paste the README into the website manually.

For graphical upload steps, exact launch copy, profile setup, and the star-growth plan, start with the [Complete Upload And Launch Playbook](GITHUB_LAUNCH_PLAYBOOK.md). Announcement templates are in [Launch Posts](LAUNCH_POSTS.md).

## Repository Identity

**Public name:** Monamotron  
**Repository slug:** `monamotron`  
**Installable skill name:** `monamotron`  
**Release tag:** `v1.0.0`

Use this exact text in the GitHub **About** description:

> An AI skill that turns prompts into beautifully animated visual lessons—with code-drawn illustrations, handwritten text, connected whiteboards, images, and real video export. Works with OpenCode, Claude Code, and skill-aware agents.

Add these repository topics:

```text
ai-agents
agent-skills
ai
monamotron
visual-explanations
whiteboard-animation
excalidraw
miro
svg
canvas
generative-art
education
video-generation
opencode
claude-code
javascript
```

Use `monamotron` under your own GitHub account or organization. Repository names are scoped to that account.

## Prepared Structure

```text
monamotron/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── config.yml
│   ├── workflows/ci.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── dependabot.yml
│   └── release.yml
├── commands/
│   └── opencode/monamotron.md
├── docs/
│   ├── .nojekyll
│   ├── index.html                       # GitHub Pages interactive demo
│   ├── video.html                       # Video player, chapters, and downloads
│   ├── demo/solar.html                  # Second standalone demo
│   ├── media/
│   │   ├── neural-network-demo.webm     # Put the public demo video here
│   │   ├── neural-network-demo.mp4      # Full-speed shareable video
│   │   ├── neural-network-demo.gif      # Animated README preview
│   │   ├── neural-network-preview.png   # README preview image
│   │   ├── neural-network-mobile.png
│   │   ├── neuron-detail.png
│   │   ├── learning-curves.png
│   │   ├── social-preview.png           # Upload in GitHub repository settings
│   │   └── social-preview.svg           # Editable branded artwork
│   ├── ARCHITECTURE.md
│   ├── GITHUB_LAUNCH_PLAYBOOK.md
│   ├── LAUNCH_POSTS.md
│   ├── GITHUB_PUBLISHING.md
│   ├── INSTALLATION.md
│   ├── REPOSITORY_STRUCTURE.md
│   └── VIDEO_AND_MEDIA.md
├── examples/
│   └── neural-network/                  # Editable featured-example source
├── scripts/
│   ├── configure-github.mjs
│   ├── create-social-preview.mjs
│   ├── create-demo-media.mjs
│   ├── create-release-zip.mjs
│   ├── sync-demo.mjs
│   ├── sync-public-media.mjs
│   └── verify-repository.mjs
├── skill/
│   └── monamotron/                # Copy this folder to install the skill
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── RELEASE_NOTES_v1.0.0.md
├── SECURITY.md
├── SUPPORT.md
├── THIRD_PARTY_NOTICES.md
├── github.config.json
├── package-lock.json
└── package.json
```

## Before The First Push

1. Run `node scripts/configure-github.mjs --owner YOUR_GITHUB_USERNAME`, replacing the value with your actual GitHub account name. This fills the account-specific URLs and contacts.
2. Open `README.md` locally and verify the relative preview and video links.
3. Run the prepared checks:

```sh
npm install
npm test
npm run verify
```

4. Optionally run the browser suite:

```sh
npx playwright install chromium
npm run build
npm run check:browser
```

5. Do not add API keys, `.env` files, `node_modules`, or unrelated workspace files.

## Create And Push The Repository

### Option A: GitHub CLI

Run from inside the prepared `monamotron` folder:

```sh
git init
git add .
git commit -m "Initial release of Monamotron"
git branch -M main
gh repo create monamotron --public --source=. --remote=origin --push
```

### Option B: GitHub Website And Git

1. Open <https://github.com/new>.
2. Set the repository name to `monamotron`.
3. Select **Public**.
4. Do **not** add a README, `.gitignore`, or license on the website; all three are already prepared.
5. Create the repository.
6. Run:

```sh
git init
git add .
git commit -m "Initial release of Monamotron"
git branch -M main
git remote add origin https://github.com/ibrahim-hero/monamotron.git
git push -u origin main
```

## Configure The GitHub Page

### About Section

1. Open the repository page.
2. Click the gear beside **About**.
3. Paste the exact description from the Repository Identity section.
4. Add the listed topics.
5. Enable **Releases** and **Issues**.
6. Enable **Discussions** if you want a support/community area.

### Social Preview

Open **Settings → General → Social preview** and upload:

```text
docs/media/social-preview.png
```

It is already prepared at the recommended 1280 × 640 aspect ratio.

### GitHub Pages

The interactive neural-network lesson is already copied to `docs/index.html`.

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch `main` and folder `/docs`.
4. Save.

The demo URL will be:

```text
https://ibrahim-hero.github.io/monamotron/
```

After Pages is live, add that URL to the repository About section as the website.

## Where The Video Goes

The tracked repository video belongs at:

```text
docs/media/neural-network-demo.webm
```

Why this location:

- The README can link to it with a stable relative path.
- GitHub Pages publishes it alongside the interactive demo.
- It keeps generated public media separate from editable example source.

The included video is about 3 MB, well below GitHub's 100 MB per-file limit. Do not use Git LFS for this file. If a future export exceeds 100 MB, host it as a GitHub Release asset, compress it, or use a video platform instead of committing it directly.

The README uses an animated preview linked to the full video player:

```md
[![Monamotron demo](docs/media/neural-network-demo.gif)](https://ibrahim-hero.github.io/monamotron/video.html)
```

See [Video And Media](VIDEO_AND_MEDIA.md) for release assets, YouTube, MP4, and replacement instructions.

## Create The First Release

1. Run `npm run package` to generate a clean ZIP.
2. Push the repository.
3. Open **Releases → Draft a new release**.
4. Create tag `v1.0.0` targeting `main`.
5. Use title `Monamotron v1.0.0`.
6. Paste the contents of `RELEASE_NOTES_v1.0.0.md` into the release description.
7. Attach:

```text
monamotron-v1.0.0.zip
docs/media/neural-network-demo.mp4
docs/media/neural-network-demo.webm
docs/media/neural-network-preview.png
```

8. Mark it as the latest release and publish.

## Recommended Repository Settings

- Require pull requests before merging to `main` once collaborators join.
- Require the `test-and-build` CI check.
- Enable private vulnerability reporting and Dependabot alerts.
- Enable automatic deletion of merged branches.
- Use squash merges for a clean early history.
- Add a repository contact/security channel before inviting outside contributors.

## Final Public Checklist

- [ ] Root README preview renders.
- [ ] Watch page plays the full video and its MP4/WebM downloads work.
- [ ] GitHub Pages loads the interactive board.
- [ ] About description and topics are set.
- [ ] Social preview is uploaded.
- [ ] `v1.0.0` release contains the ZIP, video, and image.
- [ ] CI passes on `main`.
- [ ] License and font notices are visible.
- [ ] No placeholders, secrets, or machine-specific paths remain.
