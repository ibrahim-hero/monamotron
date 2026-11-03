# Monamotron: Complete GitHub Upload And Launch Playbook

Start here to publish the prepared project, give it a clear public identity, and help people try it. The strongest route to stars is a useful product that people understand quickly, can install easily, and can see working. A name or description alone cannot guarantee a star count.

## 1. The Files That Are Ready

Extract `monamotron-v1.0.0.zip`. The inner `monamotron` folder is the repository root. It contains the source and assets people should be able to browse on GitHub.

| Ready file or folder | What to do with it |
| --- | --- |
| `README.md` | GitHub displays this automatically on the repository homepage |
| `github.config.json` | Copy-ready name, description, topics, and account-specific URLs |
| `skill/monamotron/` | Complete installable skill, runtime, fonts, references, and starter |
| `commands/opencode/monamotron.md` | Optional `/monamotron` slash command |
| `docs/index.html` | Interactive neural-network demo for GitHub Pages |
| `docs/demo/solar.html` | A second live example |
| `docs/media/neural-network-demo.webm` | Full generated video: about 73 seconds, 1600 × 1120 |
| `docs/media/neural-network-preview.png` | Full-board README poster |
| `docs/media/social-preview.png` | Upload to GitHub Social preview; 1280 × 640 |
| `docs/media/social-preview.svg` | Editable source for the social-preview artwork |
| `docs/media/neuron-detail.png`, `learning-curves.png` | Supporting visuals for posts and documentation |
| `examples/neural-network/` | Editable lesson and reproducible numerical experiment |
| `.github/workflows/ci.yml` | Automated source, build, browser, and package checks |
| `.github/ISSUE_TEMPLATE/` | Bug and feature forms |
| `LICENSE`, `THIRD_PARTY_NOTICES.md` | MIT source license and bundled font notices |
| `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md` | Contributor and support information |
| `RELEASE_NOTES_v1.0.0.md` | Paste into the first GitHub release |
| `docs/LAUNCH_POSTS.md` | Copy-ready announcement and community posts |

The ZIP is also a **release download**. Upload the extracted source contents to the repository; attach the ZIP to Releases.

## 2. Use These Exact Public Fields

| GitHub field | Value |
| --- | --- |
| Repository name | `monamotron` |
| Public display name | **Monamotron** |
| Tagline | **Your AI explains ideas by drawing them.** |
| Visibility | **Public** |
| Default branch | `main` |
| First release tag | `v1.0.0` |
| First release title | **Monamotron v1.0.0 — Code-drawn visual lessons for AI agents** |
| Website, after Pages is enabled | `https://ibrahim-hero.github.io/monamotron/` |
| License | MIT for the skill/runtime; font licenses are included separately |

### About Description: Copy This

```text
An AI skill that turns prompts into beautifully animated visual lessons—with code-drawn illustrations, handwritten text, connected whiteboards, images, and real video export. Works with OpenCode, Claude Code, and skill-aware agents.
```

This leads with what it is, what it makes, and who can use it. The repository name supplies the memorable brand; the description supplies the searchable meaning.

### Topics: Add These

```text
ai
agent-skills
ai-agents
monamotron
visual-explanations
whiteboard-animation
svg
canvas
generative-art
education
video-generation
opencode
claude-code
excalidraw
miro
javascript
```

Keep topics relevant to the actual project. Miro and Excalidraw describe its visual inspiration; native board-file compatibility is not claimed.

## 3. Fill Your GitHub Username Once

Your username is the name in your profile URL, for example `https://github.com/yourname`. Use an organization name instead when publishing under an organization you administer.

Open a terminal inside the inner `monamotron` folder. On Windows, open that folder in File Explorer, click the address bar, type `powershell`, and press Enter.

Replace `YOUR_GITHUB_USERNAME` below with your real account name:

```powershell
node scripts/configure-github.mjs --owner YOUR_GITHUB_USERNAME
```

This fills account-specific URLs in the README, guides, launch posts, and issue-form contacts. It edits local files only. To inspect the changes first:

