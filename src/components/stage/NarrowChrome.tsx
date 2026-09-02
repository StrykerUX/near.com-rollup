'use client';
import { useEffect } from 'react';

/**
 * THE TWO THINGS THE ENGINE DID FOR THE WHOLE PAGE, NOT JUST FOR THE STAGE
 * ==================================================================
 * The narrow composition does not run the stage engine (see useStageEngine),
 * and two of the engine's jobs were never really about the stage:
 *
 *   · THE NAV'S THEME. It ships dark and transparent, and turns light when the
 *     cream paper arrives under it. On a wide frame that is driven off the
 *     shrink clock, because the shrink is what turns the page cream. Here the
 *     paper simply scrolls up, so the signal is the stage's bottom edge
 *     passing under the nav.
 *   · THE FIXED CTA BAR. Revealed once the reader is past the head of the
 *     page, so it never competes with the CTA that is already up there.
 *
 * Both are observers rather than scroll handlers: two edges crossing two
 * lines, which is exactly what IntersectionObserver is for and is one
 * callback per crossing instead of one per scroll event.
 *
 * `theme-color` goes with the nav, so the browser's own chrome matches the
 * paper the page is on at the top of the frame.
 */
export function NarrowChrome() {
  useEffect(() => {
    const nav = document.getElementById('nav');
    const meta = document.querySelector('meta[name="theme-color"]');
    const stage = document.getElementById('stage');
    const top = document.querySelector('.mtop');
    const root = document.documentElement;
    const dead: (() => void)[] = [];

    if (stage && 'IntersectionObserver' in window) {
      /* THE SUBJECT IS THE DARK PART, NOT THE LIGHT ONE, and getting that
         backwards cost a debugging pass. Observing `.light` and asking "is its
         top edge above the nav" only answers on the frames the observer
         happens to fire, and an element several screens tall crosses the
         shifted root ONCE — on the way in, while its top edge is still most of
         a viewport below the nav. It then never fires again, so the nav stayed
         dark down the whole cream page.

         `#stage` inverts it into a question an observer answers by design: the
         root is shrunk by the nav's own height, so the moment the stage's
         bottom edge passes under the nav it stops intersecting, and that IS
         the crossing. One boolean, no geometry, and it fires in both
         directions.

         This is the same signal the engine's `pastStage` is, which is what
         keeps the two compositions' navs behaving alike. */
      const io = new IntersectionObserver(
        (es) => {
          const on = !es[es.length - 1].isIntersecting;
          nav?.classList.toggle('on-light', on);
          meta?.setAttribute('content', on ? '#F3F2EF' : '#000000');
        },
        { rootMargin: '-63px 0px 0px 0px' },
      );
      io.observe(stage);
      dead.push(() => io.disconnect());
    }

    if (top && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (es) => {
          const gone = !es[es.length - 1].isIntersecting;
          root.classList.toggle('hero-gone', gone);
          const bar = document.getElementById('mobcta');
          if (!bar) return;
          bar.setAttribute('aria-hidden', gone ? 'false' : 'true');
          const link = bar.querySelector('a');
          if (link) link.tabIndex = gone ? 0 : -1;
        },
        { threshold: 0 },
      );
      io.observe(top);
      dead.push(() => io.disconnect());
    }

    return () => {
      dead.forEach((f) => f());
      /* leave the page as the wide composition expects to find it, since
         crossing the breakpoint hands control back to the engine */
      nav?.classList.remove('on-light');
      root.classList.remove('hero-gone');
    };
  }, []);

  return null;
}
