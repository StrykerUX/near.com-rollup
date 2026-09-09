'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { subscribeActiveFace } from '@/stage/bus';

/**
 * Longer than a button's dwell, because this is prose. Two seconds is the
 * difference between a chapter that was scrolled through and one that was
 * read at — or at least stopped at, which is as much as any of this can honestly
 * claim to measure.
 */
const DWELL_MS = 2000;

/**
 * HOW FAR DOWN THEY GOT
 * ==================================================================
 * Five chapters, one event with the number as a property, fired at most once
 * per chapter per load. It is the shape of the drop-off, and it is what makes
 * a low count on the closing CTA readable: nobody pressed it because nobody
 * reached it is a different problem from nobody pressed it because it does not
 * persuade. Opening `chapter` in the dashboard lists 1 to 5 by count, which is
 * the funnel, in order, without five rows competing with everything else.
 *
 * TWO COMPOSITIONS, TWO MECHANISMS, ONE EVENT NAME. The page draws its
 * chapters in ways that have nothing in common:
 *
 *   WIDE — a sticky stage with a scrubbed timeline. Nothing enters or leaves
 *     the viewport, so there is no intersection to observe. The engine already
 *     publishes which card owns the frame (`stage/bus.ts`), including -1 while
 *     a move is in flight, and that signal is strictly better than anything an
 *     observer could infer: it is the same number the composition itself acts
 *     on, and its -1 gives the dwell timer a natural cancel.
 *
 *   NARROW — five ordinary sections in normal flow. An observer is exactly
 *     right, and the engine is not even running.
 *
 * Both write `chapter` with the same `n`, so the funnel reads as one series
 * whatever the reader is holding. Umami records screen size on every event
 * already, so the split is still available without a property saying so.
 *
 * THE MIDDLE BAND, NOT THE EDGE. A chapter on a phone is taller than the
 * viewport, so `threshold: 0.5` would never be met and the event would never
 * fire — the failure would look exactly like a reader who never scrolled. The
 * margin shrinks the root to its middle 40% instead, which asks the question
 * that was meant: is this chapter what is in front of them.
 */
export function useChapterViews() {
  useEffect(() => {
    const fired = new Set<number>();
    const send = (i: number) => {
      if (i < 0 || fired.has(i)) return;
      fired.add(i);
      track('chapter', { n: i + 1 });
    };

    /* ---- WIDE: the engine's own answer ---------------------------------- */
    let faceTimer = 0;
    const offFace = subscribeActiveFace((i) => {
      if (faceTimer) { clearTimeout(faceTimer); faceTimer = 0; }
      /* -1 is "no card owns the frame" — mid-move, or the closing plate has
         taken over. Either way the previous chapter's dwell is void. */
      if (i < 0 || fired.has(i)) return;
      faceTimer = window.setTimeout(() => { faceTimer = 0; send(i); }, DWELL_MS);
    });

    /* ---- NARROW: five sections in normal flow --------------------------- */
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let queued = 0;
    const timers = new Map<Element, number>();

    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            const i = Number((el as HTMLElement).dataset.ch ?? -1);
            if (i < 0 || fired.has(i)) { io?.unobserve(el); return; }

            if (!entry.isIntersecting) {
              const t = timers.get(el);
              if (t) { clearTimeout(t); timers.delete(el); }
              return;
            }
            if (timers.has(el)) return;
            timers.set(el, window.setTimeout(() => {
              timers.delete(el);
              send(i);
              io?.unobserve(el);
            }, DWELL_MS));
          });
        },
        { rootMargin: '-30% 0px -30% 0px', threshold: 0 },
      );

      const scan = () => {
        document.querySelectorAll<HTMLElement>('[data-ch]').forEach((el) => {
          if (!fired.has(Number(el.dataset.ch ?? -1))) io?.observe(el);
        });
      };
      scan();

      mo = new MutationObserver(() => {
        if (queued) return;
        queued = requestAnimationFrame(() => { queued = 0; scan(); });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      offFace();
      if (faceTimer) clearTimeout(faceTimer);
      mo?.disconnect();
      io?.disconnect();
      if (queued) cancelAnimationFrame(queued);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);
}
