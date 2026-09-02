'use client';
import { useEffect } from 'react';
import { startStageEngine } from '@/stage/engine';

/**
 * Mounts the scroll-scrub engine once the whole stage markup is in the DOM.
 *
 * `enabled` IS THE NARROW COMPOSITION SAYING NO THANK YOU. Below 1080 the tour
 * is four ordinary sections (MobileTour.tsx) — nothing sticky, nothing
 * scrubbed, no card sequence and no closing shrink — so every one of the
 * engine's jobs has no subject there: it would run a scroll listener, a
 * per-frame paint over ~40 nodes and a WebGL loop to drive a composition that
 * is not on the page. It is not disabled by a media query inside the engine
 * for the same reason `PhoneShell` is not hidden with one: the cost being
 * avoided is work, and `display:none` does not stop work.
 *
 * Crossing the breakpoint re-runs the effect, so the engine tears down on the
 * way in and starts clean on the way back out.
 */
export function useStageEngine(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    return startStageEngine();
  }, [enabled]);
}
