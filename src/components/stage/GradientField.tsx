/**
 * The full-bleed field behind the tour.
 *
 * Four layers, in paint order:
 *   .isomark   near.com's own mark, held in the top-right corner
 *   .gcss      a CSS radial-gradient stack — the fallback, and the paint-in
 *              before the shader compiles
 *   #gl        the WebGL field; the engine adds `.on` on its first frame
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
 * The whole group is clipped by --ci-*, which the closing shrink drives.
 */
export function GradientField() {
  return (
    <div className="grad">
      <div className="isomark" aria-hidden="true" />
      <div className="gcss" />
      <canvas id="gl" aria-hidden="true" />
      <div className="isomark" aria-hidden="true" />
      <div className="gshade" />
    </div>
  );
}
