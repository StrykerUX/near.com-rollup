'use client';
import { useEffect, useRef } from 'react';
import type { Hand } from './deck';

/**
 * THE SPOTLIGHT
 * ==================================================================
 * The same job the hand does, without drawing a hand.
 *
 * A pointer is honest — it says a person is doing this — but it is also a
 * second thing to watch, and it arrives from wherever it was last. When what
 * you want is for the reader's eye to already BE on the control at the moment
 * it changes, the control itself is the better instrument: it lights, it is
 * pressed, it goes back to being furniture. Nothing crosses the screen and
 * nothing has to be followed.
 *
 * It reads the same `hand` the pointer does — `next` is where the script is
 * about to act, `last` is where it just did — and writes two classes:
 *
 *   .spot   on the control the next beat will press, from the moment the
 *           clock starts counting down to it
 *   .hit    on the control that beat just pressed, for the length of the
 *           acknowledgement
 *
 * Both are written straight to the DOM. A component that re-rendered the
 * device to move a highlight would be repainting a screen to change a
 * box-shadow.
 */

/** how long the pressed control stays acknowledged */
const HIT = 420;

export function Spotlight({ hand, on }: { hand: Hand; on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(0);
  const held = useRef<{ spot: HTMLElement | null; hit: HTMLElement | null }>({ spot: null, hit: null });

  const { n, last, next } = hand;

  useEffect(() => {
    const dev = ref.current?.parentElement;
    if (!dev) return;

    /* a control inside a closed sheet is laid out but unreachable — lighting
       it would put a glow behind a screen nobody can see */
    const find = (id: string | null) => {
      if (!id) return null;
      const t = dev.querySelector<HTMLElement>(`[data-tap="${id}"]`);
      const layer = t?.closest('.dlayer');
      if (!t || (layer && !layer.classList.contains('open'))) return null;
      return getComputedStyle(t).visibility === 'hidden' ? null : t;
    };

    if (!on) {
      held.current.spot?.classList.remove('spot');
      held.current.spot = null;
      return;
    }

    const timers: number[] = [];

    if (n !== seen.current) {
      seen.current = n;
      const t = find(last);
      held.current.hit?.classList.remove('hit');
      held.current.hit = t;
      if (t) {
        /* the acknowledgement replaces the anticipation on the same element,
           so it never wears both and flickers between them */
        t.classList.remove('spot');
        void t.offsetWidth;
        t.classList.add('hit');
        timers.push(window.setTimeout(() => t.classList.remove('hit'), HIT));
      }
    }

    const nx = find(next);
    if (nx !== held.current.spot) {
      held.current.spot?.classList.remove('spot');
      held.current.spot = nx;
    }
    /* re-applied every render rather than only on change: the control may have
       been remounted by a screen change since the last one, and a class on a
       node React threw away is a light that is on nowhere */
    if (nx && !nx.classList.contains('hit')) nx.classList.add('spot');

    return () => timers.forEach(clearTimeout);
  }, [n, last, next, on]);

  return <span className="dspotroot" ref={ref} aria-hidden="true" />;
}
