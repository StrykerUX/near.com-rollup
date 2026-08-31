'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from './Phone';
import { conDepositFlow } from './script';

export function ConDepositDemo() {
  const deck = useDeck(conDepositFlow);
  return (
    <DemoPage
      flow={conDepositFlow}
      deck={deck}
      title="Confidential deposit, step by step"
      intro={<>
        Three quarters of this flow is warning, and that is the design. Two of its three rules are
        printed in red, Continue is dead until you tick a box saying you read them, and the address
        it finally hands you is single-use and expires. A flow whose failure mode is losing the
        money has to spend its first screen saying so.
      </>}
    >
      <Phone d={deck} />
    </DemoPage>
  );
}
