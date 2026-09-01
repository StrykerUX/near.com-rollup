'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { V4Stage } from '@/components/demo/shell/V4Stage';
import { Phone } from '@/components/demo/condeposit/Phone';
import { conDepositV4Flow } from './script';

/**
 * CONFIDENTIAL DEPOSIT v4 — the marketing cut
 * ==================================================================
 * The room is `shell/V4Stage`, shared with every other v4. What is left here
 * is the two things that are actually about this flow: which script is playing,
 * and whose device is on the stand.
 *
 * It borrows the step-by-step version's device wholesale — the same red rules,
 * the same picker that names what it refuses, the same code that takes a moment
 * to mint — because the thing v4 adds is not inside the phone. It is where the
 * phone is looked at from.
 */
export function ConDepositV4Demo() {
  const deck = useDeck(conDepositV4Flow);
  return (
    <V4Stage
      flow={conDepositV4Flow}
      deck={deck}
      phone={<Phone d={deck} />}
      links={[{ href: '/demo/confidential-deposit', label: 'Step by step' }]}
    />
  );
}