```powershell
node scripts/configure-github.mjs --owner YOUR_GITHUB_USERNAME --dry-run
```

Node.js 20+ is needed for this helper. If you prefer to edit manually, replace the username in these files:

```text
README.md
CONTRIBUTING.md
docs/GITHUB_PUBLISHING.md
docs/GITHUB_LAUNCH_PLAYBOOK.md
docs/VIDEO_AND_MEDIA.md
docs/LAUNCH_POSTS.md
.github/ISSUE_TEMPLATE/config.yml
```

The live-demo links become available after the Pages step below; release links become available after publishing the release.

## 4. Upload With GitHub Desktop

This is the easiest mostly graphical workflow on Windows. Download GitHub Desktop from <https://desktop.github.com/> and sign in.

1. Select **File → New repository**.
2. Set **Name** to `monamotron` and paste the About description.
3. Choose a parent directory for the new local repository.
4. Leave **Initialize with README** unchecked, **Git ignore** as None, and **License** as None. The prepared project already contains these files.
5. Click **Create repository**.
6. Open the new repository directory in File Explorer.
7. Copy the **contents** of the extracted `monamotron` folder into it, including `.github`, `docs`, `skill`, and the root files. The final layout must be `monamotron/README.md`, not `monamotron/monamotron/README.md`.
8. In Desktop, review **Changes**. Public source and demo files should appear; `node_modules` and temporary check output are ignored.
9. Enter commit summary **Initial release of Monamotron** and click **Commit**.
10. Click **Publish repository**. Use name `monamotron`, choose the intended owner, and uncheck **Keep this code private**.
11. Click **Publish repository**, then **View on GitHub**.

Your new public page should display the prepared README and preview image immediately. Use this workflow throughout the initial upload rather than also creating a second empty repository with the same name.

## 5. Upload With Git And The GitHub Website

Use this workflow if Git for Windows is installed and you prefer commands.

### Create An Empty Remote

1. Visit <https://github.com/new>.
2. Choose your owner and set the repository name to `monamotron`.
3. Paste the About description and select **Public**.
4. Leave website options for README, `.gitignore`, and license unchecked.
5. Click **Create repository**.

### Push The Prepared Folder

Open a terminal inside the prepared local repository folder. Run one line at a time:

```powershell
git init
git add .
git status
git diff --cached --stat
git commit -m "Initial release of Monamotron"
git branch -M main
git remote add origin https://github.com/ibrahim-hero/monamotron.git
git push -u origin main
```

Inspect the staged list before committing. GitHub sign-in may open through Git Credential Manager. HTTPS Git authentication uses a supported credential flow or token rather than your account password.

If Git asks for an author identity, set it for this repository using your name and a verified or GitHub-provided noreply email, then repeat the commit:

```powershell
git config user.name "YOUR NAME"
git config user.email "YOUR VERIFIED OR GITHUB NOREPLY EMAIL"
```

## 6. Upload With GitHub CLI

