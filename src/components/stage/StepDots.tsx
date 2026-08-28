import { CH_TITLES } from '@/lib/schedule';

/**
 * The scroll-step rail. Buttons, not decoration: each one jumps to its card,
 * and the engine maintains `done` / `now` / `next` plus aria-current off the
 * card sequence — never off the raw scroll position, or the rail reads EARN
 * while the Swap screen is on stage.
 *
 * Labels come from CH_TITLES rather than the markup, so they cannot drift out
 * of step with the deck order the way hardcoded ones did.
 */
export function StepDots() {
  return (
    <nav className="stepdots" id="stepdots" aria-label="Product tour steps">
      <div className="sdrail">
        <span className="spine" aria-hidden="true" />
        {CH_TITLES.map((title, i) => (
          <button key={title} type="button" data-step={i} aria-label={`Go to ${title}`}>
            <span className="dot" />
            <span className="lbl">{title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
