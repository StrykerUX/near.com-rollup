'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { V4Stage } from '@/components/demo/shell/V4Stage';
import { Phone } from '@/components/demo/swap/Phone';
import { swapV4Flow } from './script';

/**
 * SWAP v4 — the marketing cut
 * ==================================================================
 * The room is `shell/V4Stage`, shared with every other v4. What is left here
 * is the two things that are actually about the swap: which script is playing,
 * and whose device is on the stand.
 *
 * The device is the step-by-step page's own, imported rather than copied.
 * There is one Assets list in this repo with a yield chip on every row and one
 * swap screen that prices a trade three ways; a second copy dressed for the
 * camera would be a second place for those figures to drift. What v4 adds is
 * not inside the phone — it is where the phone is looked at from.
 */
export function SwapV4Demo() {
  const deck = useDeck(swapV4Flow);
  return (
    <V4Stage
      flow={swapV4Flow}
      deck={deck}
      phone={<Phone d={deck} />}
      links={[{ href: '/demo/swap', label: 'Step by step' }]}
    />
  );
}