This workflow creates the remote from the prepared local folder. Install Git and GitHub CLI first, then run:

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
git init
git add .
git status
git diff --cached --stat
git commit -m "Initial release of Monamotron"
git branch -M main
gh repo create ibrahim-hero/monamotron --public --source=. --remote=origin --push
```

Set the About description and topics in the website steps below. The upload methods above are alternatives; run the one matching how you created the repository.

## 7. Browser-Only Upload

You can also upload the clean extracted package through GitHub's website.

1. Create the empty public repository as in section 5.
2. Select **Add file → Upload files**.
3. Drag the extracted repository's **contents** into the upload area, preserving directories.
4. Use commit message **Initial release of Monamotron** and complete the commit/proposal flow shown by GitHub.
5. If files remain, repeat with another batch.
6. Confirm `.github/workflows/ci.yml`, `README.md`, `skill/monamotron/SKILL.md`, and `docs/index.html` are present at their expected paths.

GitHub's browser uploader supports up to **100 files at once** and **25 MiB per file**. Git pushes support files up to **100 MiB each**. The supplied video is about 2.4 MiB. Use the clean release ZIP's extracted contents for this method so development folders are not uploaded. Git-based uploads also apply `.gitattributes` rules.

## 8. Configure The Public Repository

### About, Topics, And Website

Click the gear next to **About** on the repository page. Paste the description, add the listed topics, and save. Add the website URL after Pages has published.

### Social Preview

Go to **Settings → General → Social preview**. Upload:

```text
docs/media/social-preview.png
```

The prepared 1280 × 640 artwork puts the Monamotron name and value proposition front and center. GitHub renders the root README automatically; no separate README upload form is needed.

### Discussions And Issues

Enable **Issues** and **Discussions** under repository settings. Create a pinned welcome announcement using [Launch Posts](LAUNCH_POSTS.md). Use a Show and tell category for people to share generated lessons and Q&A for installation help.

### CI

Open **Actions → CI** after the first push. The included workflow installs dependencies, runs tests, builds the demos, and checks browser rendering. Local checks have been run; the first hosted run still needs to complete in your GitHub account.

## 9. Publish The Working Demo With GitHub Pages

The repository already contains the compiled demo in `docs/index.html`.

1. Go to **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/docs**.
4. Click **Save** and wait for the deployment to finish.
5. Open:

```text
https://ibrahim-hero.github.io/monamotron/
```

6. Test **Watch it unfold**, seeking, media cards, the transcript, and a phone-size viewport.
7. Add that URL to the About website field.

The live page is a playable sample lesson. New lessons are created by loading the skill in an AI agent. A repository link to an `.html` file opens source on GitHub; the Pages URL runs it in a browser.

## 10. Video Placement And Release Downloads

Keep the tracked demo video here:

```text
docs/media/neural-network-demo.webm
```

Keep its README poster here:

```text
docs/media/neural-network-preview.png
```

The live video URL after Pages is enabled is:

```text
https://ibrahim-hero.github.io/monamotron/media/neural-network-demo.webm
```

The full WebM is ready. For platforms requiring MP4, use FFmpeg to convert it:

```powershell
ffmpeg -i docs/media/neural-network-demo.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart docs/media/neural-network-demo.mp4
```

For a short launch clip showing the network being drawn:

```powershell
ffmpeg -ss 00:00:12 -t 00:00:18 -i docs/media/neural-network-demo.webm -vf "scale=1280:-2" -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart docs/media/monamotron-teaser.mp4
```

These optional commands create new MP4 files; FFmpeg is required. The shipped video contains captions, with no synthesized voiceover.

### First Release

1. After setting your account URLs, run `npm run package` to create the personalized download at `dist/monamotron-v1.0.0.zip`.
2. Open **Releases → Draft a new release**.
3. Create tag `v1.0.0`, targeting `main`.
4. Set the release title from section 2.
5. Paste the contents of `RELEASE_NOTES_v1.0.0.md` into the description.
6. Attach the ZIP, `neural-network-demo.webm`, and `neural-network-preview.png`.
7. Publish as the latest release.

GitHub's automatic source-code ZIP is useful too; the named release asset makes the installable bundle easier for new users to recognize.

## 11. Make It Understandable In Five Seconds

The prepared README now follows this order:

1. **Name + clear tagline** explaining what Monamotron does.
2. **Live demo, video, and installation links** near the top.
3. **A real visual example** demonstrating the output.
4. **A short quick start** and a prompt people can copy.
5. **Specific differentiators:** original code art, eight directions, deterministic motion, offline fonts, real video, and tested numerical examples.
6. **Source, docs, licenses, and contribution routes.**

Keep screenshots and examples real. Describe exactly which hosts and outputs are supported. Use actual test results; publish the generated artifact so visitors can verify the claim themselves.

## 12. A Practical Star-Growth Plan

### Before Announcing

- Ask two or three people unfamiliar with the project to install it from the README.
- Have them open the demo and generate one new topic. Fix the first confusing instruction they encounter.
- Make the release and Pages demo easy to find.
- Pin Monamotron on your GitHub profile: **Profile → Customize your pins → select monamotron**.
- Use this short profile bio if it fits your work: **Building Monamotron — code-drawn visual teaching for AI agents.**

### Launch Day

- Post the working demo plus a concise explanation on your own channels.
- Submit a Show HN post if you can be available to answer technical questions.
- Share a relevant example in OpenCode, agent-skill, developer-tool, or educational-visualization communities where project showcases are welcome.
- Lead with what people can try, then link to source and installation.
- Ask for feedback on a concrete topic or failure case. Keep a brief star request after demonstrating value.

### Days 2–7

- Answer installation questions and reproduce reported issues.
- Improve the quick start using feedback.
- Add one visually different, complete example: a system map, mathematical construction, or historical timeline.
- Label small, well-described tasks `good first issue` and `help wanted` when they are genuinely ready for contributors.
- Share one meaningful improvement rather than repeatedly posting the same announcement.

### Days 8–14

- Publish a gallery of actual user-created lessons with permission and attribution.
- Ship a small release for fixes discovered during launch.
- Ask users which visual direction or topic they need next.
- Submit to relevant curated skill/tool lists only when the project meets their inclusion requirements.
- Review GitHub traffic, clones, release downloads, stars, and completed example reports.

### What To Measure

| Signal | What it helps you improve |
| --- | --- |
| Unique visitors | Whether announcements bring the right audience |
| Clones and release downloads | Whether people move from interest to trying it |
| Successful first lessons | Whether the quick start and skill are useful |
| Repeated support questions | Which documentation needs work |
| Stars over time | Whether users want to remember or recommend it |
| Shared examples and contributions | Whether a real community is forming |

Aim first for successful external users and useful feedback. Strong examples, responsive maintenance, and relevant distribution give the project a better chance of earning many stars. Follow each community's posting rules and share where the project solves a real need.

## 13. Copy-Ready Announcements

Use [LAUNCH_POSTS.md](LAUNCH_POSTS.md) for a GitHub welcome post, Show HN submission/comment, short social post, LinkedIn announcement, community showcase, and release announcement. Account URLs can be filled by the configuration helper.

## 14. Common Problems

| Problem | Fix |
| --- | --- |
| GitHub shows only one ZIP file | Upload the extracted source contents; attach the ZIP to Releases |
| README is one directory too deep | Put README, docs, skill, and .github directly at the repository root |
| Live-demo link shows a 404 | Confirm `main` exists, Pages uses `/docs`, and deployment has finished |
| `.html` opens as source | Use the `github.io` Pages URL for the runnable demo |
| Git push reports an existing remote | Inspect `git remote -v` and use the remote for the correct repository |
| The remote already contains a different README | Clone that remote, copy the prepared source into the clone, then commit and push |
| GitHub Desktop publishes privately | Change repository visibility to Public if you want public discovery |
| A video will not upload to a social platform | Convert the WebM to MP4 with the optional command above |
| PowerShell blocks npm.ps1 | Use `npm.cmd` or install Node's normal command shim |
| Browser check cannot launch | Run `npx playwright install chromium` or set a supported browser executable |

## 15. Final Launch Checklist

- [ ] `README.md` is at the repository root.
- [ ] Account-specific URLs and issue-form contacts are filled.
- [ ] Repository is public with name `monamotron`.
- [ ] About description and topics are saved.
- [ ] Branded social preview is uploaded.
- [ ] Pages demo opens and works.
- [ ] CI has completed on GitHub.
- [ ] `v1.0.0` release contains the prepared ZIP and demo assets.
- [ ] README installation instructions have been tried by someone new.
- [ ] Repository is pinned on your profile.
- [ ] Launch posts point to the working demo and repository.
- [ ] You can respond to first-day feedback.

## Official GitHub References

- [Uploading files and current upload limits](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Choosing the Pages branch and /docs publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Desktop](https://desktop.github.com/)
- [GitHub CLI](https://cli.github.com/)
