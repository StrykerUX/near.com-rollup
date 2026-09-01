'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { DemoPage } from '@/components/demo/shell/Frame';
import { Phone } from './Phone';
import { perpsV3Flow } from './script';

export function PerpsV3Demo() {
  const deck = useDeck(perpsV3Flow);
  return (
    <DemoPage
      flow={perpsV3Flow}
      deck={deck}
      title="Perps v3"
      intro={<>
        The same trade with half as much on screen and nothing to follow. There is no pointer:
        the control about to change lights itself, and the figures travel to their new values
        rather than being replaced &mdash; so the link between the slider you did not see move
        and the number that answered is the thing you actually watch.
      </>}
    >
      <Phone d={deck} />
    </DemoPage>
  );
}
