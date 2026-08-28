const LOGIN = 'https://near.com/login?ref=therollup';

/**
 * The hero type and the ask above the fold.
 *
 * Each `.hw` unit falls back into the gradient on its own offset — the engine
 * owns those transforms. The CTA block rides --cue-out so it recedes on exactly
 * the same curve as the scroll cue and the headline.
 */
export function Hero() {
  return (
    <>
      <div className="herotype live" id="herotype">
        <div className="inner" id="top">
          <h1 className="display long">
            <span className="hline"><span className="hw" data-hw="0">The only onchain account</span></span>
            <span className="hline"><span className="hw" data-hw="1">you&rsquo;ll need,</span></span>
            <span className="hline"><em className="hw" data-hw="2">confidential by default</em></span>
          </h1>

          <div className="herocta">
            <a className="btn btn-primary btn-lg ripple-cta" href={LOGIN}>
              Create account <span className="arw">&rarr;</span>
            </a>
            <p className="friction">No email. No KYC. Ready in seconds.</p>
            <dl className="hstats">
              <div><dt>30+</dt><dd>chains</dd></div>
              <div><dt>113</dt><dd>assets</dd></div>
              <div><dt>$25B+</dt><dd>via Intents</dd></div>
            </dl>
          </div>
        </div>
      </div>
      <div className="scrollcue" aria-hidden="true">
        <span>Scroll</span>
        <span className="bar" />
      </div>
    </>
  );
}
