'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { Stage } from './Stage';
import { Phone } from './Phone';
import { perpsV5Flow } from './script';

/**
 * PERPS v5 — the short cut
 * ==================================================================
 * Two files, and between them they are everything this cut does not share with
 * the other five: its own device (`Phone.tsx` — v3's is an argument about the
 * app, this one is a copy of it) and its own room (`Stage.tsx` — the shared
 * `V4Stage` is a phone plus a headline plus a row of dots, and this page is a
 * phone).
 *
 * The deck is still a full deck: the clock runs, the machine's guards are
 * live, `seek` and `toggle` exist. Nothing on screen calls them, which is what
 * "leave only the demo" means — this page is a surface to point a screen
 * recorder at, and every control on it would be a control to crop out.
 */
export function PerpsV5Demo() {
  const deck = useDeck(perpsV5Flow);
  return <Stage phone={<Phone d={deck} />} />;
}
