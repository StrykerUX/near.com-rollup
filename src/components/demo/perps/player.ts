'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { applyBeat } from '@/components/stage/phone/flows/machine';
import type { PD, PDAction } from './state';
import { BEATS, MACHINE, STARTS, STEPS, frameAt, stepOf } from './script';

/**
 * THE DECK
 * ==================================================================
 * One state, driven from three places that must never disagree: the clock,
 * the step rail, and the reader's own finger.
 *
 * The rules:
 *   · the clock plays the script at `PACE`, slower than real use on purpose
 *   · clicking a step SEEKS — folds the beats up to it and starts there
 *   · touching the app takes the wheel: the clock waits `IDLE_MS`, then the
 *     script picks up from wherever the gesture landed (see `anchor`)
 *
 * Nothing here is scrubbed by scroll. A screen that only moves while the
 * reader's wheel does is dead the moment they stop, and stopping is exactly
 * when they are looking at it.
 */

/** the demo runs slower than a person would. It is being read, not used. */
export const PACE = 1.25;
/** how long the script waits after a gesture before it resumes */
export const IDLE_MS = 5200;

const OUTRO = MACHINE.outro ?? 3000;

/** cumulative script time at the head of each beat, for the progress bar */
const ELAPSED: number[] = (() => {
  const out: number[] = [];
  let t = 0;
  for (const b of BEATS) {
    out.push(t);
    t += b.ms;
  }
  out.push(t);
  return out;
})();
const TOTAL = ELAPSED[ELAPSED.length - 1] + OUTRO;

export type Deck = {
  s: PD;
  /** which step is showing */
  step: number;
  playing: boolean;
  /** true while the reader has the wheel and the script is waiting */
  held: boolean;
  /** 0..1 through the whole script */
  progress: number;
  /** counts up once per loop; hand it to a `key` to replay an entrance */
  pass: number;
  can: (a: PDAction, arg?: string) => (() => void) | null;
  seek: (step: number) => void;
  next: () => void;
  prev: () => void;
  toggle: () => void;
};

type Cur = { s: PD; i: number; t: number; pass: number };

export function useDeck(): Deck {
  const reduce = useReducedMotion();

  /* `cur` IS the state; `view` is only its render mirror. The clock keeps the
     current beat's leftover milliseconds in `cur.current.t`, and `view` only
     changes on a beat boundary — so syncing the ref from the render (the
     obvious-looking `cur.current = view`) would throw that remainder away on
     every unrelated re-render and restart the beat's timer from zero. There is
     exactly one writer of this ref: the code below. */
  const [view, setView] = useState<Cur>(() => ({ s: { ...MACHINE.initial }, i: -1, t: 0, pass: 0 }));
  const cur = useRef<Cur>(view);
  const commit = useCallback((next: Cur) => {
    cur.current = next;
    setView(next);
  }, []);

  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  /* while > now the script waits: the reader is driving */
  const holdUntil = useRef(0);

  /* ---- the clock ------------------------------------------------------ */

  useEffect(() => {
    if (reduce || !playing) return;
    let raf = 0;
    let prev = 0;

    raf = requestAnimationFrame(function step(now) {
      raf = requestAnimationFrame(step);
      if (!prev) prev = now;
      const dt = now - prev;
      prev = now;
      if (now < holdUntil.current) return;

      const c = cur.current;
      let { i, t, pass } = c;
      let s = c.s;
      t += dt / PACE;
      let dirty = false;

      /* advance as many beats as this frame covers — a dropped frame should
         cost the script time, not beats */
      for (;;) {
        if (i >= BEATS.length - 1) {
          if (t < OUTRO) break;
          t -= OUTRO;
          i = -1;
          pass += 1;
          s = { ...MACHINE.initial };
          dirty = true;
          continue;
        }
        const nx = BEATS[i + 1];
        if (t < nx.ms) break;
        t -= nx.ms;
        i += 1;
        s = applyBeat(MACHINE, s, nx);
        dirty = true;
      }

      const next = { s, i, t, pass };
      cur.current = next;
      /* the remainder rides in the ref every frame; React only hears about it
         when a beat actually turns over */
      if (dirty) setView(next);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, reduce]);

  /* the hold badge is a render concern; the clock keeps its own copy in a ref
     so it never waits for React to hear that the reader let go */
  useEffect(() => {
    if (!held) return;
    const id = setTimeout(() => setHeld(false), IDLE_MS);
    return () => clearTimeout(id);
  }, [held, view]);

  /* ---- seeking -------------------------------------------------------- */

  const seek = useCallback(
    (step: number) => {
      const k = Math.max(0, Math.min(STEPS.length - 1, step));
      const i = STARTS[k];
      holdUntil.current = 0;
      setHeld(false);
      commit({ s: frameAt(i), i, t: 0, pass: cur.current.pass });
    },
    [commit],
  );

  const stepNow = stepOf(view.i);
  const next = useCallback(() => seek(stepOf(cur.current.i) + 1), [seek]);
  const prev = useCallback(() => seek(stepOf(cur.current.i) - 1), [seek]);
  const toggle = useCallback(() => setPlaying((p) => !p), []);

  /* ---- the reader ----------------------------------------------------- */

  const fire = useCallback(
    (a: PDAction, arg?: string) => {
      const c = cur.current;
      const patch = MACHINE.actions[a](c.s, arg);
      if (!patch) return;
      const s = { ...c.s, ...patch };
      /* an anchored gesture MOVES THE PLAYHEAD */
      const at = MACHINE.anchor?.[a];
      const i = at === undefined ? c.i : at;
      commit({ s, i, t: 0, pass: c.pass });
      holdUntil.current = performance.now() + IDLE_MS;
      setHeld(true);
    },
    [commit],
  );

  /* A settlement checklist is not waiting for anyone: it ticks because the
     network came back. While the reader holds the wheel there is no script to
     do that, so the machine's own `auto` does it — the same transition the
     beats fire, so there is still only one way for a checklist to tick.
     ONLY while the reader holds it. This used to also run whenever the clock
     was paused, which quietly made the pause button a lie: stop the script on
     a submitted order and the checklist finished anyway, on its own timer. */
  useEffect(() => {
    if (reduce || !held) return;
    const nx = MACHINE.auto?.(view.s);
    if (!nx) return;
    const id = setTimeout(() => {
      const patch = MACHINE.actions[nx.do](cur.current.s, nx.arg);
      if (patch) commit({ ...cur.current, s: { ...cur.current.s, ...patch }, t: 0 });
    }, nx.after);
    return () => clearTimeout(id);
  }, [reduce, held, view.s, commit]);

  const can = useCallback(
    (a: PDAction, arg?: string) => {
      /* a guard that refuses now is a control that should not look live now */
      if (!MACHINE.actions[a](view.s, arg)) return null;
      return () => fire(a, arg);
    },
    [view.s, fire],
  );

  const progress = useMemo(() => {
    const base = view.i < 0 ? 0 : ELAPSED[view.i] + BEATS[view.i].ms;
    return Math.max(0, Math.min(1, (base + view.t) / TOTAL));
  }, [view.i, view.t]);

  /* Reduced motion gets one honest frame and no loop: the position, open, with
     everything the page spent eight chapters building. */
  const restStep = stepOf(MACHINE.restFrame);

  return {
    s: reduce ? frameAt(MACHINE.restFrame) : view.s,
    step: reduce ? restStep : stepNow,
    playing: reduce ? false : playing,
    held,
    progress: reduce ? 1 : progress,
    pass: view.pass,
    can,
    seek,
    next,
    prev,
    toggle,
  };
}
