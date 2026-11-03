# Art direction and visual craft

## A board should have an idea, not just a theme

Start with the visual metaphor. A process may be an illustrated journey; a computer network may be a city of services; a historical lesson may be a timeline with artifact sketches. Choose a composition that communicates the topic before its labels are read.

| Teaching need | Useful composition | Required relationship |
| --- | --- | --- |
| A process or transformation | Illustrated left-to-right journey | Input → mechanism → output |
| A complex system | Hub-and-spoke or layered architecture | Containment, interface, feedback |
| A comparison | Aligned diptych with shared scale | Same criteria, visible contrasts |
| A historical development | Timeline with sketch vignettes | Order and cause distinguished |
| A cycle | Circular story with a clear starting cue | Repeat, return, conservation |
| A misconception | Before/after or prediction/reveal | What changes and why |
| A mathematical idea | Construction + worked example | Definitions → operation → result |
| A decision | Branching map | Conditions on every branch |

Do not squeeze eight branches into a four-step journey. Change the composition.

## Eight directions, all intentionally different

### Studio sketch (`studio-sketch`)

Warm ivory paper, dark blue-black ink, saffron highlights, lilac and mint support. Excalifont display/annotations, Nunito body. Generous space, lightly imperfect paths, occasional marker swashes. Best for approachable science, explainers, and creator-style teaching. Hero drawings are the focal points; frames are secondary.

### Clean board (`clean-board`)

Bright neutral canvas, crisp ink, blue dominant accent, pale yellow sticky notes. Clean Arial/Nunito text and sparse handwritten notes. Precise connectors, regular spacing, restrained corners. Best for product flows, workshops, and business systems. This is Miro-inspired, with no claim of using one universal Miro font.

### Blueprint (`blueprint`)

Deep navy graph paper, icy ink, cyan accents, amber signals. Nunito or a readable mono title, crisp measurement lines and orthogonal routes. Best for engineering, architecture, infrastructure, and technical decomposition. The grid supports alignment; it must not compete with text.

### Chalkboard (`chalkboard`)

Deep forest slate, warm white ink, restrained chalk blue/yellow. Excalifont or Virgil with fine stroke texture. Best for conceptual teaching and math. Dark backgrounds need opaque, sufficiently contrasting labels; avoid blurry chalk effects on paragraphs.

### Editorial (`editorial`)

Cream paper, charcoal ink, rust accent, muted sage. A deliberate Georgia/serif headline, clean body, Excalifont marginalia. Best for history, literature, social ideas, and essay-like lessons. Use a strong title, asymmetric hero composition, and magazine-like captions.

### Playful (`playful`)

Very light canvas, bold ink, coral/cobalt/lemon semantic accents, large friendly handwritten display. Best for beginners and simple concepts. Make meaningful drawn characters or objects; avoid using emoji as the entire illustration system.

### Midnight (`midnight`)

Near-black blue canvas, pale ink, electric purple and mint accents. Best for computing, space, and futuristic systems. Keep glow confined to focal strokes; paragraphs stay sharply readable. The scene must still work as a static image.

### Notebook (`notebook`)

Cream notebook paper with faint ruling and a muted margin, blue-black ink, modest red/mustard accents. Virgil classic handwriting or Excalifont, circled numbers and marginal notes. Best for study guides and intimate whiteboard teaching. Lines align to the layout without running through small labels.

## Choose an illustration language, too

Style must change the artwork itself when appropriate, not merely recolor the same diagram. Choose one primary illustration language for a lesson:

| Illustration language | Code approach | Distinctive craft |
| --- | --- | --- |
| Hand-drawn sketch | SVG/Canvas paths with seeded imperfections | Expressive silhouettes, drawn contours, marker highlights |
| Flat editorial vector | Layered SVG shapes and carefully limited colors | Strong silhouettes, deliberate negative space, crisp geometry |
| Isometric or spatial | Projected SVG polygons or Three.js | Consistent perspective, coherent lighting, explanatory cutaways |
| Pixel art | Integer-grid Canvas/SVG with a limited palette | Crisp pixel edges, stable scale, readable object silhouettes |
| Paper cutout | Layered vector shapes, restrained shadows, procedural texture | Visible layering, soft depth, cut-paper contours |
| Chalk / technical drawing | Fine SVG strokes, constructions and measured detail | Legible lines, meaningful guides, controlled texture |
| Generative / mathematical | Parametric paths, plotted data, simulated motion | Accurate geometry, meaningful parameters, reproducible frames |

