'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from './Phone';
import { earnFlow } from './script';

export function EarnDemo() {
  const deck = useDeck(earnFlow);
  return (
    <DemoPage
      flow={earnFlow}
      deck={deck}
      title="Earn, step by step"
      intro={<>
        Two vaults with their size, their rate and every fee stated up front; a wallet balance
        moved into one of them with a passkey; and then the part the recording is named after
        &mdash; paying someone out of a vault without taking the money out of it first.
      </>}
    >
      <Phone d={deck} />
    </DemoPage>
  );
}
