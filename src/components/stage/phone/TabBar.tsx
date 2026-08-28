/**
 * The app's footer tab bar. ONE row serves all four screens — the engine swaps
 * `aria-current` at the midpoint of a transition, while both content faces are
 * in motion, so the change hides inside the move.
 *
 * OUTLINE icons matched to the real app. Closed shapes carry `.fl`: transparent
 * at rest, FILLED with the stroke green when active. Interior details carry
 * `.ko`: they knock out to the footer-band colour on the active icon so they
 * stay readable.
 *
 * It renders once and is never re-rendered — the engine owns the active state,
 * because it changes every frame of a move and React has no business in that
 * loop.
 */
export function TabBar() {
  return (
    <nav className="tabbar" aria-label="App sections">
      <button className="tab" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path className="fl" d="M12 4.6l7.4 5.9V18a1.9 1.9 0 0 1-1.9 1.9H6.5A1.9 1.9 0 0 1 4.6 18v-7.5z" /><path className="ko" d="M10.2 19.6v-3.2a1.8 1.8 0 0 1 3.6 0v3.2" /></svg>
        <span>Home</span>
      </button>
      <button className="tab" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path className="fl" d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z" /><path className="ko" d="M15.4 12.5h2.4" /></svg>
        <span>Earn</span>
      </button>
      <button className="tab" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect className="fl" x="4" y="4.5" width="16" height="15" rx="3.4" /><path className="ko" d="M8 10.3h8l-2.1-2.1M16 13.7H8l2.1 2.1" /></svg>
        <span>Swap</span>
      </button>
      <button className="tab" type="button" aria-current="page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8.2 4.8v2.4M8.2 16.8v2.4M12 4.2v3M12 15.6v3.6M15.8 5.4v2.4M15.8 15v2.4" /><rect className="fl" x="6.9" y="7.2" width="2.6" height="9.6" rx="1.1" /><rect className="fl" x="14.5" y="7.8" width="2.6" height="7.2" rx="1.1" /></svg>
        <span>Perps</span>
      </button>
      <button className="tab" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect className="fl" x="4.5" y="4.5" width="6.2" height="6.2" rx="1.9" /><rect className="fl" x="13.3" y="4.5" width="6.2" height="6.2" rx="1.9" /><rect className="fl" x="4.5" y="13.3" width="6.2" height="6.2" rx="1.9" /><rect className="fl" x="13.3" y="13.3" width="6.2" height="6.2" rx="1.9" /></svg>
        <span>Menu</span>
      </button>
    </nav>
  );
}
