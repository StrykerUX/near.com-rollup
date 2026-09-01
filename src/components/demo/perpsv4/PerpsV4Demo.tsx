'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { V4Stage } from '@/components/demo/shell/V4Stage';
import { Phone } from '@/components/demo/perpsv3/Phone';
import { perpsV4Flow } from './script';

/**
 * PERPS v4 — the marketing cut
 * ==================================================================
 * The room is `shell/V4Stage`, shared with every other v4. What is left here
 * is the two things that are actually about perps: which script is playing,
 * and whose device is on the stand.
 *
 * It borrows v3's device wholesale — the same half-empty screens, the same lit
 * controls, the same travelling figures — because the thing v4 adds is not
 * inside the phone.
 */
export function PerpsV4Demo() {
  const deck = useDeck(perpsV4Flow);
  return (
    <V4Stage
      flow={perpsV4Flow}
      deck={deck}
      phone={<Phone d={deck} />}
      links={[
        { href: '/demo/perps-v2', label: 'v2' },
        { href: '/demo/perps-v3', label: 'v3' },
      ]}
    />
  );
}
