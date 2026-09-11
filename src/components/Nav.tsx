import { LOGIN_URL } from '@/lib/login';

/**
 * Two-state nav. It ships dark and transparent over the stage; the engine adds
 * `.on-light` off the shrink clock — not off a scroll threshold, or the nav
 * would still be dark when the shrink finishes after the last scroll event.
 *
 * The brand is hidden while the stage owns the frame (the lockup carries it)
 * and revealed again in the light zone, where nothing else carries a brand —
 * which is why it is the CO-BRAND that reappears there and not near alone. See
 * 38-nav-lockup.css; the two marks are the hero's own, in black.
 */
export function Nav() {
  return (
    <nav className="nav" id="nav">
      <a className="brand" href="#top" aria-label="near.com home">
        {/* Both marks are decorative here: the link's name says where it goes,
            and reading out two brand names in its place would describe the
            artwork rather than the destination. The Rollup is named in the
            hero's own lockup, which is labelled. near is the lockup with its
            N here, not the bare wordmark the nav used to draw — the same file
            the hero uses, recut to black. */}
        <span className="brandroll" aria-hidden="true" />
        <span className="brandrule" aria-hidden="true" />
        <span className="brandnear" aria-hidden="true" />
      </a>
      <span className="navspacer" />
      <a className="btn btn-ghost" href={LOGIN_URL} target="_blank" rel="noopener" data-umami-event="cta-click" data-umami-event-pos="nav-signin">Sign in</a>
      <a className="btn btn-primary" href={LOGIN_URL} target="_blank" rel="noopener" data-umami-event="cta-click" data-umami-event-pos="nav-create">Create account</a>
    </nav>
  );
}
