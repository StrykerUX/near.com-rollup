import { NearGlyph } from '@/components/marks';
import { CH_TITLES } from '@/lib/schedule';
import { AccountFace } from './AccountFace';
import { EarnFace } from './EarnFace';
import { IconLock, IconScan } from './icons';
import { PerpsFace } from './PerpsFace';
import { SwapFace } from './SwapFace';
import { SwapProvider } from './swapState';
import { TabBar } from './TabBar';
import { TokenMenu } from './TokenMenu';

/**
 * The phone shell: one chrome, four screens.
 *
 * The header and the tab bar live OUTSIDE `.cswap` on the shell itself and
 * never move — only the faces inside slide. That is what lets a single header
 * title and a single tab row serve all four screens.
 *
 * The faces are authored in DISPLAY order (Perps, Account, Swap, Earn). Their
 * `data-face` attributes keep the ORIGINAL indices, because the stylesheet and
 * the demo-app wiring both select on them.
 */
export function PhoneShell() {
  return (
    <SwapProvider>
      <div className="morph" id="morph">
        <div className="hhead">
          <span className="avatar" aria-hidden="true"><NearGlyph /></span>
          <span className="atitle">{CH_TITLES[0]}</span>
          <span className="hicons">
            <button className="icb" type="button" aria-label="Scan"><IconScan /></button>
            <button className="icb" type="button" aria-label="Locked"><IconLock /></button>
          </span>
        </div>

        <div className="cswap">
          <PerpsFace />
          <AccountFace />
          <SwapFace />
          <EarnFace />
        </div>

        <TabBar />
        <TokenMenu />
      </div>
    </SwapProvider>
  );
}
