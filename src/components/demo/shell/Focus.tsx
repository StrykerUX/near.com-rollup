'use client';
import { useEffect, useRef } from 'react';
import type { Shot } from './flow';

/**
 * THE FOCUS
 * ==================================================================
 * The third thing built on one map, after the pointer and the ring.
 *
 * This started as a camera: the device was transformed so it pushed in on
 * whatever the step was about. It read as a magnifier rather than as attention
 * — the screen grew, the bezel stopped being a bezel, and a reader spent the
 * first half of every move re-finding where they were. Scale is a poor way to
 * say "look here" when the thing you are looking at is a phone; contrast is
 * the right one.
 *
 * So nothing moves and nothing scales. One box sits over the control the step
 * is about and casts a shadow big enough to cover the rest of the screen. The
 * control is not lit — everything else is darkened, which is the same contrast
 * and none of the disorientation. The box travels between controls, which is
 * the only motion left.
 *
 * It writes its rect straight to the DOM. Everything here is geometry read off
 * elements that other code owns, and a component that re-rendered the device to
 * move a cutout would be repainting a screen to change four numbers.
 */

/** the device's own box, which the cutout is measured inside */
const W = 352;
const H = 766;
/** breathing room around the control, so the cutout is not a tracing of it */
const PAD = 9;

export function Focus({ shot, on }: { shot?: Shot; on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef('');

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    const place = () => {
      const sel = on ? shot?.on : undefined;
      const t = sel
        ? box.querySelector<HTMLElement>(
            sel.startsWith('.') || sel.startsWith('#') ? sel : `[data-tap="${sel}"]`,
          )
        : null;
      const layer = t?.closest('.dlayer');
      const usable = !!t && (!layer || layer.classList.contains('open'))
        && getComputedStyle(t).visibility !== 'hidden';

      if (!usable || !t) {
        if (last.current === 'off') return;
        last.current = 'off';
        box.style.setProperty('--fo', '0');
        return;
      }

      const c = box.getBoundingClientRect();
      const r = t.getBoundingClientRect();
      /* the device may be scaled by the page's own fit rule, so a rect read off
         the screen is divided back into the device's own pixels */
      const k = c.width / W || 1;
      const x = (r.left - c.left) / k - PAD;
      const y = (r.top - c.top) / k - PAD;
      const w = r.width / k + PAD * 2;
      const h = r.height / k + PAD * 2;
      /* the cutout takes the control's own corner, so it reads as that control
         being uncovered rather than as a rectangle placed over it */
      const rad = parseFloat(getComputedStyle(t).borderTopLeftRadius) || 10;

      /* A control inside a sheet that is still sliding measures wherever it
         currently is, which for a closed sheet is below the phone entirely.
         Refusing a rect that is not on screen keeps the cutout where it was
         until the sheet lands, rather than sending it somewhere nobody can
         see and dimming the whole device on the way. */
      if (y + h < 0 || y > H) return;

      const next = `${x}|${y}|${w}|${h}|${rad}`;
      if (next === last.current) return;
      last.current = next;
      box.style.setProperty('--fx', `${x}px`);
      box.style.setProperty('--fy', `${y}px`);
      box.style.setProperty('--fw', `${w}px`);
      box.style.setProperty('--fh', `${h}px`);
      box.style.setProperty('--fr', `${Math.min(rad + PAD, 22)}px`);
      box.style.setProperty('--fo', '1');
    };

    place();
    /* the control may still be arriving — a sheet slides for half a second, and
       a cutout measured mid-slide frames the place it was leaving */
    const timers = [140, 340, 620].map((ms) => window.setTimeout(place, ms));
    const id = window.setInterval(place, 240);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(id);
    };
  }, [shot, on]);

  return <span className="v4focus" ref={ref} aria-hidden="true" />;
}
