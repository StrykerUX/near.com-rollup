const LOGIN = 'https://near.com/login?ref=therollup';

/**
 * The mobile sticky CTA. Revealed only once the hero has left the viewport, so
 * it never competes with the hero button.
 *
 * The gate is the hero's own recede value, not an IntersectionObserver: the
 * hero is absolutely positioned inside the sticky stage, so it never leaves the
 * viewport and an observer on it would never fire. The engine toggles
 * `.hero-gone` on <html> and manages the tabIndex here.
 */
export function MobileCta() {
  return (
    <div className="mobcta" id="mobcta" aria-hidden="true">
      <a className="btn btn-primary" href={LOGIN} tabIndex={-1}>Create account</a>
      <span>No email. No KYC.</span>
    </div>
  );
}
