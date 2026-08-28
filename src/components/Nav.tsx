import { NearMark } from './marks';

const LOGIN = 'https://near.com/login?ref=therollup';

/**
 * Two-state nav. It ships dark and transparent over the stage; the engine adds
 * `.on-light` off the shrink clock — not off a scroll threshold, or the nav
 * would still be dark when the shrink finishes after the last scroll event.
 *
 * The brand is hidden while the stage owns the frame (the lockup carries it)
 * and revealed again in the light zone, where nothing else carries a brand.
 */
export function Nav() {
  return (
    <nav className="nav" id="nav">
      <a className="brand" href="#top" aria-label="near.com home">
        <NearMark />
      </a>
      <span className="navspacer" />
      <a className="btn btn-ghost" href={LOGIN}>Sign in</a>
      <a className="btn btn-primary" href={LOGIN}>Create account</a>
    </nav>
  );
}
