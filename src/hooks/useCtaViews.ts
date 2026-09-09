'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** every button that declares a tracked position — the same attribute Umami
    turns into the `pos` property on the click event */
const CTAS = '[data-umami-event-pos]';

/**
 * POSITIONS THAT GET NO VIEW EVENT. Both nav buttons are pinned to a fixed
 * header, so they are on screen for essentially every pageview and their view
 * count would restate the pageview count under a different name. A denominator
 * that always equals the traffic is not a denominator; it is noise with two
 * rows in the dashboard. Their CLICKS are still counted — those say something.
 */
const NO_VIEW = new Set(['nav-create', 'nav-signin']);

/**
 * A button is "seen" once it has been in the viewport, and actually visible,
 * for this long. One second excludes the reader who scrolls past at speed
 * without excluding the one who glances and moves on.
 */
const DWELL_MS = 1000;

/**
 * THE DENOMINATOR
 * ==================================================================
 * The click events answer "how many pressed it". On their own they rank the
 * eight buttons by traffic, which is not the same as ranking them by how well
 * they work: the hero is passed by everyone and the closing plate by whoever
 * made it to the end, so the hero wins on volume before it has persuaded
 * anybody. Pairing each `cta-*` with a `cta-*-seen` turns that into a rate.
 *
 * IT WATCHES THE BUTTON, NOT THE SECTION AROUND IT. The obvious build is a
 * trigger per section, and it does not survive this page: on the wide
 * composition the hero and the chapters live inside a sticky, scrubbed stage
 * and never leave the viewport at all — a section trigger there fires once at
 * load and reports every chapter as seen. Asking the element itself removes the
 * question of how it got on screen.
 *
 * WHICH IS WHY `checkVisibility` IS HERE AND IS NOT OPTIONAL. That same stage
 * moves its cards with opacity and transform, and an element at `opacity: 0`
 * still intersects — IntersectionObserver has no opinion about whether a thing
 * can be SEEN, only about where its box is. Without this check the wide
 * composition would report all five chapters' buttons as viewed the moment the
 * page loaded. Where the method is missing (older Safari) the check is skipped
 * rather than failed: an overcount on a shrinking minority of browsers beats
 * counting nothing there.
 *
 * ONCE PER LOAD, PER BUTTON. Scrolling back up is the same reader looking at
 * the same button, and counting it twice would deflate a rate whose numerator
 * cannot double the same way.
 *
 * ONE EVENT NAME, POSITION AS A PROPERTY, AND IT MIRRORS THE CLICK. `cta-view`
 * and `cta-click` carry the same `pos` values, so a rate is two lists of the
 * same shape read side by side. The alternative — a distinct event name per
 * button per side — was twenty-two rows in a dashboard chosen for being simple
 * to operate, with the two halves of every ratio scattered among them.
 */
export function useCtaViews() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const fired = new Set<string>();
    const timers = new Map<Element, number>();

    const visible = (el: Element) =>
      typeof el.checkVisibility === 'function'
        ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
        : true;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const pos = (el as HTMLElement).dataset.umamiEventPos;
          if (!pos || fired.has(pos)) {
            io.unobserve(el);
            return;
          }

          if (!entry.isIntersecting) {
            const t = timers.get(el);
            if (t) { clearTimeout(t); timers.delete(el); }
            return;
          }

          if (timers.has(el)) return;
          timers.set(
            el,
            window.setTimeout(() => {
              timers.delete(el);
              /* re-checked at the END of the dwell, not the start: the whole
                 point is that it was still there a second later */
              if (!visible(el) || fired.has(pos)) return;
              fired.add(pos);
              track('cta-view', { pos });
              io.unobserve(el);
            }, DWELL_MS),
          );
        });
      },
      /* half the button, because a CTA cut by the fold is not a CTA the reader
         has been offered */
      { threshold: 0.5 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(CTAS).forEach((el) => {
        const pos = el.dataset.umamiEventPos ?? '';
        if (!NO_VIEW.has(pos) && !fired.has(pos)) io.observe(el);
      });
    };
    scan();

    /* the composition swap again — see the note in useAcquisition */
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; scan(); });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      if (queued) cancelAnimationFrame(queued);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);
}
