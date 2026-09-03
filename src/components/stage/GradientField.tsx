/**
 * The full-bleed field behind the tour.
 *
 * Four layers, in paint order:
 *   .isomark   near.com's own mark, held in the top-right corner
 *   .gcss      the field itself: a single diagonal gradient. It was the
 *              fallback under a WebGL canvas — see the note in the markup for
 *              why the canvas is gone
 *   .gshade    the scrim the type is read against
 *
 * THE CORNER MARK WAS THE ROLLUP'S AND IS NOW near.com's. Same slot, same
 * geometry, same job — an object in the field rather than a logo pasted in a
 * corner, cropped by the frame like a real one. What changed is which brand it
 * is and how it is drawn: the Rollup mark was its silhouette cut out of a
 * copper gradient, and this is the supplied artwork itself, which is already
 * the pale mint it wants to be. The Rollup's mark still stands in the lockup,
 * in three dimensions and at full strength, which is the right place for it.
 *
 * It is first in the DOM and `z-index: 1` lifts it over the shader — under the
 * scrim, so the same darkening the type is read against passes over it and it
 * belongs to the field rather than to the copy in front of it.
 *
 * AND IT IS DRAWN ONCE. It was in this list twice — the same div before .gcss
 * and again after the canvas, both at z-index 1 — so a mark authored at .30
 * opacity was compositing over itself and arriving at .51. The corner it sits
 * in is the one the brief names a colour for, and a doubled pale-mint mark is
 * what was lightening that colour out of reach: removing the copy moved the
 * top right of the frame more than any palette change did. The header comment
 * above says four layers and always did; the markup had five.
 *
 * The whole group is clipped by --ci-*, which the closing shrink drives.
 */
export function GradientField() {
  return (
    <div className="grad">
      <div className="isomark" aria-hidden="true" />
      <div className="gcss" />
      {/* THE SHADER IS NOT DRAWN. `#gl` was the WebGL field and `.gcss` its
          fallback; the comp asks for a clean diagonal — solid #5EFAA7 through
          the first half of the axis, easing to #16B862 in the lower right —
          and a field made of organic noise cannot be that. It smudges the one
          thing the gradient is supposed to do.

          The canvas is simply absent rather than hidden, because the engine
          already treats a missing one as "no field": `makeGradientField(null)`
          returns null and the whole GL block — the rAF loop, the resize and
          intersection observers, the shader compile — is behind `if (GL)`.
          Hiding it with CSS would have left every one of those running to draw
          something nobody can see. It is also already the narrow frame's
          behaviour, so the two compositions now paint the same field.

          gl/ is untouched and still imported by the engine: putting the canvas
          back is this one line. */}
      <div className="gshade" />
    </div>
  );
}
