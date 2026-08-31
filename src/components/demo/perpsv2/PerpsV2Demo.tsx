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
        The trade, and nothing else. It opens on the market with the account already funded, puts
        $5,000 of margin into a $100,000 position, and ends back on the card the whole app hangs
        off &mdash; and while the stop loss and take profit are being typed, the market is held
        still, because both rules are enforced against a fixed entry price.
      </>}
    >
      <Phone d={deck} holdPrice hand />
    </DemoPage>
  );
}
