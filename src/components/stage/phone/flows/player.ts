'use client';
import { useEffect, useMemo, useState } from 'react';
import { subscribeActiveFace, subscribeStageProgress } from '@/stage/bus';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { dwellT } from '@/lib/schedule';

/**
 * THE FLOW PLAYER
 * ==================================================================
 * Each demo screen is a SCRIPT: an ordered list of beats, each with a weight
 * and a patch. The state at any moment is `initial` plus every patch up to the
 * current beat.
 *
 * THE SCRIPT IS SCRUBBED BY SCROLL, NOT PLAYED ON A CLOCK.
 *
 * Each card owns a band of the stage — the dwell the reader is given to look at
 * it — and its flow runs across exactly that band. Scroll into Perps and the
 * order ticket fills in as you go; keep scrolling and it holds finished while
 * the card leaves; scroll back up and it unwinds, because it is the same
 * composition run backwards rather than a second animation with its own
 * direction. That is the rule the stage engine one level up is built on, and
 * the phone had no business keeping its own clock against it.
 *
 * A beat therefore carries a WEIGHT, not a duration: its share of the card's
 * dwell.
 *
 * That share is the constraint the scripts are written against. A card's dwell
 * is ~9% of the stage, and one wheel notch is a fifth of it — so a script with
 * a beat per keystroke would jump eighteen of them per notch and the typing
 * would never be seen. Few, large, legible states; each one gets real scroll.
 */

export type Beat<S> = {
  /** this beat's share of the card's dwell — relative, units are arbitrary */
  w: number;
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
};

/** Cumulative beat ends, normalised to 0..1 across the whole script. */
function timeline<S>(beats: Beat<S>[]) {
  const ends: number[] = [];
  let t = 0;
  for (const b of beats) {
    t += b.w;
    ends.push(t);
  }
  const total = t || 1;
  return ends.map((e) => e / total);
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
  /** true while this card is the landed one — the chart uses it to idle */
  live: boolean;
};

/**
 * @param faceIndex the DISPLAY index of the card this flow belongs to
 */
export function useFlow<S>(faceIndex: number, script: Script<S>): FlowState<S> {
  const marks = useMemo(() => timeline(script.beats), [script]);
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);
  const [scrubIndex, setScrubIndex] = useState(0);

  useEffect(() => subscribeActiveFace((i) => setLive(i === faceIndex)), [faceIndex]);

  useEffect(() => {
    if (reduce) return;
    return subscribeStageProgress((p) => {
      const t = dwellT(p, faceIndex);
      /* The last mark is 1, so a card the page has moved past resolves to its
         final beat and holds there — the screen you scroll away from is the
         finished one. */
      let i = 0;
      while (i < marks.length - 1 && t > marks[i]) i++;
      setScrubIndex(t <= 0 ? 0 : i);
    });
  }, [faceIndex, marks, reduce]);

  /* Reduced motion gets one honest frame and no scrub — but still only on the
     card that is on stage. Resting every face at its rest frame at once put two
     open sheets into the shell's single portal slot. */
  const beatIndex = reduce ? (live ? script.restFrame : -1) : scrubIndex;
  const state = useMemo(() => stateAt(script, beatIndex), [script, beatIndex]);
  return { state, beatIndex, live };
}
