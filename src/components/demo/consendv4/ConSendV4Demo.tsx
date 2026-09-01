'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { V4Stage } from '@/components/demo/shell/V4Stage';
import { Phone } from '@/components/demo/consend/Phone';
import { conSendV4Flow } from './script';

/**
 * CONFIDENTIAL SEND v4 — the marketing cut
 * ==================================================================
 * The room is `shell/V4Stage`, shared with every other v4. What is left here
 * is the two things that are actually about this flow: which script is
 * playing, and whose device is on the stand.
 *
 * The device is the step-by-step page's own, imported rather than copied.
 * There is one Universal Send screen in this repo and one token list with ZEC
 * in it; a second copy dressed for the camera would be a second place for the
 * claim to drift. What v4 adds is not inside the phone.
 */
export function ConSendV4Demo() {
  const deck = useDeck(conSendV4Flow);
  return (
    <V4Stage
      flow={conSendV4Flow}
      deck={deck}
      phone={<Phone d={deck} />}
      links={[{ href: '/demo/confidential-send', label: 'Step by step' }]}
    />
  );
}
