# The flock motif

The hero's murmuration is the site's one recurring visual idea. The flock stands for intelligence (models, agents, tools, data): many capable parts with no destination of their own. The visitor's pointer, and the business it represents, sets the direction. Copy near a flock should keep the human in charge of the heading.

## Pieces

| Piece | File | Use |
| --- | --- | --- |
| `drawBird` | `src/components/flock/bird.ts` | The single bird shape. Every flock draws with it. |
| `HeroSculpture` | `src/components/HeroSculpture.tsx` | The full neighbour simulation (230 birds). Homepage hero only. |
| `Flock` | `src/components/flock/Flock.tsx` | A small flock that eases into a named formation: `cluster`, `line`, `wave`, `grid`, `ring`, `vee`. `cohesion` (0 to 1) sets how far the birds have come together. `still` draws one frame. |
| `BirdGlyph` | `src/components/flock/BirdGlyph.tsx` | The bird as an inline icon for primary call-to-action buttons. It points where the link leads and lifts on hover. Text links keep their arrows. |
| `FlockPass` | `src/components/flock/FlockPass.tsx` | Seven birds cross a section's top rule once when it scrolls into view. First child of a `relative` section. |

## Where it appears

- **Instant report**: birds gather as the four steps complete, then hold as tightly as the overall score.
- **Solutions panel**: one formation per service, in place of stock icons.
- **Homepage section rules**: a pass at AI visibility, About, and Work with us.
- **Primary buttons**: the header's “Let’s talk” and the homepage pill buttons carry the bird in place of an arrow.
- **404 page**: one bird wandering alone.
- **Footer**: a still vee in white, heading the same way as the invitation arrow.

## Rules

- One species. No other animals, no insects, and never the word "swarm".
- Black on light backgrounds, white on the blue footer. No colour, no gradients.
- At most one moving flock in view at a time. Passes are brief and run once.
- Small flocks use about 7 to 35 birds. Do not mount a second `HeroSculpture`; it compares every bird with every other.
- Flocks are decoration: `aria-hidden`, no pointer events, paused off-screen and when the tab is hidden.
- With reduced motion, `Flock` shows a still frame and `FlockPass` shows nothing.

## Deliberately left alone

- **Favicon**: stays the “ps” monogram. It is the logo, and it is also what structured data names as the organization's logo.
- **Share cards**: already carry a small flock. Regenerating them needs the original typeface, which is not on every build machine.