Make the same language carry through original images, video posters, and motion graphics. Pair it deliberately with a board direction and fonts. For example, a blueprint lesson might use isometric hardware cutaways, while an editorial lesson might use paper-cut historical vignettes. Custom SVG path drawings and local code-generated image assets in the starter can carry these approaches; extend the renderer when a style needs a different geometry or compositing pipeline.

## Composition rules

- One dominant focal illustration and one primary reading route.
- Group related information through proximity, not excessive containers.
- Maintain approximately 8% outer canvas margins, then adjust for composition.
- Use an 8-unit spacing rhythm; large gaps between concepts, smaller gaps within them.
- Give drawings enough room to feel illustrated. Each important object should have a recognizable silhouette and an explanatory detail.
- Let roughly a third of the board breathe. Whitespace is useful space.
- Background texture should remain very faint, roughly 3–8% opacity.
- A highlight swash sits behind its text; it never obscures descenders.
- Avoid overlapping arrow labels, body labels, and media cards.

## Typography

Suggested landscape canvas scale (around 1440 × 940):

| Role | Size | Notes |
| --- | --- | --- |
| Hero title | 56–76 | Short, expressive, usually 1–2 lines |
| Section/concept title | 27–34 | Distinct and consistent |
| Teaching body | 19–24 | Use short complete thoughts |
| Connector label | 16–19 | A relationship verb or transmitted quantity |
| Eyebrow / source | 13–16 | Secondary, never critical teaching content |
| Annotation | 22–28 | Handwritten, with generous space |

Use relative hierarchy and screen-readable sizes rather than treating these as universal pixels. Small screens need reflow, not a 1440px board shrunk to illegible text. Measure in the loaded font. Use true line breaks for intentional phrasing; automatically wrap body content to its available width.

Human typing must preserve the selected font. Vary reveal timing, not font size, family, or per-character baseline. Handwritten text need not be rotated to look handwritten. Keep rotation to small occasional notes.

## Color and stroke

Define tokens: `paper`, `ink`, `muted`, `accent`, `gold`, `mint`, `lilac`, `coral`, `line`, and `surface`. Give colors semantic roles: e.g. gold = incoming energy, lilac = transformation, mint = useful output. Keep those roles across chapters.

Check normal text contrast against its actual backdrop (target at least 4.5:1) and large text/essential graphic contrast (3:1). Labels must not rely on color alone. In illustrations, use dark ink contours to distinguish softly filled objects.

At 1440px, main contours are typically 2.5–3.5px, connectors 2–3px, detail strokes 1.5–2px. Seeded imperfection should be subtle, roughly 0.4–1.2px for a sketch style. Clean styles may use no jitter. Do not resample geometry every frame.

## Connectors are sentences

- Connect from a clear object port to a clear destination port.
- Leave a small gap outside contours, instead of drawing across the object.
- Label edges with meaning: “DC electricity,” “requests,” “causes,” “stores,” or “returns.”
- Distinguish flow, hierarchy, optional paths, and feedback using consistent styles plus labels.
- Prefer simple monotonic curves or orthogonal routing through open space.
- Add arrowheads when the line reaches the destination, not at the start of its animation.
- A timeline's order arrow does not establish causality. Label carefully.

## Media belongs inside the story

Images need a deliberate crop, enough resolution, a short useful caption, and a reason to be there. Code-made illustrations can serve as both explanatory images and video posters. Avoid generic thumbnail grids.

Video cards need a poster, explicit playback/export behavior, accurate duration when known, and a caption explaining what to notice. A generated animation preview and a real video export are different deliverables; label them accordingly.

## Responsive strategy

For phones, reflow the story into a vertical route with large illustrations, wrapped labels, top-to-bottom connectors, and stacked media. Offer chapters for very long boards. Preserve semantic ordering in the transcript. Provide a landscape static export separately when that is the intended share format.

For comparisons, a small screen can alternate corresponding pairs rather than stacking all of A and then all of B. For cycles, a readable vertical sequence with an explicit return link may be clearer than a microscopic circle.

## Final art-direction question

If all text disappeared, would the board still suggest the topic, its main relationship, and its visual personality? If not, improve the actual illustration and composition.
