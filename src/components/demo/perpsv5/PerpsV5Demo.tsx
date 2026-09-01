'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { V4Stage } from '@/components/demo/shell/V4Stage';
import { Phone } from './Phone';
import { perpsV5Flow } from './script';

/**
 * PERPS v5 — the short cut
 * ==================================================================
 * The room is `shell/V4Stage`, unchanged and shared with the four other
 * marketing cuts. That is the point of it having been written against a phone,
 * a headline and a row of dots rather than against perps: a cut that is a
 * sixth of the length of the others still stands in the same room.
 *
 * What is different here is inside the device rather than around it — this is
 * the only flow that brings its OWN screens rather than borrowing v3's, and
 * the reason is in Phone.tsx: v3's device is an argument about the app and
 * this one is a copy of it.
 *
 * No `links`. The other cuts point at their siblings because a reader who
 * wants the reasoning should be able to get to it; this one is meant to be
 * recorded, and a row of route names is the first thing that would have to be
 * cropped out of the frame.
 */
export function PerpsV5Demo() {
  const deck = useDeck(perpsV5Flow);
  return <V4Stage flow={perpsV5Flow} deck={deck} phone={<Phone d={deck} />} />;
}
