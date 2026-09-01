'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { Stage } from '@/components/demo/perpsv5/Stage';
import { Phone } from './Phone';
import { swapV5Flow } from './script';

/**
 * SWAP v5 — the short cut
 * ==================================================================
 * Two files between it and `/demo/perps-v5`: its own device and its own
 * machine. The room is shared — `perpsv5/Stage` is a page with nothing on it
 * but the phone, which is as true of a swap as it is of a trade.
 */
export function SwapV5Demo() {
  const deck = useDeck(swapV5Flow);
  return <Stage phone={<Phone d={deck} />} />;
}
