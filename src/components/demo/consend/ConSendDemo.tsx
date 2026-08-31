'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from './Phone';
import { conSendFlow } from './script';

export function ConSendDemo() {
  const deck = useDeck(conSendFlow);
  return (
    <DemoPage
      flow={conSendFlow}
      deck={deck}
      title="Confidential send, step by step"
      intro={<>
        The shortest of the five recordings, at ten seconds &mdash; and the finding is what it does
        not contain. There is no confidential mode to switch into: a shielded asset is picked from
        the same token list, on the same screen, as everything else.
      </>}
    >
      <Phone d={deck} />
    </DemoPage>
  );
}
