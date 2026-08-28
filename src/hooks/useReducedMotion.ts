'use client';
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

let mq: MediaQueryList | null = null;
const get = () => (mq ??= matchMedia(QUERY)).matches;
const subscribe = (fn: () => void) => {
  const m = (mq ??= matchMedia(QUERY));
  m.addEventListener('change', fn);
  return () => m.removeEventListener('change', fn);
};

/**
 * The reader's motion preference, as an external store rather than state
 * synced from an effect — the preference lives in the platform, and copying it
 * into React only to write it back on the first commit is a render nobody
 * needs. The server snapshot is `false`: the preference is unknowable there,
 * and a page that renders its resting frame and then starts moving is the
 * wrong way round.
 */
export const useReducedMotion = () => useSyncExternalStore(subscribe, get, () => false);
