'use client';
import { useEffect, useRef } from 'react';
import type { Hand as HandState } from './deck';

/**
 * THE HAND
 * ==================================================================
 * A touch point that travels to a control, presses it, and moves on.
 *
 * Without it these pages are a sequence of states: the ticket is empty, then
 * it says 700, and nothing on screen connects the two. A person reaches for a
 * key BEFORE they press it, so the travel is the part that has to be visible —
 * the deck resolves the next beat's control while the clock is still counting
 * down to it, and the hand is already there when the state changes.
 *
 * It writes its position straight to the DOM and toggles a class on the
 * control it lands on. Nothing goes through React state: the position changes
 * on a timer inside an animation, and a component that re-rendered the whole
 * device for it would be paying for a moving dot with a repaint of the screen
 * underneath.
 */

/**
 * How long the hand rests on a control after pressing it, before it aims at
 * the next one. It has to be SHORTER than the shortest gap in a script, or the
 * hand never travels — it only ever teleports on the press, which is the exact
 * effect the whole component exists to avoid. 200 leaves room for the 300ms
 * glide inside the ~375ms a typed digit gets.
 */
const DWELL = 200;
/** how long the pressed control stays lit */
const FLASH = 240;
/**
 * Controls MOVE under the hand: a sheet slides for half a second before the key
 * inside it is where it will end up, the ticket reflows when a field appears,
 * the window resizes. Measuring once per change and hoping meant the hand
 * simply vanished whenever it measured mid-slide.
 *
 * So it re-reads when a transition or an entrance ENDS — which is exactly when
 * a control has finished moving — and keeps a slow tick as the safety net for
 * everything that moves without announcing it. Two rect reads five times a
 * second is nothing.
 */
const TICK = 200;

/**
 * WHERE A CONTROL IS, IN THE DEVICE'S OWN PIXELS — or nowhere.
 *
 * A closed sheet is translated down by its own height and hidden, but it is
 * still laid out, so the keypad inside the ticket has a real rect four hundred
 * pixels below the phone. Anything inside a layer that is not open, hidden
 * outright, or outside the device's box, is not somewhere a finger can be.
 */
function place(dev: HTMLElement, el: HTMLElement, id: string | null): HTMLElement | null {
  const off = () => {
    el.classList.add('off');
    return null;
  };
  if (!id) return off();

  const t = dev.querySelector<HTMLElement>(`[data-tap="${id}"]`);
  if (!t) return off();
  const layer = t.closest('.dlayer');
  if (layer && !layer.classList.contains('open')) return off();
  if (getComputedStyle(t).visibility === 'hidden') return off();

  /* The device is drawn at 352x766 and SCALED as a whole, so a rect read off
     the page is in scaled pixels while this element is positioned in the
     device's own. One divide reconciles them. */
  const d = dev.getBoundingClientRect();
  const r = t.getBoundingClientRect();
  const k = d.width / dev.offsetWidth || 1;
  const x = (r.left - d.left + r.width / 2) / k;
  const y = (r.top - d.top + r.height / 2) / k;
  if (y < -12 || y > dev.offsetHeight + 12) return off();

  el.style.setProperty('--tx', `${x}px`);
  el.style.setProperty('--ty', `${y}px`);
  el.classList.remove('off');
  return t;
}

export function Hand({ hand, on }: { hand: HandState; on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  /** the control the hand should be pointing at right now */
  const want = useRef<string | null>(null);
  const seen = useRef(0);
  const lit = useRef<HTMLElement | null>(null);

  const { n, last, next } = hand;

  /* the tick: one job, and it runs for the life of the component */
  useEffect(() => {
    const el = ref.current;
    const dev = el?.parentElement;
    if (!el || !dev) return;
    const beat = () => place(dev, el, want.current);
    beat();

    /* capture, because these fire on the sheet and the fields, not on `dev` */
    dev.addEventListener('transitionend', beat, true);
    dev.addEventListener('animationend', beat, true);
    window.addEventListener('resize', beat);
    const id = window.setInterval(beat, TICK);
    return () => {
      clearInterval(id);
      dev.removeEventListener('transitionend', beat, true);
      dev.removeEventListener('animationend', beat, true);
      window.removeEventListener('resize', beat);
    };
  }, []);

  /* the press: land, light the control, dwell, then aim at the next one */
  useEffect(() => {
    const el = ref.current;
    const dev = el?.parentElement;
    if (!el || !dev) return;

    if (!on) {
      want.current = null;
      el.classList.add('off');
      return;
    }

    if (n === seen.current) {
      want.current = next;
      place(dev, el, next);
      return;
    }

    seen.current = n;
    want.current = last;
    const t = place(dev, el, last);

    el.classList.remove('press');
    /* reading the box restarts the animation; without it a run of presses on
       the same key only ripples once */
    void el.offsetWidth;
    if (t) el.classList.add('press');

    lit.current?.classList.remove('tapped');
    lit.current = t;
    const timers: number[] = [];
    if (t) {
      t.classList.add('tapped');
      timers.push(window.setTimeout(() => t.classList.remove('tapped'), FLASH));
    }
    timers.push(window.setTimeout(() => {
      want.current = next;
    }, DWELL));
    return () => timers.forEach(clearTimeout);
  }, [n, last, next, on]);

  return <span className="dhand off" ref={ref} aria-hidden="true"><i /></span>;
}
