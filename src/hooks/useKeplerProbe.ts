'use client';
import { useEffect } from 'react';

/**
 * Is the real Kepler Std installed on this machine?
 *
 * Measured against a known fallback rather than asked of document.fonts.check(),
 * which is unreliable for local system families. A hit adds `.kepler` to <html>,
 * which switches the italic runs onto the condensed cut.
 */
export function useKeplerProbe() {
  useEffect(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return;
    const probe = 'MMMWWWmmmwwwiiill@@';
    const widthWith = (stack: string) => {
      ctx.font = '72px ' + stack;
      return ctx.measureText(probe).width;
    };
    const base = widthWith('monospace');
    const names = ['Kepler Local', 'Kepler Std Semicondensed Display', 'Kepler Std Display', 'Kepler Std'];
    for (const name of names) {
      if (widthWith(`"${name}", monospace`) !== base) {
        document.documentElement.classList.add('kepler');
        break;
      }
    }
  }, []);
}
