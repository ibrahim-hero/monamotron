# Authoring a scene

The AI turns the user's prompt into a lesson and authors JSON. The player renders that scene; it is not an AI API or a raw-prompt interpreter. Start from `examples/solar-story.json`, choose a topic-specific composition, and replace the actual drawings, teaching text, relationships, timing, and media.

`scene.schema.json` in this directory supplies editor/schema assistance. `validateStory` also checks semantic constraints such as existing edge endpoints, unique IDs across collections, canvas bounds, and chronological timing. The browser audit checks text after real font measurement.

## Top-level fields

| Field | Meaning |
| --- | --- |
| `version` | Required; `1` |
| `title` | Required; an expressive headline, usually 1–2 lines; `\n` is supported |
| `eyebrow`, `subtitle`, `headerNote` | Orientation and a short optional handwritten marginal note |
| `language`, `direction` | Language tag and `ltr`/`rtl`; add suitable fonts for the actual script |
| `width`, `height` | Landscape canvas in logical units; default 1440 × 960 |
| `style` | `studio-sketch`, `clean-board`, `blueprint`, `chalkboard`, `editorial`, `playful`, `midnight`, `notebook` |
| `font` | Display/annotation family: `excalifont`, `virgil`, `nunito`, `serif`, `mono` |
| `seed` | Fixed number for reproducible cadence and geometry |
| `duration` | Complete timeline duration in milliseconds |
| `nodes` | Illustrated concepts or text/card/note regions |
| `connections` | Meaningful labeled arrows between node IDs |
| `chapters` | Ordered nonoverlapping teaching intervals and written explanations |
| `summary` | Final takeaway: `title`, `text`, `at`, `y` |
| `media` | Integrated image/video/link cards |
| `captions` | Ordered nonoverlapping `start`, `end`, `text` intervals |
| `sources` | `title`, absolute HTTP(S) `url`, optional honest `checked` date |
| `drawings` | Original custom SVG path illustrations, keyed by name |
| `mobile` | Optional node/connector placement overrides for the vertical reflow |

The default header occupies approximately y=40–295. The reference journey uses illustration nodes at y=330, a takeaway near y=702, media near y=788, and a footer. Other compositions can change node locations. Complex header or editorial layouts can be implemented by adapting the SVG renderer and player.

## Concept nodes

```json
{
  "id": "panel",
  "kind": "illustration",
  "icon": "panel",
  "x": 411,
  "y": 330,
  "width": 262,
  "height": 335,
  "title": "Solar panel",
  "body": "PV cells turn light\ninto DC electricity.",
  "kicker": "02 / CAPTURE",
  "fill": "surface",
  "at": 10000,
  "drawDuration": 1750,
  "titleAt": 11900,
  "bodyAt": 12600,
  "cps": 44,
  "chapter": "capture"
}
```

- IDs are lowercase hyphen-separated and unique across nodes, connections, media, and chapters.
- Kinds are `illustration`, `card`, `note`, or `text`.
- Built-in illustrations: `sun`, `panel`, `inverter`, `house`, `server`, `leaf`, `book`, `cloud`.
- `icon` may instead name an original entry in `drawings`; use this for new subjects.
- `titleSize`, `bodySize`, `bodyFont`, and `artSize` can refine typography/art scale. `artTop`, `titleOffset`, `bodyOffset`, `haloWidth`, `haloHeight`, `titleMaxLines`, and `bodyMaxLines` support a deliberately composed wide/short illustration; verify every override on desktop and mobile.
- The drawing begins at `at`; title reveal follows at `titleAt`; body follows at `bodyAt`.
- `cps` is character cadence, with seeded punctuation pauses. Wrapping can add newline holds; leave sufficient timeline room and verify in the browser.
- `allowOverlap: true` is only for an intentional overlapping composition. It does not justify obscured text.
- Optional `ports` supplies relative `[x, y]` positions for named `left`, `right`, `top`, and `bottom` connector ports. Keep them outside the dense part of the illustration.

An illustration node reserves its upper portion for artwork and its lower portion for a short title and body. Increase node height for more lines. Cards/notes/text regions place text higher. If that layout does not suit the topic, implement an appropriate node layout rather than forcing content into it.

## Original drawings

