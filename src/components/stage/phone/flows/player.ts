'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { subscribeActiveFace } from '@/stage/bus';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * THE FLOW PLAYER
 * ==================================================================
 * Each demo screen is a SCRIPT: an ordered list of beats, each with a duration
 * and a patch. The state at any moment is `initial` plus every patch up to the
 * current beat, which makes a flow a pure function of elapsed time.
 *
 * The flow keeps its OWN clock. It is not scrubbed by scroll: a screen that
 * only moves while the reader's wheel does is a screen that is dead the moment
 * they stop, and stopping is exactly when they are looking at it.
 *
 * A flow runs only while its card is the landed one on stage, and it rewinds
 * when the card leaves — coming back to a screen halfway through a keypad entry
 * reads as something left dirty.
 */

export type Beat<S> = {
  /** how long this beat holds, in ms */
  ms: number;
  /** applied when the beat begins, and it stays applied */
  set?: Partial<S>;
};

export type Script<S> = {
  initial: S;
  beats: Beat<S>[];
  /**
   * The frame reduced-motion gets: the screen at its most informative moment,
   * held still. Given as a beat index.
   */
  restFrame: number;
  /**
   * How long the finished screen holds before the loop starts over. It is
   * separate from the last beat's duration because this is the pause that makes
   * a loop read as a loop rather than as a rewind — the outcome gets to sit
   * there, and then the screen fades out and begins again.
   */
  outro?: number;
};

function timeline<S>(beats: Beat<S>[], outro: number) {
  const ends: number[] = [];
  let t = 0;
  for (const b of beats) {
    t += b.ms;
    ends.push(t);
  }
  return { ends, total: t + outro };
}

function stateAt<S>(script: Script<S>, index: number): S {
  let s = { ...script.initial };
  for (let i = 0; i <= index && i < script.beats.length; i++) {
    if (script.beats[i].set) s = { ...s, ...script.beats[i].set };
  }
  return s;
}

export type FlowState<S> = {
  state: S;
  beatIndex: number;
  /** true while this card is the landed one on stage */
  live: boolean;
  /**
   * Counts up once per loop. Handing it to a `key` is what lets a screen play
   * its entrance again on the next pass instead of only on first mount.
   */
  pass: number;
  /** true during the outro hold, so the screen can fade before it restarts */
  looping: boolean;
};

export function useFlow<S>(faceIndex: number, script: Script<S>): FlowState<S> {
  const outro = script.outro ?? 900;
  const tl = useMemo(() => timeline(script.beats, outro), [script.beats, outro]);
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);
  const [tick, setTick] = useState({ i: -1, pass: 0, looping: false });
  const last = useRef(tick);
  last.current = tick;

  useEffect(() => subscribeActiveFace((i) => setLive(i === faceIndex)), [faceIndex]);

  useEffect(() => {
    if (reduce || !live) return;
    let raf = 0;
    let t0 = 0;
    raf = requestAnimationFrame(function step(now) {
      raf = requestAnimationFrame(step);
      if (!t0) t0 = now;
      const elapsed = now - t0;
      const pass = Math.floor(elapsed / tl.total);
      const t = elapsed % tl.total;
      const looping = t >= tl.ends[tl.ends.length - 1];
      let i = 0;
      while (i < tl.ends.length - 1 && t >= tl.ends[i]) i++;
      /* The beat index is the ONLY thing that re-renders. Everything that has
         to move continuously — the chart, the ticking figures, a progress
         ring — runs on its own rAF inside the component that draws it, exactly
         as the stage engine keeps its per-frame work out of React. */
      const p = last.current;
      if (p.i !== i || p.pass !== pass || p.looping !== looping) {
        setTick({ i, pass, looping });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [live, reduce, tl]);

  useEffect(() => {
    if (!live && !reduce) setTick({ i: -1, pass: 0, looping: false });
  }, [live, reduce]);

  /* Reduced motion gets one honest frame and no loop — but still only on the
     card that is on stage. Resting every face at its rest frame at once put two
     open sheets into the shell's single portal slot. */
  const beatIndex = reduce ? (live ? script.restFrame : -1) : tick.i;
  const state = useMemo(() => stateAt(script, beatIndex), [script, beatIndex]);

  return {
    state,
    beatIndex,
    live,
    pass: reduce ? 0 : tick.pass,
    looping: reduce ? false : tick.looping,
  };
}
