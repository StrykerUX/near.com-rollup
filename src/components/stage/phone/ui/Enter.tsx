import type { ReactNode } from 'react';

/**
 * A block whose children arrive rather than appear.
 *
 * Give it a `k` that changes when the content does — the screen name, the beat,
 * the loop pass — and React remounts it, which is what re-triggers the CSS
 * animation. Without the key the entrance plays once on first mount and every
 * state after that snaps into place, which is the thing that makes a scripted
 * screen read as a slideshow.
 *
 * The stagger is in CSS (`.enter > *:nth-child(n)`) rather than inline delays,
 * so it survives with JavaScript half-loaded and costs nothing per child.
 */
export function Enter({
  k, children, className = '',
}: {
  k: string | number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={'enter ' + className} key={k}>
      {children}
    </div>
  );
}
