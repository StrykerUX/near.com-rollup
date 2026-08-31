'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from '@/components/demo/perps/Phone';
import { perpsV2Flow } from './script';

export function PerpsV2Demo() {
  const deck = useDeck(perpsV2Flow);
  return (
    <DemoPage
      flow={perpsV2Flow}
      deck={deck}
      title="Perps v2"
      intro={<>
        The trade, and nothing else. It opens on the market with the account already funded,
        takes a position, and ends on the same screen with that position on it &mdash; and while
        the stop loss and take profit are being typed, the market is held still, because both
        rules are enforced against a fixed entry price.
      </>}
    >
      <Phone d={deck} holdPrice hand />
    </DemoPage>
  );
}
