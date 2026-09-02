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
      {/* NO SPINE. It was a hairline behind the dots, there to make four marks
          read as one sequence — and four marks in a column at even spacing
          already do. What the line added was a second thing to look at in a
          gutter that has room for one. */}
      <div className="sdrail">
        {CH_TITLES.map((title, i) => (
          <button key={title} type="button" data-step={i} aria-label={`Go to ${title}`}>
            {/* `.sddot`, NOT `.dot`. `18-demo-perps.css` has a `.dot` of its own
                — a padded, filled, 9px-radius chip on the perps ticket — and it
                loads after this rail's stylesheet, so these were rendering as
                22x16 pills with a fill nobody asked for. Fourth class collision
                in this repo and the second in a week. */}
            <span className="sddot" />
            <span className="lbl">{title}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
