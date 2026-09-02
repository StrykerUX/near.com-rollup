'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { Stage } from '@/components/demo/perpsv5/Stage';
import { Phone } from './Phone';
import { earnV5Flow } from './script';

/** EARN — the tour's fourth chapter as its own page. */
export function EarnV5Demo() {
  const deck = useDeck(earnV5Flow);
  return <Stage phone={<Phone d={deck} />} />;
}
