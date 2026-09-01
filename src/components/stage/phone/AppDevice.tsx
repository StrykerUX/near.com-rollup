'use client';
import { useDeck } from '@/components/demo/shell/deck';
import { Phone } from '@/components/demo/perpsv5/Phone';
import { perpsV5Flow } from '@/components/demo/perpsv5/script';

/**
 * THE `/demo/perps-v5` DEVICE, ON THE HOME PAGE, UNCHANGED.
 * ==================================================================
 * Not a version of it. The same `<Phone>` file, the same `useDeck`, the same
 * flow, the same 352 x 766 — so every pixel of that screen is this screen, and
 * anything that gets fixed there is fixed here by construction.
 *
 * THE FIRST ATTEMPT WAS A REBUILD AND IT WAS THE WRONG ANSWER. It compacted
 * the screen into the tour's plate — `.cswap` gives 547px and the device lays
 * out 763 — which meant dropping the chrome, the time axis, and the ticket's
 * sheet, and re-authoring the ticket as a composition. All of that is defensible
 * work and none of it was what was asked for: the point of looking at this
 * screen on this page is to look at THAT screen, and a version of it edited
 * down to fit answers a question nobody had.
 *
 * So the plate stops being a plate. `.morph` keeps its id and its transforms —
 * the stage engine still owns the peek, the shrink and the fade — and becomes a
 * transparent carrier for a device that is simply the right size. The other
 * three faces are not rendered on this route, which is the trade: the tour is
 * one screen long here.
 *
 * It runs on its OWN clock rather than the tour's, because that is also part of
 * "the same screen": `useDeck` is what `/demo/perps-v5` plays through, at its
 * PACE, with its 20-second script and its loop.
 */
export function AppDevice() {
  const deck = useDeck(perpsV5Flow);
  return (
    <div className="appdev">
      <Phone d={deck} />
    </div>
  );
}
