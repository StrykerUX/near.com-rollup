import { applyBeat, type Beat, type Machine } from '@/components/stage/phone/flows/machine';

/**
 * A DEMO FLOW: A MACHINE PLUS THE ARGUMENT FOR IT
 * ==================================================================
 * `/demo/*` pages have to do two things with one timeline: play it, and let a
 * reader jump around inside it. So the beats are not one flat list — they are
 * grouped into named steps, each of which says what feature it is showing.
 *
 * A step's FIRST beat is its entrance: seeking to a step applies that beat at
 * once and starts the clock after it. Which is why the leading `ms` on a first
 * beat is the pause the PREVIOUS step gets to hold for — it costs nothing when
 * a reader jumps straight here.
 *
 * Everything below is shared by every demo page. What a page supplies is its
 * machine's actions, its chapters and its steps; what it gets back is a bundle
 * the player and the rail both read.
 */

export type Chapter = { id: string; name: string; blurb: string };

export type Step<S, A extends string> = {
  id: string;
  /** the chapter this step belongs to */
  ch: string;
  /** what this step is called in the rail */
  title: string;
  /** what the app is doing, and which number moved */
  note: string;
  beats: Beat<S, A>[];
};

/**
 * WHERE A TRANSITION IS PHYSICALLY PRESSED.
 *
 * The machine knows what happens; this says WHERE on the glass it happens, by
 * naming the `data-tap` of the control. It is what lets a hand travel to a
 * control before the beat that presses it fires — the difference between a
 * screen whose state changes and a screen somebody is using.
 *
 * The state passed is the one the beat is about to act on, so an action whose
 * target depends on where it is in a sequence (the passkey button exists only
 * on the first of six `ostep`s) can say so.
 */
export type TapTarget<S, A extends string> = (a: A, arg: string | undefined, s: S) => string | null;

export type DemoFlow<S, A extends string> = {
  machine: Machine<S, A>;
  target?: TapTarget<S, A>;
  chapters: Chapter[];
  steps: Step<S, A>[];
  /** the beat index each step starts at */
  starts: number[];
  /** the state at a given beat index — the pure function the page rides */
  frameAt: (i: number) => S;
  /** which step a beat index belongs to */
  stepOf: (i: number) => number;
};

export type FlowSpec<S, A extends string> = {
  initial: S;
  actions: Machine<S, A>['actions'];
  chapters: Chapter[];
  steps: Step<S, A>[];
  /**
   * WHERE A READER'S GESTURE LANDS, by step id rather than beat index.
   *
   * Firing an anchored transition moves the playhead to that step, so the
   * script resumes from what the reader just did instead of yanking the screen
   * back to its own place. That single behaviour is the difference between a
   * demo that lets you touch it and one that fights you.
   *
   * Naming steps rather than indices is not sugar: beat indices shift every
   * time a step gains a keystroke, and an anchor that silently drifted one
   * beat left would be the worst kind of bug — it would still work.
   */
  anchor?: Record<string, string>;
  /** the step whose entrance reduced motion gets: the most informative frame */
  restStep: string;
  /** how long the finished screen holds before the loop starts over */
  outro?: number;
  /** states that advance themselves, with no script running */
  auto?: Machine<S, A>['auto'];
  /** where each transition is pressed, for flows that draw a hand */
  target?: TapTarget<S, A>;
};

/** a digit run, typed rather than pasted */
export const typing = <S, A extends string>(
  act: A, chars: string, lead = 900, gap = 165,
): Beat<S, A>[] => chars.split('').map((c, i) => ({ ms: i === 0 ? lead : gap, do: act, arg: c }));

export function buildFlow<S, A extends string>(spec: FlowSpec<S, A>): DemoFlow<S, A> {
  const beats = spec.steps.flatMap((s) => s.beats);

  const starts: number[] = [];
  let n = 0;
  for (const s of spec.steps) {
    starts.push(n);
    n += s.beats.length;
  }

  const index = (id: string) => {
    const i = spec.steps.findIndex((s) => s.id === id);
    if (i < 0) throw new Error(`demo flow: no step "${id}"`);
    return i;
  };

  const anchor = Object.fromEntries(
    Object.entries(spec.anchor ?? {}).map(([a, id]) => [a, starts[index(id)]]),
  ) as Partial<Record<A, number>>;

  const machine: Machine<S, A> = {
    initial: spec.initial,
    actions: spec.actions,
    beats,
    restFrame: starts[index(spec.restStep)],
    outro: spec.outro ?? 4000,
    /* Deliberately wide open. A demo page's whole promise is that you can
       touch it; the anchors are what keeps that from breaking the story, and
       the machine's own guards are the only thing that ever refuses. */
    guided: () => Object.keys(spec.actions) as A[],
    anchor,
    auto: spec.auto,
  };

  const frameAt = (i: number) => {
    let s = { ...spec.initial };
    for (let k = 0; k <= i && k < beats.length; k++) s = applyBeat(machine, s, beats[k]);
    return s;
  };

  const stepOf = (i: number) => {
    if (i < 0) return 0;
    let k = 0;
    for (let j = 0; j < starts.length; j++) if (starts[j] <= i) k = j;
    return k;
  };

  return {
    machine, chapters: spec.chapters, steps: spec.steps, starts, frameAt, stepOf,
    target: spec.target,
  };
}
