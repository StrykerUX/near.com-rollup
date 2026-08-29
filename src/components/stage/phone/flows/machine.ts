/**
 * A FLOW IS A MACHINE, NOT A SLIDESHOW
 * ==================================================================
 * Each screen is described once, as a set of named pure transitions, plus a
 * script that fires them in order. The autoplay and the reader press the SAME
 * transitions — so the three modes cannot drift apart, and a screen the reader
 * drove into is a screen the script knows how to pick up from.
 *
 * A transition returning `null` is a refusal: the guard said no. That is how
 * "Open long" declines while the stop loss is above entry, in every mode.
 */

export type Patch<S> = Partial<S>;

/** a named pure transition. `arg` carries a keypad digit, a token symbol, … */
export type Act<S> = (s: S, arg?: string) => Patch<S> | null;

export type Beat<S, A extends string> = {
  /** how long this beat holds, in ms, at pace 1 */
  ms: number;
  /** the transition this beat performs — the same one the reader can press */
  do?: A;
  arg?: string;
  /**
   * Presentation-only patches: which control is lit, which checklist row is
   * spinning. Not transitions, because they are not things anyone can do.
   */
  set?: Patch<S>;
};

export type Machine<S, A extends string> = {
  initial: S;
  actions: Record<A, Act<S>>;
  beats: Beat<S, A>[];
  /** the frame reduced motion gets: the screen at its most informative moment */
  restFrame: number;
  /**
   * How long the finished screen holds before the loop starts over. Separate
   * from the last beat because this is the pause that makes a loop read as a
   * loop rather than as a rewind.
   */
  outro?: number;
  /**
   * THE RAIL. Which transitions a reader may fire from this state in guided
   * mode. Everything else is inert — the reader gets real freedom inside the
   * story and cannot walk out of it.
   */
  guided: (s: S) => A[];
  /**
   * STATES THAT ADVANCE THEMSELVES.
   *
   * A settlement checklist is not waiting for anyone: it ticks because the
   * network came back. In the scripted modes the beats do that. With no script
   * running there is nobody to do it, and a reader who presses Swap would sit
   * in front of `Finding best price ○` for as long as they cared to look.
   *
   * So a machine may declare, for a given state, one transition that fires on
   * its own after N milliseconds. It is the same transition the script fires —
   * there is still only one way for a checklist to tick.
   */
  auto?: (s: S) => { after: number; do: A; arg?: string } | null;
  /**
   * Where a reader's gesture lands on the timeline. After firing an anchored
   * action the playhead moves there, so the script resumes from what the
   * reader just did instead of yanking the screen back to its own place.
   * Unanchored actions (a tab, a toggle) leave the playhead alone.
   */
  anchor?: Partial<Record<A, number>>;
};

/** fold one beat into a state */
export function applyBeat<S, A extends string>(m: Machine<S, A>, s: S, b: Beat<S, A>): S {
  let next = s;
  if (b.do) next = { ...next, ...(m.actions[b.do](next, b.arg) ?? {}) };
  if (b.set) next = { ...next, ...b.set };
  return next;
}

/** the state the script is in at beat `i` — the pure function the demo rides */
export function stateAt<S, A extends string>(m: Machine<S, A>, i: number): S {
  let s = { ...m.initial };
  for (let k = 0; k <= i && k < m.beats.length; k++) s = applyBeat(m, s, m.beats[k]);
  return s;
}

/** total scripted time at pace 1, outro included */
export function duration<S, A extends string>(m: Machine<S, A>) {
  return m.beats.reduce((t, b) => t + b.ms, 0) + (m.outro ?? 900);
}
