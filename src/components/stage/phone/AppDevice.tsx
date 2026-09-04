'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { subscribeShownFace } from '@/stage/bus';
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

/**
 * ONE CHAPTER'S SCREEN, ADDRESSED BY INDEX.
 *
 * The wide composition has one device and swaps the screen inside it; the
 * narrow one (MobileTour.tsx) has four devices and each shows a fixed chapter.
 * Both want the same four components with the same four flows, and this is the
 * seam between them — export the mapping, not the device.
 *
 * The index is the DISPLAY order, which is `CH_TITLES` in lib/schedule.ts, and
 * not the `data-face` numbering. Confusing the two puts the swap screen under
 * the perps headline.
 */
export function ChapterScreen({ at }: { at: number }) {
  const Screen = SCREENS[at] ?? SCREENS[0];
  return <Screen />;
}

export function AppDevice() {
  /**
   * WHICH CHAPTER IS MOUNTED, AND IT IS NOT "THE ONE THAT LANDED".
   *
   * The engine publishes the index that is correct at this instant: the card
   * being left until the fade has reached the floor, the card arriving after
   * it (see `setShownFace`). So the swap happens at the bottom of the V, where
   * the device shows nothing, and the reader never sees it happen.
   *
   * THERE IS ONE SCREEN, AND THAT IS THE FIX RATHER THAN A SIMPLIFICATION OF
   * IT. This held two for a while — the outgoing one underneath, the incoming
   * one fading over it — and every defect that came out of it was a
   * consequence of two live screens sharing a frame: the outgoing restarted
   * its script the moment it began to leave, because it was re-keyed from
   * `to` to `o${from}` and React remounts on a new key; the incoming played
   * its script while it was still a ghost; and a flick past two boundaries
   * could swap with no transition. One screen cannot do any of those. It also
   * gives the page back the invariant this file was written around — only the
   * chapter on stage is mounted, so only one clock, one chart and one
   * settlement are ever running.
   *
   * -1 is ignored: it means the engine has nothing to say yet.
   */
  const [at, setAt] = useState(0);
  useEffect(() => subscribeShownFace((i) => { if (i >= 0) setAt(i); }), []);

  const Screen = SCREENS[at] ?? SCREENS[0];
  return (
    <div className="appdev">
      <Layer key={at}>
        <Screen />
      </Layer>
    </div>
  );
}

/**
 * HOW LONG A SCREEN IS STILL "ARRIVING" AFTER IT MOUNTS.
 *
 * It is the longest arrival animation any of these screens has, plus room:
 * `.enter > *` is `enterUp` at 560ms inside `.pdev.app` with a stagger that
 * reaches 250ms, so 810ms is the ceiling. `drise` — the other arrival family,
 * on `.pdview > *`, `.ernrow`, `.bposact` and the rest — tops out at 460ms.
 *
 * THE MARGIN IS NOT DECORATION. The suppression is lifted at this mark, and
 * lifting it early would restart whatever had not finished: an animation's
 * clock runs from the element's creation, so at the lift its current time is
 * `elapsed - delay`, and that has to be past `duration` for nothing to play.
 * At 1100ms the worst case is 1100 - 250 = 850 against 810.
 */
const ARRIVE_MS = 1100;

/**
 * THE SCREEN, AND IT DOES NOT ARRIVE TWICE.
 *
 * Each of these screens animates its own elements in when it mounts, because
 * until this page put a fade in front of them, a screen mounting WAS a chapter
 * arriving and that stagger was the whole of it. It is the fade now. Measured
 * before this: the fade finished at 180ms and the elements went on rising for
 * another 562ms — two arrivals, the second one after the transition had ended.
 *
 * WHY A TIMER AND NOT A CLASS THAT STAYS. The stagger is not decoration: the
 * scripted screens re-key `Enter` on every scene, and `Enter`'s own note says
 * why — without it "every state after that snaps into place, which is the
 * thing that makes a scripted screen read as a slideshow". A permanent
 * suppression would kill those too. So it is lifted once the arrival
 * animations are past their end, and every element created after that — every
 * later scene — staggers normally.
 *
 * WHY IT IS SAFE TO LIFT is the part worth being careful about. The CSS
 * suppresses with a large negative `animation-delay`, not `animation: none`:
 * `none` DELETES the animation, so restoring it creates a fresh one that plays
 * from the top — the same bug moved 1.1 seconds later. A negative delay leaves
 * the animation in place and already past its end, and at the lift it is still
 * past it. See the rule in 25-home-app.css.
 */
function Layer({ children }: { children: ReactNode }) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ARRIVE_MS);
    return () => clearTimeout(t);
  }, []);
  return <div className={'appswap' + (settled ? '' : ' noentry')}>{children}</div>;
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
