'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { Stage } from '@/components/demo/perpsv5/Stage';
import { Phone } from './Phone';
import { ownV5Flow } from './script';

/**
 * EVERYTHING YOU OWN — the short cut
 * ==================================================================
 * The tour's second chapter as its own page. `Lockup.tsx` puts the headline
 * "Everything you own, one screen" beside `data-face="0"`; this is what the
 * phone under it shows.
 */
export function OwnV5Demo() {
  const deck = useDeck(ownV5Flow);
  return <Stage phone={<Phone d={deck} />} />;
}
