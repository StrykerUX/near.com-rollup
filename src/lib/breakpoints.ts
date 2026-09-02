/**
 * THE ONE BREAKPOINT THE PAGE HAS.
 *
 * 1080 is where the lockup stops being three columns and the tour stops being
 * a scrub — see `styles/30-mobile-tour.css` and `MobileTour.tsx`. It is read
 * from three places that must agree or the page ends up with two compositions
 * at once, or none:
 *
 *   · `useNarrow`, which decides which one React renders
 *   · `startStageEngine`, which refuses to start against the narrow one
 *   · the stylesheets, which cannot import this and carry the number in a
 *     media query. That copy is the reason this file has a comment rather than
 *     being a one-line constant: change it here and you must change it there.
 */
export const NARROW_MAX = 1080;
export const NARROW_MQ = `(max-width: ${NARROW_MAX}px)`;
