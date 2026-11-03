# Video And Media Guide

[← README](../README.md) · [Watch the video](video.html) · [Architecture](ARCHITECTURE.md)

## Current Public Assets

| Asset | Purpose | Specifications |
| --- | --- | --- |
| `media/neural-network-demo.webm` | Original full lesson recording | VP8 WebM, 1600 × 1120, 24 fps target, ~73 s, ~2.4 MiB |
| `media/neural-network-demo.mp4` | Full-speed video for the watch page and sharing | H.264 MP4, 1600 × 1120, 24 fps, ~72 s, ~1.6 MiB |
| `media/neural-network-demo.gif` | Inline animated README preview | 960 × 672, 10 fps, ~16 s, ~2.2 MiB; finished-board cover followed by a 5× preview |
| `media/neural-network-preview.png` | Video poster and still alternative | 1600 × 1120 PNG |
| `media/social-preview.png` | GitHub social preview | 1280 × 640 PNG |
| `media/social-preview.svg` | Editable branded social artwork | Embedded open fonts and original SVG geometry |
| `media/neural-network-mobile.png` | Responsive-layout evidence | 375 px viewport capture |
| `media/neuron-detail.png` | Supporting illustration | Code-generated neuron walkthrough |
| `media/learning-curves.png` | Supporting illustration | Measured toy-model losses |

## Where To Put Video

Keep public repository videos in:

```text
docs/media/
```

Use lowercase, descriptive, hyphenated names. Keep editable video-generation source in the corresponding example, not in `docs/media`.

This separation gives GitHub Pages a stable URL while keeping public delivery assets separate from source and temporary exports.

## README And Watch Page

The README embeds a GIF that GitHub can display directly and links it to a native video player:

```md
[![Watch the Monamotron demo](docs/media/neural-network-demo.gif)](https://ibrahim-hero.github.io/monamotron/video.html)
```

The GIF is an accelerated preview. The full video preserves the lesson's original teaching pace and captions. A [still board](media/neural-network-preview.png) is available for readers who prefer a static image.

[`docs/video.html`](video.html) provides native playback controls, chapter shortcuts, a text alternative, and MP4/WebM download links. It works locally when opened alongside `docs/media/`, and on GitHub Pages when publishing from `main` → `/docs`.

After enabling Pages:

```text
https://ibrahim-hero.github.io/monamotron/video.html
https://ibrahim-hero.github.io/monamotron/media/neural-network-demo.mp4
https://ibrahim-hero.github.io/monamotron/media/neural-network-demo.webm
```

GitHub repository Markdown does not reliably render arbitrary `<video>` or iframe embeds. The animated image plus the watch-page link provides a working README preview without an external video account. Direct download links remain available in the README.

## GitHub Release

Attach the full MP4 and original WebM to releases where they remain representative. Release assets are easy to download without cloning the repository.

The first release should include:

```text
monamotron-v1.0.0.zip
neural-network-demo.mp4
neural-network-demo.webm
neural-network-preview.png
```

## File Limits

- GitHub blocks normal Git files larger than 100 MB.
- The included full videos and GIF are small enough for normal Git.
- Prefer a release asset, compression, or external video host when a future video approaches 100 MB.
- Use Git LFS only when the project deliberately accepts its storage/bandwidth model.

## Replace The Demo Video

Run these commands from the repository root after installing dependencies and a supported browser:

```sh
npm run build
npm run check:browser
npm run export:neural
npm run demo:media
npm run verify
```

`export:neural` records the full lesson and syncs public images/video. It uses screenshots produced by `check:browser`, so run the commands in that order. `demo:media` converts the published WebM into an MP4 and an animated GIF; it requires FFmpeg on `PATH` or the `FFMPEG_PATH` environment variable.

If you only need to regenerate MP4/GIF from the existing WebM, run `npm run demo:media` alone. The original recording is preserved. Generation is implemented in [`scripts/create-demo-media.mjs`](../scripts/create-demo-media.mjs).

After regeneration:

1. Inspect `examples/neural-network/exports/exports.json` and `video-final-frame.png` if you re-exported the lesson.
2. Open `docs/video.html`; play, pause, seek, and try a chapter shortcut.
3. Check the MP4 and WebM near the end of the video.
4. Inspect the GIF's cover and animation, plus its appearance in the README.
5. Update the watch page's chapter times and text alternative if the lesson changed.
6. Update the media specifications and release notes if duration, codec, or content changed.

## MP4 And YouTube

The repository includes a ready-to-share MP4. To reproduce just that conversion manually, run from the repository root:

```sh
ffmpeg -i docs/media/neural-network-demo.webm -vf fps=24 -c:v libx264 -crf 21 -pix_fmt yuv420p -movflags +faststart docs/media/neural-network-demo.mp4
```

An explicit frame rate avoids treating MediaRecorder's millisecond time base as an extremely high frame rate. `+faststart` places MP4 metadata before video data for web playback.

Upload the MP4 to YouTube, Vimeo, or another platform only if desired. Keep the repository WebM as the reproducible code-generated artifact, and add the external video URL to the README rather than replacing source or attribution.

The supplied video has captions composited from the lesson timeline but no synthesized narration.

## Regenerate The Social Preview

Run `npm run brand` from the repository root. It creates the branded PNG and editable SVG. `npm run export:neural` also refreshes the social artwork after updating the public lesson media.

For copy-ready launch captions and a short optional MP4-clip command, see [Launch Playbook](GITHUB_LAUNCH_PLAYBOOK.md) and [Launch Posts](LAUNCH_POSTS.md).
