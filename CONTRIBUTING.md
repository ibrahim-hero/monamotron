# Contributing

Contributions that improve teaching clarity, visual craft, accessibility, deterministic rendering, media safety, or portability are welcome.

Start with the [architecture guide](docs/ARCHITECTURE.md) for the runtime layers, example pipeline, and [where to make a change](docs/ARCHITECTURE.md#where-to-make-a-change).

## Setup

```sh
git clone https://github.com/ibrahim-hero/monamotron.git
cd monamotron
npm ci
npm test
npm run build
npm run check:browser
npm run verify
```

Install Playwright Chromium with `npx playwright install chromium` if no supported local browser is available.

## Design Standard

- Create topic-specific illustrations, not a wall of interchangeable cards.
- Make every arrow communicate a defensible relationship.
- Preserve readable typography, contrast, whitespace, and phone reflow.
- Derive factual numbers from code or a cited source; never invent checked links or export claims.
- Keep animation seekable and deterministic through one shared timeline.
- Respect reduced motion and provide a selectable transcript.

## Pull Requests

1. Keep the change focused and explain the user-facing behavior.
2. Add or update tests for runtime behavior and scene validation.
3. Include rendered evidence for visual changes.
4. Run the commands above and report anything that could not be run.
5. Add third-party licenses and attribution for new fonts or media.

Do not commit `node_modules`, temporary browser artifacts, full check directories, secrets, or media without verified redistribution rights.
