'use client';
import { NearGlyph } from '@/components/marks';
import { CH_TITLES } from '@/lib/schedule';
import { AccountFace } from './AccountFace';
import { EarnFace } from './EarnFace';
import { IconLock, IconScan } from './icons';
import { AppDevice } from './AppDevice';
import { PerpsFace } from './PerpsFace';
import { SwapFace } from './SwapFace';
import { TabBar } from './TabBar';
import { SheetSlotProvider } from './ui/SheetSlot';
import { useMode } from './flows/mode';
import { useDeckVariant } from './flows/deck';

/**
 * The phone shell: one chrome, four screens.
 *
 * The header and the tab bar live OUTSIDE `.cswap` on the shell itself and
 * never move — only the faces inside slide. That is what lets a single header
 * title and a single tab row serve all four screens.
 *
 * The faces are authored in DISPLAY order (Perps, Account, Swap, Earn). Their
 * `data-face` attributes keep the ORIGINAL indices, because the stylesheet and
 * the stage engine both select on them.
 *
 * Each face autoplays its own flow, and only while it is the card on stage —
 * see flows/player.ts. Nothing in here takes a pointer.
 */
export function PhoneShell() {
  /* the mode reaches the stylesheet here and nowhere else: the interactive
     affordances and the demo's slower entrances are both CSS, and both keyed
     off this one attribute */
  const mode = useMode();
  /* which perps screen this page shows — see flows/deck.tsx */
  const deck = useDeckVariant();

  /**
   * `app` IS NOT A FOURTH FACE, IT IS THE PLATE GIVING UP.
   *
   * The shell below is a chrome plus a four-card viewport, and the device it
   * would have to hold lays out 763px of screen into 547 of `.cswap`. There is
   * no arrangement of those two numbers that leaves the device unchanged, so
   * this route does not try: `.morph` keeps its id and its transforms — the
   * engine still owns the peek, the shrink and the fade — and holds the real
   * device instead of a viewport.
   *
   * The tour is still four chapters long. What changed is where they live:
   * instead of four faces sliding inside a plate, one device shows whichever
   * chapter the scroll has landed on, and each carries its own screen and its
   * own flow. See AppDevice. The header and the tab bar go with the viewport —
   * the device brings its own.
   */
  if (deck === 'app') {
    return (
      <div className="morph appmorph" id="morph" data-mode={mode} data-deck={deck}>
        <AppDevice />
      </div>
    );
  }

  return (
    <div className="morph" id="morph" data-mode={mode} data-deck={deck}>
      <SheetSlotProvider>
        <div className="hhead">
          <span className="avatar" aria-hidden="true"><NearGlyph /></span>
          <span className="atitle">{CH_TITLES[0]}</span>
          <span className="hicons">
            <span className="icb" aria-hidden="true"><IconScan /></span>
            <span className="icb" aria-hidden="true"><IconLock /></span>
          </span>
        </div>

        <div className="cswap">
          <PerpsFace />
          <AccountFace />
          <SwapFace />
          <EarnFace />
        </div>

        <TabBar />
      </SheetSlotProvider>
    </div>
  );
}
