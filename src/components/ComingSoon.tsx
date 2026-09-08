/**
 * THE HOLDING PAGE.
 *
 * Two brands, one line, and the field the tour is built on. It is temporary by
 * construction: `app/page.tsx` renders this instead of `<Site />` and the tour
 * itself is one route over at `/preview`, so putting the site back is a single
 * import — nothing about the tour was moved, gated or unpicked to make room.
 *
 * THE FIELD IS THE TOUR'S, NOT A COPY OF IT. The three layers below are the
 * same photograph, the same blur plate and the same scrim the stage draws,
 * reached through the `--sky-*` tokens in 33-hero-skyline.css. That indirection
 * is the whole reason this page cannot drift: retune the field for the tour and
 * this follows, because there is no second set of numbers to forget.
 *
 * THE MASK STILL BELONGS TO THE SCREEN AND THE PICTURE TO THE FIELD, which is
 * why the blur is a masked element wrapping a `::before` here exactly as it is
 * on the stage. There is nothing to parallax on a page that does not scroll —
 * but this composition is one thing to learn, not two, and the shape that is
 * correct on the stage costs nothing here.
 *
 * THE CURTAIN DOES NOT RUN IN FRONT OF IT. `<Splash />` lives in the layout, so
 * it would otherwise play its two-second chart over this page and reveal the
 * same two marks it had already been showing — see the rule in
 * 34-coming-soon.css.
 */
export function ComingSoon() {
  return (
    <main className="soon">
      <div className="soonfield" aria-hidden="true">
        <div className="soonblur" />
        <div className="soonscrim" />
      </div>

      <div className="soonin">
        {/* The Rollup leads, as it does in the tour's own eyebrow — same
            lockup, same order, same two files. */}
        <div className="soonbrow" aria-label="The Rollup and near.com">
          <span className="rolllock" role="img" aria-label="The Rollup" />
          <span className="rule" aria-hidden="true" />
          <span className="nearw" role="img" aria-label="near.com" />
        </div>
        <p className="soonword">Coming soon</p>
      </div>
    </main>
  );
}
