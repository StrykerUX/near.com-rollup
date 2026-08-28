'use client';
import { useEffect, useRef, useState } from 'react';
import { subscribeActiveFace } from '@/stage/bus';

/**
 * THE FLOW PLAYER
 * ==================================================================
 * Each demo screen is a SCRIPT: an ordered list of beats, each with a
 * duration and a patch to apply. The player walks the list, so the state at
 * any moment is `initial` plus every patch up to the current beat — which
 * makes a flow a pure function of elapsed time, scrubbable and impossible to
 * desync. Same shape as the stage engine one level up.
 *
 * A flow only runs while its own card is the landed one on stage. Nothing
 * animates behind a card you cannot see.
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
   * The frame reduced-motion gets: no loop, no keypad tapping, just the
   * screen at its most informative moment. Given as a beat index.
   */
  restFrame: number;
};

/** Beat boundaries, precomputed once per script. */
function timeline<S>(script: Script<S>) {
  const ends: number[] = [];
  let t = 0;
  for (const b of script.beats) {
    t += b.ms;
    ends.push(t);
  }
  return { ends, total: t };
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
  /** true once the card has been on stage long enough for the flow to start */
  playing: boolean;
};

/**
 * @param faceIndex the DISPLAY index of the card this flow belongs to
 * @param script    the beats
 * @param leadIn    ms to hold the opening frame after the card lands, so the
 *                  reader sees the screen before it starts moving on its own
 */
export function useFlow<S>(
  faceIndex: number,
  script: Script<S>,
  leadIn = 700,
): FlowState<S> {
  const [live, setLive] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [out, setOut] = useState<FlowState<S>>(() => ({
    state: stateAt(script, -1),
    beatIndex: -1,
    playing: false,
  }));

  const tl = useRef(timeline(script));
  tl.current = timeline(script);

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => subscribeActiveFace((i) => setLive(i === faceIndex)), [faceIndex]);

  useEffect(() => {
    /* Reduced motion gets one honest frame and no loop — but still only on the
       card that is actually on stage.
       BUG THIS FIXES: resting every face at its rest frame at once meant all
       four rendered simultaneously, and the two flows that open a sheet both
       portalled into the shell's single slot. The result was the Earn vault
       sheet sitting on top of Perps, Account and Swap. "Which card is live" is
       not a motion preference; it governs both paths. */
    if (reduce) {
      const i = live ? script.restFrame : -1;
      setOut({ state: stateAt(script, i), beatIndex: i, playing: false });
      return;
    }
    if (!live) {
      /* Rewind rather than freeze: coming back to a card mid-flow, halfway
         through a keypad entry, reads as a screen that was left dirty. */
      setOut({ state: stateAt(script, -1), beatIndex: -1, playing: false });
      return;
    }

    let raf = 0;
    let t0 = 0;
    const { ends, total } = tl.current;

    raf = requestAnimationFrame(function step(now) {
      raf = requestAnimationFrame(step);
      if (!t0) t0 = now;
      const elapsed = now - t0 - leadIn;
      if (elapsed < 0) return; /* the lead-in holds the opening frame */
      const t = total > 0 ? elapsed % total : 0;
      let i = 0;
      while (i < ends.length - 1 && t >= ends[i]) i++;
      /* The beat index is the ONLY thing that re-renders. Anything that has to
         move continuously — the chart, the live price, a progress ring — runs
         on its own rAF inside the component that draws it, exactly as the
         stage engine keeps its per-frame work out of React. A script with a
         beat per keystroke needs no sub-beat progress at all. */
      setOut((prev) =>
        prev.beatIndex === i && prev.playing
          ? prev
          : { state: stateAt(script, i), beatIndex: i, playing: true },
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [live, reduce, leadIn, script]);

  return out;
}
