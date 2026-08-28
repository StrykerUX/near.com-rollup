/**
 * The quote's stacked home.
 *
 * Below 1080px the quote does NOT ride the lockup stack: shrinking the shell
 * far enough to fit a plate under it clipped the app card itself mid-content,
 * and a broken product shot costs more than a repositioned testimonial. It gets
 * its own band under the stage instead — still absent from every screen of the
 * tour, which is what "first screen only" means.
 *
 * `.qband` is display:none above the breakpoint, so this is inert on desktop.
 */
export function QuoteBand() {
  return (
    <section className="qband" aria-label="What The Rollup says">
      <blockquote className="rollquote">
        <p>
          &ldquo;Bridging was the tax on trading Hyperliquid. Watching it
          disappear is the part I keep showing people.&rdquo;
        </p>
        <div className="qfoot">
          <span className="rqmark" aria-hidden="true" />
          <span className="qwho">
            <b>Robbie Klages</b>
            <span>Co-founder, The Rollup</span>
          </span>
        </div>
      </blockquote>
    </section>
  );
}
