'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subscribeActiveFace } from '@/stage/bus';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { IDLE_MS, PACE, useMode, type Mode } from './mode';
import { applyBeat, stateAt, type Machine } from './machine';

/**
 * THE FLOW PLAYER
 * ==================================================================
 * One state, three drivers. The state lives here and only here; the clock and
 * the reader both reach it through the machine's transitions, so there is no
 * second copy of the truth to fall out of step.
 *
 * The flow keeps its OWN clock. It is not scrubbed by scroll: a screen that
 * only moves while the reader's wheel does is dead the moment they stop, and
 * stopping is exactly when they are looking at it.
 *
 * A flow runs only while its card is the landed one on stage, and it rewinds
 * when the card leaves — coming back to a screen halfway through a keypad
 * entry reads as something left dirty.
 */

export type Flow<S, A extends string> = {
  s: S;
  /** true while this card is the landed one on stage */
  live: boolean;
  /** counts up once per loop; hand it to a `key` to replay an entrance */
  pass: number;
  /** true during the outro hold, so the screen can fade before it restarts */
  looping: boolean;
  mode: Mode;
  /**
   * Fire a transition, if this mode allows it from this state. Returns null
   * for a control that should not respond — hand that straight to a `role` so
   * a dead control is also unfocusable.
   */
  can: (a: A, arg?: string) => (() => void) | null;
  /** true while the reader has the wheel and the script is waiting */
  held: boolean;
  /** free mode only: back to the top */
  reset: () => void;
};

type Cur<S> = { s: S; i: number; t: number; pass: number; looping: boolean };