```json
{
  "drawings": {
    "molecule": {
      "size": 160,
      "strokes": [
        { "d": "M40 40 L112 95", "stroke": "ink", "width": 3, "fill": "none" },
        { "d": "M20 40 A20 20 0 1 0 60 40 A20 20 0 1 0 20 40", "stroke": "ink", "fill": "lilac" },
        { "d": "M94 95 A18 18 0 1 0 130 95 A18 18 0 1 0 94 95", "stroke": "ink", "fill": "mint" }
      ]
    }
  }
}
```

Each path uses local coordinates in a square of `size` logical units. The renderer fits it into the node, measures its stroke lengths, and schedules the paths in array order. Order silhouette and major detail before small embellishments. Path data is inserted as an SVG attribute, not as unescaped HTML.

Colors may reference palette tokens (`paper`, `ink`, `muted`, `accent`, `gold`, `mint`, `lilac`, `coral`, `surface`, `line`) or intentional valid CSS colors. Use palette tokens for coherent alternate styles. Draw clear subject-specific silhouettes; these sample circles alone are not an entire molecular science lesson.

## Connections

```json
{
  "id": "panel-inverter",
  "from": "panel",
  "to": "inverter",
  "fromPort": "right",
  "toPort": "left",
  "label": "DC",
  "at": 14700,
  "drawDuration": 1000,
  "color": "ink"
}
```

`controlPoints: [c1x, c1y, c2x, c2y]` optionally supplies cubic control points in canvas units. `labelX`/`labelY` can place the label deliberately. Default horizontal ports align to the illustration center; mobile connectors become top-to-bottom. Every endpoint must exist. Keep routes clear of label/body regions.

## Media behavior

All cards have `id`, `kind`, `x`, `y`, `width`, `height`, `title`, `caption`, and `at`.

```json
{ "kind": "image", "src": "assets/original-diagram.svg" }
```

Local image paths are relative to the scene JSON and embedded by the builder. Supported image extensions: SVG, PNG, JPG/JPEG, WebP, GIF. Author SVG assets without external dependencies or scripting. The final HTML needs no image server.

```json
{ "kind": "video", "generated": "story" }
```

Opens a live code-rendered preview and offers actual WebM export using the story timeline. The preview is not described as a preexisting video file.

```json
{ "kind": "video", "src": "assets/mechanism.webm", "poster": "assets/mechanism-poster.svg" }
```

Embeds a real supported local WebM/MP4/Ogg video and plays it with native controls. Large videos increase the standalone HTML size. Supply a useful poster.

```json
{ "kind": "link", "url": "https://www.energy.gov/eere/solar/how-does-solar-work" }
```

Opens a verified reference page. A `video` card with an ordinary `url` also opens an outbound resource; it does not treat that page as video bytes. Download external images/video explicitly before embedding; the builder does not silently depend on remote assets.

## Responsive overrides

The default phone layout is a readable vertical journey in a 600-unit canvas. Node and media order is preserved, connections become vertical, and the final takeaway and media stack below the concepts.

```json
{
  "mobile": {
    "nodes": { "panel": { "height": 340 } },
    "connections": { "panel-inverter": { "labelX": 355, "labelY": 1090 } }
  }
}
```

For a major mobile change, override all affected node positions and connector routes consistently. The static image/video exporter uses the landscape composition. A hub, cycle, or dense comparison may deserve a custom mobile scene/layout, rather than the starter's simple journey reflow.

## Build and browser API

```sh
node scripts/build.mjs --scene /path/to/story.json --out /path/to/index.html
node scripts/check-browser.mjs --input /path/to/index.html
node scripts/export.mjs --input /path/to/index.html --out /path/to/exports --png --svg --video
```

The finished HTML exposes `window.monamotronBoard`:

```js
await monamotronBoard.ready;
monamotronBoard.seek(12000);
monamotronBoard.play();
monamotronBoard.pause();
monamotronBoard.setStyle('blueprint');
monamotronBoard.setFont('excalifont');
const audit = monamotronBoard.audit();
const svg = monamotronBoard.exportSVG();
const png = await monamotronBoard.exportPNG({ width: 2160 });
const video = await monamotronBoard.exportVideo({ width: 1280, fps: 24 });
// png.blob / video.blob contain actual encoded asset bytes.
```

Video rendering uses real-time Canvas recording with a target frame rate. For exact frame counts and stable long-form production timing, use the frame/encoder pipeline in `motion-and-media.md`. The WebM metadata fixer supports the simple nonindexed container emitted by Chromium MediaRecorder, and fails clearly on an incompatible container.
