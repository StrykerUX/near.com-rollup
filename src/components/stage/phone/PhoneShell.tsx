'use client';
import { NearGlyph } from '@/components/marks';
import { CH_TITLES } from '@/lib/schedule';
import { AccountFace } from './AccountFace';
import { EarnFace } from './EarnFace';
import { IconLock, IconScan } from './icons';
import { PerpsFace } from './PerpsFace';
import { SwapFace } from './SwapFace';
import { TabBar } from './TabBar';
import { SheetSlotProvider } from './ui/SheetSlot';
import { useMode } from './flows/mode';

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

  return (
    <div className="morph" id="morph" data-mode={mode}>
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
