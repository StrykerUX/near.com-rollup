import type { KeyboardEvent, MouseEvent } from 'react';

/**
 * MAKING A CONTROL LIVE WITHOUT CHANGING WHAT IT IS
 * ==================================================================
 * Every control on these screens is a `<span>` carrying a hand-tuned class.
 * That is not laziness: the stylesheet targets those classes directly, and
 * swapping the tags to `<button>` for the interactive modes would drag in the
 * UA button box and the preflight reset on exactly the controls whose boxes
 * were the hardest to get right. It has cost us that regression once already.
 *
 * So the tag never changes. `press` adds the button ROLE, a tab stop, a click
 * and the two keys a button owes the keyboard — and returns nothing at all
 * when the mode or the machine says this control is not live, which leaves a
 * plain span that cannot be focused, clicked or announced as a button.
 */
export function press(fn: (() => void) | null | undefined) {
  if (!fn) return null;
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: fn,
    /* Do not let a CLICK move focus. These controls sit inside a sticky stage
       whose scroll position is the whole composition; focusing one makes the
       browser scroll it into view, which nudges the page a few pixels on every
       single tap. Preventing the default on mousedown suppresses the focus
       without touching the keyboard path — Tab still reaches them, and the
       focus ring below still shows. */
    onMouseDown: (e: MouseEvent) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fn();
      }
    },
  };
}

/** the class that gives a live control its cursor and its hover */
export const live = (fn: unknown) => (fn ? ' can' : '');
