/**
 * The full-bleed field behind the tour.
 *
 * Four layers, in paint order:
 *   .rollmark  the copper Rollup mark, cut out of the same light
 *   .gcss      a CSS radial-gradient stack — the fallback, and the paint-in
 *              before the shader compiles
 *   #gl        the WebGL field; the engine adds `.on` on its first frame
 *   .gshade    the scrim the type is read against
 *
 * The whole group is clipped by --ci-*, which the closing shrink drives.
 */
export function GradientField() {
  return (
    <div className="grad">
      <div className="rollmark" aria-hidden="true" />
      <div className="gcss" />
      <canvas id="gl" aria-hidden="true" />
      <div className="gshade" />
    </div>
  );
}