export function useFlow<S, A extends string>(faceIndex: number, m: Machine<S, A>): Flow<S, A> {
  const mode = useMode();
  const reduce = useReducedMotion();
  const outro = m.outro ?? 900;
  const pace = PACE[mode];

  const [live, setLive] = useState(false);
  useEffect(() => subscribeActiveFace((i) => setLive(i === faceIndex)), [faceIndex]);

  /* Free mode never runs the clock, so it starts where the reader would find
     the app: at the top, doing nothing. */
  const boot = useCallback(
    (): Cur<S> => ({ s: { ...m.initial }, i: -1, t: 0, pass: 0, looping: false }),
    [m],
  );

  /* `cur` IS THE STATE. `view` is only its render mirror.
     This used to read `cur.current = view` on every render, which looked like
     ordinary ref-syncing and was in fact a bug with teeth: the clock keeps its
     leftover milliseconds in `cur.current.t`, and `view` only changes on a
     beat boundary — so every unrelated re-render (a `held` flip, a `live`
     flip, a parent repaint) threw that remainder away and restarted the
     current beat's timer from zero. On a screen that re-renders often enough,
     the script never reached its next beat at all. There is exactly one
     writer of this ref: the code below. */
  const [view, setView] = useState<Cur<S>>(boot);
  const cur = useRef<Cur<S>>(view);
  /* stable: `setView` is, and `cur` is a ref — so it can sit in a dep array
     without invalidating anything that holds it */
  const commit = useCallback((next: Cur<S>) => {
    cur.current = next;
    setView(next);
  }, []);
  /* while > now the script waits: the reader is driving */
  const holdUntil = useRef(0);
  const [held, setHeld] = useState(false);

  /* ---- the clock ------------------------------------------------------ */

  useEffect(() => {
    if (reduce || !live || mode === 'free') return;
    let raf = 0;
    let prev = 0;

    raf = requestAnimationFrame(function step(now) {
      raf = requestAnimationFrame(step);
      if (!prev) prev = now;
      const dt = now - prev;
      prev = now;

      const waiting = now < holdUntil.current;
      if (waiting) return;

      const c = cur.current;
      let { i, t, pass, looping } = c;
      let s = c.s;
      t += dt / pace;
      let dirty = false;

      /* advance as many beats as this frame covers — a dropped frame should
         cost the script time, not beats */
      for (;;) {
        if (i >= m.beats.length - 1) {
          if (t < outro) break;
          /* round the loop: back to the top, one pass on */
          t -= outro;
          i = -1;
          pass += 1;
          looping = false;
          s = { ...m.initial };
          dirty = true;
          continue;
        }
        const next = m.beats[i + 1];
        if (t < next.ms) break;
        t -= next.ms;
        i += 1;
        s = applyBeat(m, s, next);
        dirty = true;
      }

      /* the outro is the pause that lets an outcome sit there before the
         screen breathes out and starts again */
      const nowLooping = i >= m.beats.length - 1;
      if (nowLooping !== looping) {
        looping = nowLooping;
        dirty = true;
      }

      const next = { s, i, t, pass, looping };
      cur.current = next;
      /* the remainder is carried in the ref every frame; React only hears
         about it when a beat actually turns over */
      if (dirty) setView(next);
    });
    return () => cancelAnimationFrame(raf);
  }, [live, reduce, mode, m, outro, pace]);

  /* the hold flag is a render concern; the clock keeps its own copy in a ref
     so it never has to wait for React to tell it the reader let go */
  useEffect(() => {
    if (!held) return;
    const id = setTimeout(() => setHeld(false), IDLE_MS);
    return () => clearTimeout(id);
  }, [held, view]);

  /* rewind when the card leaves the stage */
  useEffect(() => {
    if (live || mode === 'free') return;
    holdUntil.current = 0;
    setHeld(false);
    commit(boot());
  }, [live, mode, boot, commit]);

  /* ---- the reader ----------------------------------------------------- */

  const fire = useCallback(
    (a: A, arg?: string) => {
      const c = cur.current;
      const patch = m.actions[a](c.s, arg);
      if (!patch) return;
      const s = { ...c.s, ...patch };
      /* An anchored gesture MOVES THE PLAYHEAD. Without this the script would
         resume from its own place and immediately undo what the reader just
         did, which is the single thing that makes a half-interactive demo feel
         like it is fighting you. */
      const at = m.anchor?.[a];
      const i = at === undefined ? c.i : at;
      commit({ s, i, t: 0, pass: c.pass, looping: false });
      if (mode !== 'free') {
        holdUntil.current = performance.now() + IDLE_MS;
        setHeld(true);
      }
    },
    [m, mode, commit],
  );

  /* With no clock running, a state that should move on its own has to be given
     a timer. Only in free mode: the scripted modes have beats for this, and two
     things advancing the same checklist would race. */
  useEffect(() => {
    if (mode !== 'free' || reduce || !live) return;
    const nx = m.auto?.(view.s);
    if (!nx) return;
    const id = setTimeout(() => fire(nx.do, nx.arg), nx.after);
    return () => clearTimeout(id);
  }, [mode, reduce, live, m, view.s, fire]);

  const open = useMemo(
    () => (mode === 'free' ? null : new Set(m.guided(view.s))),
    [mode, m, view.s],
  );

  const can = useCallback(
    (a: A, arg?: string) => {
      if (mode === 'demo') return null;
      if (open && !open.has(a)) return null;
      /* a guard that refuses now is a control that should not look live now */
      if (!m.actions[a](cur.current.s, arg)) return null;
      return () => fire(a, arg);
    },
    [mode, open, m, fire],
  );

  const reset = useCallback(() => {
    holdUntil.current = 0;
    setHeld(false);
    commit(boot());
  }, [boot, commit]);

  /* Reduced motion gets one honest frame and no loop — but still only on the
     card that is on stage. Resting every face at its rest frame at once put
     two open sheets into the shell's single portal slot. */
  const s = reduce ? (live ? stateAt(m, m.restFrame) : m.initial) : view.s;

  return {
    s,
    live,
    pass: reduce ? 0 : view.pass,
    looping: reduce ? false : view.looping,
    mode,
    can: reduce && mode !== 'free' ? () => null : can,
    held,
    reset,
  };
}
