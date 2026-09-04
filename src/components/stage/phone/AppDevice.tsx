'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { subscribeActiveFace, subscribeCardMove, type CardMove } from '@/stage/bus';
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
  /* the last chapter the engine actually landed on; -1 (mid-move) is ignored */
  const [at, setAt] = useState(0);
  useEffect(() => subscribeActiveFace((i) => { if (i >= 0) setAt(i); }), []);
  /* and the pair mid-move, which is null at rest — see `setCardMove` in bus.ts */
  const [move, setMove] = useState<CardMove | null>(null);
  useEffect(() => subscribeCardMove(setMove), []);

  /* WHO IS ARRIVING IS THE MOVE'S OWN ANSWER, not `at`. The engine publishes
     -1 to `activeFace` for the length of a move, so `at` is still the chapter
     being LEFT until the move lands. Reading `to` here is what lets the
     incoming screen be on the page while it slides in; falling back to `at`
     is the resting case. */
  const to = move ? move.to : at;
  const from = move ? move.from : -1;
  const In = SCREENS[to] ?? SCREENS[0];
  const Out = from >= 0 ? SCREENS[from] : null;

  return (
    <div className="appdev">
      {/* BOTH SCREENS ARE ON THE PAGE FOR THE LENGTH OF THE MOVE, and that is
          the fix for a real defect rather than a flourish. With one screen and
          a fade from `opacity: 0`, every ancestor up to `body` is transparent,
          so the field showed through the whole device: measured at
          (165,244,202) mid-fade against (32,32,32) at rest — a 7x jump in
          brightness, which is the "white flash" this replaces. An outgoing
          screen underneath is what there is to fade FROM.

          IT COSTS TWO CLOCKS WHILE THE MOVE LASTS, and the move is scrubbed —
          park the scroll halfway and both keep running. That is the honest
          price of the transition, and it is bounded by one chapter. It also
          means the arriving chapter's flow starts during the slide rather
          than on landing; a normal scroll crosses in a few hundred ms and
          every script's first beat is longer than that, so it lands still on
          beat one. `useDeck` takes no `paused`, and adding one to a hook four
          screens share was more surface than this is worth.

          The keys are the chapter indices, so a screen is never reused for a
          different chapter — the same reason `Enter` takes a key everywhere
          else in this repo. */}
      {Out ? (
        <div className="appswap out" key={`o${from}`}>
          <Out />
        </div>
      ) : null}
      <InLayer key={to}>
        <In />
      </InLayer>
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
 * THE INCOMING LAYER, WHICH DOES NOT LET ITS SCREEN ARRIVE TWICE.
 *
 * The crossfade IS the arrival now, and the screens did not know that. Every
 * one of them animates its own elements in on mount — `enterUp` on `.enter`
 * children, `drise` on rows and panels — because until this changed, a screen
 * mounting WAS a chapter arriving and that stagger was the whole of it.
 *
 * Measured on a flick: the layer mounts at 60ms with `enterUp` x6 and `drise`
 * x3 starting, the fade is finished by 180ms, and the stagger runs on for
 * another 562ms. Two arrivals in a row, the second one after the transition
 * had visibly ended — which is the "intro animation" this fixes.
 *
 * WHY A TIMER AND NOT A CLASS THAT STAYS. The stagger is not decoration: the
 * scripted screens re-key `Enter` on every scene, and `Enter`'s own note says
 * why — without it "every state after that snaps into place, which is the
 * thing that makes a scripted screen read as a slideshow". A permanent
 * suppression on this layer would kill those too. So it is lifted once the
 * arrival animations are past their end, and every element created after that
 * — every later scene — staggers normally.
 *
 * WHY IT IS SAFE TO LIFT AT ALL is the part worth being careful about. The CSS
 * suppresses with a large negative `animation-delay`, not with
 * `animation: none`: `none` DELETES the animation, so restoring it creates a
 * fresh one that plays from the top — the same bug moved 1.1 seconds later. A
 * negative delay leaves the animation in place and already past its end, and
 * at the lift it is still past it. See the rule in 25-home-app.css.
 */
function InLayer({ children }: { children: ReactNode }) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ARRIVE_MS);
    return () => clearTimeout(t);
  }, []);
  return <div className={'appswap in' + (settled ? '' : ' noentry')}>{children}</div>;
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
