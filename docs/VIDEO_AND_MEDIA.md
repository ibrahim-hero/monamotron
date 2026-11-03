# Video And Media Guide

## Current Public Assets

| Asset | Purpose | Specifications |
| --- | --- | --- |
| `media/neural-network-demo.webm` | Full animated README/release demo | VP8 WebM, 1600 × 1120, 24 fps target, ~73 s, ~2.4 MiB |
| `media/neural-network-preview.png` | Clickable README poster and full board | 1600 × 1120 PNG |
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

## README Poster Link

GitHub Markdown does not need a fragile iframe. Link a static poster to the video:

```md
[![Watch the Monamotron demo](docs/media/neural-network-preview.png)](docs/media/neural-network-demo.webm)
```

After enabling GitHub Pages, the direct video URL becomes:

```text
https://ibrahim-hero.github.io/monamotron/media/neural-network-demo.webm
```

## GitHub Release

Attach the same WebM to every release where it remains representative. Release assets are easier to download and do not increase Git clone size in future tags.

The first release should include:

```text
monamotron-v1.0.0.zip
neural-network-demo.webm
neural-network-preview.png
```

## File Limits

- GitHub blocks normal Git files larger than 100 MB.
- The included WebM is roughly 3 MB and should stay in normal Git.
- Prefer a release asset, compression, or external video host when a future video approaches 100 MB.
- Use Git LFS only when the project deliberately accepts its storage/bandwidth model.

## Replace The Demo Video

1. Rebuild and verify the lesson with `npm run build` and `npm run check:browser`.
2. Run `npm run export:neural` to export the full video and refresh this folder.
3. Confirm `exports.json` reports a finite duration and expected dimensions.
4. Inspect `video-final-frame.png`.
5. Replace `docs/media/neural-network-demo.webm`.
6. Replace `docs/media/neural-network-preview.png` when the final composition changes.
7. Run `npm run verify`.
8. Update release notes if duration, codec, or lesson content changed.

## MP4 And YouTube

WebM is the repository's open browser baseline. For broad social playback, convert the verified WebM with FFmpeg:

```sh
ffmpeg -i neural-network-demo.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart neural-network-demo.mp4
```

Upload the MP4 to YouTube, Vimeo, or another platform only if desired. Keep the repository WebM as the reproducible code-generated artifact, and add the external video URL to the README rather than replacing source or attribution.

The supplied video has captions composited from the lesson timeline but no synthesized narration.

## Regenerate The Social Preview

Run `npm run brand` from the repository root. It creates the branded PNG and editable SVG. `npm run export:neural` also refreshes the social artwork after updating the public lesson media.

For copy-ready launch captions and a short optional MP4-clip command, see [Launch Playbook](GITHUB_LAUNCH_PLAYBOOK.md) and [Launch Posts](LAUNCH_POSTS.md).
