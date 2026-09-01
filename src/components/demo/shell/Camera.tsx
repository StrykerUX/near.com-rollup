'use client';
import { useEffect, useRef } from 'react';
import type { Shot } from './flow';

/**
 * THE CAMERA
 * ==================================================================
 * The third thing built on one idea. A flow already declares WHERE each
 * transition lands — `target` names a control's `data-tap` — and that map has
 * driven a pointer travelling to it and a ring lighting on it. Here it moves a
 * camera: the device is pushed in and framed on whatever the step is about, and
 * pulled back out when the step is about the whole screen.
 *
 * It is a transform on a wrapper, not a change of layout: the device keeps its
 * 352 x 766 box and every measurement inside it — the spotlight's rects, the
 * chart's canvas, the sheets' slides — is untouched. Text scales as text
 * because a CSS transform rasterises at the scaled size, so a 1.5x push in is
 * sharper type, not a blown-up screenshot.
 *
 * THE FRAMING IS CLAMPED TO THE DEVICE. Centring a control near an edge would
 * otherwise pan past the bezel and show the scene behind it, which is the one
 * thing that would break the illusion that this is a phone.
 */

/** the device's own box, which is also the frame the camera moves inside */
const W = 352;
const H = 766;

export function Camera({ shot, on }: { shot?: Shot; on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef('');

  useEffect(() => {
    const el = ref.current;
    const cam = el?.parentElement;
    if (!el || !cam) return;

    const place = () => {
      let z = on ? shot?.z ?? 1 : 1;
      let cx = W / 2;
      let cy = H / 2;

      const sel = shot?.on;
      if (on && sel && z !== 1) {
        const t = cam.querySelector<HTMLElement>(
          sel.startsWith('.') || sel.startsWith('#') ? sel : `[data-tap="${sel}"]`,
        );
        const layer = t?.closest('.dlayer');
        const usable = t && (!layer || layer.classList.contains('open'))
          && getComputedStyle(t).visibility !== 'hidden';
        if (usable && t) {
          /* the device is inside this wrapper and already transformed, so the
             rect is read against the wrapper's own box and divided back out */
          const c = cam.getBoundingClientRect();
          const r = t.getBoundingClientRect();
          const k = c.width / W || 1;
          cx = (r.left - c.left + r.width / 2) / k;
          cy = (r.top - c.top + r.height / 2) / k;
          /* NEVER CROP THE THING YOU ARE FRAMING. A declared zoom is a wish;
             this is the most it can be granted before the target's own ends
             leave the frame. The leverage shot asked for 1.45 on a row that
             spans the device and cut the figure it existed to show. */
          const tw = r.width / k;
          z = Math.max(1, Math.min(z, W / (tw + 44)));
        }
      }

      /* translate so the focus lands in the middle, then refuse to pan past
         the edges — the frame may never contain anything that is not screen */
      const tx = Math.min(0, Math.max(W - W * z, W / 2 - cx * z));
      const ty = Math.min(0, Math.max(H - H * z, H / 2 - cy * z));
      const next = `${tx}|${ty}|${z}|${cx}|${cy}`;
      if (next === last.current) return;
      last.current = next;

      cam.style.setProperty('--camx', `${tx}px`);
      cam.style.setProperty('--camy', `${ty}px`);
      cam.style.setProperty('--camz', String(z));
      /* the vignette rides the same numbers, in the device's own coordinates */
      cam.style.setProperty('--focusx', `${cx}px`);
      cam.style.setProperty('--focusy', `${cy}px`);
      cam.classList.toggle('near', z > 1.05);
    };

    place();
    /* the control may still be arriving: a sheet slides for half a second, and
       a camera that measured mid-slide frames the place it was leaving */
    const timers = [160, 360, 640].map((ms) => window.setTimeout(place, ms));
    const id = window.setInterval(place, 260);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(id);
    };
  }, [shot, on]);

  return <span className="dcamroot" ref={ref} aria-hidden="true" />;
}
