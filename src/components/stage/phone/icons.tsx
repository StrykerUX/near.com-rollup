/**
 * The phone screens' inline icon set, lifted verbatim from the original build.
 *
 * They are components rather than a sprite sheet because several of them are
 * styled by their parent's state — `.fl` fills and `.ko` knocks out on the
 * active tab icon, and `.slash` strikes through the eye when balances are
 * hidden — which a <use> reference cannot inherit.
 */

/** Scan-to-pay frame. */
export function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><path d="M4 12h16" opacity=".85" /></svg>
  );
}

/** The account-locked padlock. */
export function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="10.5" width="14" height="9.5" rx="2.6" /><path d="M8.4 10.5V7.8a3.6 3.6 0 0 1 7.2 0v2.7" /></svg>
  );
}

/** Balance visibility toggle. The `.slash` path is struck through by CSS when pressed. */
export function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.7" /><path className="slash" d="M4 20 20 4" /></svg>
  );
}

/** Receive: an arrow coming down into the account. */
export function IconReceive() {
  return (
    <svg className="bi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v13M6.5 11.5 12 17l5.5-5.5" /></svg>
  );
}

/** Send: the paper plane. */
export function IconSend() {
  return (
    <svg className="bi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 4 3.8 10.6l6.3 2.4 2.4 6.3L20 4Z" /></svg>
  );
}

/** The two-way arrows beside the fiat value on the swap screen. */
export function IconSwapDir() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 4v12M4.5 7.5 8 4l3.5 3.5M16 20V8M12.5 16.5 16 20l3.5-3.5" /></svg>
  );
}

/** Slippage sliders. */
export function IconSlippage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg>
  );
}

/** The disclosure caret on the Perps balance. */
export function IconPerpsCaret() {
  return (
    <svg className="pcar" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75 6 6.25l4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
