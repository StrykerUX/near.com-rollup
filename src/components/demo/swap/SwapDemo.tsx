'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from './Phone';
import { swapFlow } from './script';

export function SwapDemo() {
  const deck = useDeck(swapFlow);
  return (
    <DemoPage
      flow={swapFlow}
      deck={deck}
      title="Swap, step by step"
      intro={<>
        A whole USDT balance turned into NEAR across chains, signed with a passkey and settled in
        three parts &mdash; and then the yield chip that has been sitting on the next row the
        entire time, put to use without leaving the list.
      </>}
    >
      <Phone d={deck} />
    </DemoPage>
  );
}
