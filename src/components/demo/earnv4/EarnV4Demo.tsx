'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { V4Stage } from '@/components/demo/shell/V4Stage';
import { Phone } from '@/components/demo/earn/Phone';
import { earnV4Flow } from './script';

/**
 * EARN v4 — the marketing cut
 * ==================================================================
 * The room is `shell/V4Stage`, shared with every other v4. What is left here
 * is the two things that are actually about earn: which script is playing, and
 * whose device is on the stand.
 *
 * It borrows the earn demo's device wholesale — the same vault sheet, the same
 * fee list, the same picker that puts your vaults above your tokens — because
 * the thing v4 adds is not inside the phone. It is where the phone is looked at
 * from.
 */
export function EarnV4Demo() {
  const deck = useDeck(earnV4Flow);
  return (
    <V4Stage
      flow={earnV4Flow}
      deck={deck}
      phone={<Phone d={deck} />}
      links={[{ href: '/demo/earn', label: 'step by step' }]}
    />
  );
}
