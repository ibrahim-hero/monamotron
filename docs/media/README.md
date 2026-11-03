# Public Media

This folder contains compressed public-facing assets used by the root README, GitHub Pages, and releases.

- `neural-network-demo.webm`: full generated lesson video.
- `neural-network-demo.mp4`: full-speed H.264 video for the watch page and sharing.
- `neural-network-demo.gif`: finished-board cover followed by a 5× animated README preview.
- `neural-network-preview.png`: video poster and still-image alternative.
- `social-preview.png`: upload through GitHub Settings → General → Social preview.
- `social-preview.svg`: editable branded artwork with embedded open fonts; regenerate with `npm run brand`.
- `neural-network-mobile.png`: responsive-layout evidence.
- `neuron-detail.png` and `learning-curves.png`: original supporting visuals.

Open [the video player](../video.html) for normal-speed playback, chapters, and downloads. Run `npm run demo:media` from the repository root to regenerate MP4/GIF from the WebM; FFmpeg is required.

Keep editable lesson source under `examples/` and delivery-media tooling under `scripts/`. See [Video And Media](../VIDEO_AND_MEDIA.md) for the complete build/export sequence.
