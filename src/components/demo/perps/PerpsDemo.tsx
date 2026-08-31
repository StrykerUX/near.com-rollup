'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from './Phone';
import { perpsFlow } from './script';

export function PerpsDemo() {
  const deck = useDeck(perpsFlow);
  return (
    <DemoPage
      flow={perpsFlow}
      deck={deck}
      title="Perps, step by step"
      intro={<>
        near.com&rsquo;s perpetuals app, rebuilt frame by frame: fund it with a passkey, build
        the ticket, run into the two rules the market imposes, and open the position. It plays
        on its own &mdash; and it lets you take the controls.
      </>}
    >
      <Phone d={deck} />
    </DemoPage>
  );
}
