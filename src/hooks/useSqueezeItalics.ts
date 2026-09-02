'use client';
import { useEffect } from 'react';

/**
 * THE ITALIC SQUEEZE
 *
 * Kepler's Condensed is its narrowest width, so the extra squeeze is a scaleX.
 * A transform doesn't shrink the line box, which would leave a gap after every
 * italic and pull centred lines off-centre — so each one gets negative margins
 * totalling the width the transform reclaimed. The origin is 50%, so the word
 * shrinks toward its own centre and the compensation splits evenly.
 *
 * The compensation is only correct for the face actually rendering. Keying it
 * to `document.fonts.ready` is a race that is lost more often than won: the
 * promise can resolve while the Kepler kit's own faces are still swapping in,
 * and a margin measured against the fallback serif is ~40% too wide — the
 * comma-space before every italic disappears.
 *
 * A ResizeObserver on the italics themselves is the honest signal: it fires
 * exactly when a word's box changes, whatever caused it — the font landing, a
 * reflow, a breakpoint. Writing a margin cannot re-trigger it, because margins
 * sit outside the box being observed, so there is no feedback loop.
 */
export function useSqueezeItalics() {
  useEffect(() => {
    const squeeze = (el: HTMLElement, sx: number) => {
      /* clear first: the margins are outside the measured box, but clearing
         keeps the value honest if --it-x ever changes at a breakpoint */
      el.style.marginLeft = el.style.marginRight = '';
      const m = (-((1 - sx) * el.offsetWidth) / 2).toFixed(1) + 'px';
      el.style.marginLeft = el.style.marginRight = m;
    };

    const run = () => {
      document.querySelectorAll<HTMLElement>('.display em, .h1 em').forEach((el) => {
        /* OFF THE ELEMENT, NOT OFF THE ROOT. The compensation belongs to the
           face being rendered, and not every emphasised run is Kepler any
           more — the tour's headlines set theirs in Montreal, which must not
           be squeezed, and say so by declaring `--it-x: 1` on themselves. Read
           from the root, this gave those runs a -7% margin on both sides for a
           transform that was never applied to them, and the word overlapped
           its neighbours. */
        const sx = parseFloat(getComputedStyle(el).getPropertyValue('--it-x')) || 1;
        if (sx === 1) {
          el.style.marginLeft = el.style.marginRight = '';
          return;
        }
        squeeze(el, sx);
      });
    };

    run();

    const ro = new ResizeObserver(() => run());
    document.querySelectorAll<HTMLElement>('.display em, .h1 em').forEach((el) => ro.observe(el));

    /* the ResizeObserver covers the font swap; these cover the cases where the
       box does NOT change but the correct margin does — a viewport resize that
       only moves --it-x, and the initial load on a cold cache */
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(run, 160);
    };
    addEventListener('resize', onResize);
    addEventListener('load', run);

    return () => {
      ro.disconnect();
      removeEventListener('resize', onResize);
      removeEventListener('load', run);
      clearTimeout(timer);
    };
  }, []);
}
