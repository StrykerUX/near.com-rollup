'use client';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * THE THREE MODES
 * ==================================================================
 * The same app, driven three ways. Everything below this file is shared —
 * one set of screens, one set of state machines, one set of transitions.
 * The mode only decides WHO fires them.
 *
 *   demo    the script fires them, slowly. Nothing takes a pointer.
 *   guided  the script fires them, but a reader may take any control the
 *           machine currently declares open. Doing so pauses the clock and
 *           moves the playhead to where that gesture lands in the script, so
 *           a gesture SCRUBS the timeline rather than forking it. Idle, and
 *           the script picks up again from wherever the reader left it.
 *   free    nothing fires them but the reader.
 *
 * The rail in `guided` is the machine's own `guided(state)` list. A control
 * that is not on it does not respond — which is the difference between "you
 * may explore" and "you may break the story".
 */
export type Mode = 'demo' | 'guided' | 'free';

const ModeCtx = createContext<Mode>('demo');

export function ModeProvider({ mode, children }: { mode: Mode; children: ReactNode }) {
  return <ModeCtx.Provider value={mode}>{children}</ModeCtx.Provider>;
}

export const useMode = () => useContext(ModeCtx);

/**
 * How long the script waits after a reader's gesture before it resumes.
 * Long enough to finish a thought, short enough that a card left alone always
 * heals back into the demo.
 */
export const IDLE_MS = 4600;

/**
 * Demo runs the same beats stretched. A product demo that has to be paused to
 * be read is a demo running at the author's speed, not the reader's.
 */
export const PACE: Record<Mode, number> = { demo: 1.4, guided: 1.05, free: 1 };
