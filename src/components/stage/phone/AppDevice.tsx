'use client';
import { useEffect, useState } from 'react';
import { subscribeActiveFace } from '@/stage/bus';
import { useDeck } from '@/components/demo/shell/deck';

import { Phone as PerpsPhone } from '@/components/demo/perpsv5/Phone';
import { perpsV5Flow } from '@/components/demo/perpsv5/script';
import { Phone as OwnPhone } from '@/components/demo/ownv5/Phone';
import { ownV5Flow } from '@/components/demo/ownv5/script';
import { Phone as SwapPhone } from '@/components/demo/swapv5/Phone';
import { swapV5Flow } from '@/components/demo/swapv5/script';
import { Phone as EarnPhone } from '@/components/demo/earnv5/Phone';
import { earnV5Flow } from '@/components/demo/earnv5/script';

/**
 * THE APP, ON THE HOME PAGE, WITH THE SCROLL CHOOSING THE SCREEN
 * ==================================================================
 * Four chapters, four screens, and the four are the same files `/demo/*-v5`
 * run — not versions of them. Anything fixed there is fixed here.
 *
 * THE MAPPING IS THE PAGE'S OWN. `Lockup.tsx` already writes a headline per
 * chapter and the engine already fades between them; all this does is put the
 * matching screen under each one:
 *
 *   0  Perps     "Trade where the liquidity is. Hedge where your assets are."
 *   1  Account   "Everything you own, one screen"
 *   2  Swap      "Swap anything, anywhere"
 *   3  Earn      "Earn on what you're not using"
 *
 * That order is `CH_TITLES` in lib/schedule.ts, which is the DISPLAY order —
 * the `data-face` attributes on the copy column carry the original indices and
 * are a different numbering. Getting those two confused puts the swap screen
 * under the perps headline, which is the one mistake this component can make.
 *
 * THE INDEX COMES FROM THE ENGINE, not from the DOM. `setActiveFace(curIdx)`
 * is computed from the schedule, so it keeps working on a route where the
 * four-card deck is not rendered at all. It publishes -1 while a card is MOVING
 * — mid-transition neither card owns the frame — and that is deliberately
 * ignored here: the plate is what slides, and a screen that blanked out during
 * the slide would be the device reacting to a move that is not about it.
 *
 * EACH CHAPTER MOUNTS ITS OWN FLOW, so arriving at a chapter starts that flow
 * from its first beat rather than dropping the reader into the middle of a
 * loop that has been running unseen. Only the chapter on stage is mounted, so
 * only one clock, one chart and one settlement are ever running.
 */

const SCREENS = [PerpsScreen, OwnScreen, SwapScreen, EarnScreen];

export function AppDevice() {
  /* the last chapter the engine actually landed on; -1 (mid-move) is ignored */
  const [at, setAt] = useState(0);
  useEffect(() => subscribeActiveFace((i) => { if (i >= 0) setAt(i); }), []);

  const Screen = SCREENS[at] ?? SCREENS[0];
  return (
    <div className="appdev">
      {/* keyed on the chapter so the incoming screen arrives rather than
          replacing the outgoing one in place — the same reason `Enter` takes
          a key everywhere else in this repo */}
      <div className="appswap" key={at}>
        <Screen />
      </div>
    </div>
  );
}

/* Four one-line components, because a hook cannot be called conditionally and
   each flow needs its own deck. Rendering one of four components is the ordinary
   way to say that; a single component with four `useDeck` calls would run four
   clocks to show one screen. */

function PerpsScreen() {
  const d = useDeck(perpsV5Flow);
  return <PerpsPhone d={d} />;
}
function OwnScreen() {
  const d = useDeck(ownV5Flow);
  return <OwnPhone d={d} />;
}
function SwapScreen() {
  const d = useDeck(swapV5Flow);
  return <SwapPhone d={d} />;
}
function EarnScreen() {
  const d = useDeck(earnV5Flow);
  return <EarnPhone d={d} />;
}
