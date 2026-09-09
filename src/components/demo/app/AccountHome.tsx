'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Dot } from '@/components/demo/app/Dot';
import { NearAvatar } from '@/components/demo/app/NearAvatar';
import { ArrowDownIcon, ArrowRightIcon, EyeIcon, ScanIcon, SendIcon } from '@/components/demo/icons';
import {
  EARN_BAL, HOLDINGS, PERPS_BAL, crypto, total,
} from '@/components/demo/ownv5/state';

/**
 * THE ACCOUNT HOME, ONCE — and it is two chapters' screen now.
 * ==================================================================
 * Read off frame 0:00 of `rec-Everything you own + Swap screen.MP4` and frame
 * 0:01 of `rec-Earn + being able to send:pay from your earn balance.MP4`, which
 * are the same screen in the same session: the total, Receive/Send, and three
 * balances that go somewhere.
 *
 * IT LIVED IN `ownv5/Phone.tsx` UNTIL THE EARN CHAPTER NEEDED IT TOO. Copying
 * it would have been two homes for one account, and the first time anybody
 * adjusted a figure the tour would have shown a reader two different totals for
 * the same wallet within one scroll. So it moved out here and takes its rows'
 * behaviour as a prop: own-v5 lights Crypto, earn-v5 lights Earn, and neither
 * owns the screen.
 *
 * THE TWO RECORDINGS ARE ONE SESSION, WHICH IS WHY THIS WORKS. The earn
 * recording's home reads Crypto $6,698.54 and Earn $2,389.53 — which is this
 * wallet's $6,740.26 less the 41.72 USDC that went into Taler, and its
 * $2,347.81 plus that same 41.72. The arithmetic closes to the cent in both
 * directions, so the figures here are one account's, not one frame's.
 */

const usd = (v: number, dp = 2) => '$' + fmt(v, dp);

/** the distinct assets behind the Crypto row, in the order they first appear */
const SYMS = [...new Set(HOLDINGS.map((h) => h.sym))];

/**
 * THREE NAMES AND A COUNT, NOT FIVE NAMES.
 *
 * The strip listed every symbol, which was fine at two and wrapped onto a
 * second line at five — and a Crypto row a line taller than Perps and Earn
 * makes the card read as three rows of different importance. The marks beside
 * it already say which assets these are; the text only has to say how many.
 */
const STRIP = SYMS.length > 3
  ? `${SYMS.slice(0, 3).join(', ')} +${SYMS.length - 3}`
  : SYMS.join(', ');

/**
 * WHAT ON THIS SCREEN CAN BE PRESSED.
 *
 * The three balance rows, and `send` — the second of the two buttons under the
 * total. It was drawn and inert for as long as nothing led anywhere from it;
 * the earn chapter's last scene goes through it into Universal Send, which is
 * the screen that pays for a transfer out of a yield position.
 */
export type HomeRow = 'crypto' | 'perps' | 'earn' | 'send';

export function AccountHome({ go, lit }: {
  /** what pressing a row does. A row with no entry is drawn and inert. */
  go?: Partial<Record<HomeRow, (() => void) | null>>;
  /**
   * The row being held down. Not a hover and not a focus ring — it is the
   * lighter fill the app paints under a finger, and on a screen with no cursor
   * it is the only thing that says why the next screen arrived.
   */
  lit?: string | null;
}) {
  /**
   * THE ENTRANCE PLAYS ON ARRIVAL, WHICH IS NOT THE SAME AS ONCE A PASS.
   *
   * It was keyed on the loop pass, so the swap chapter's home animated TWICE
   * every loop: once when `Swap again` brought the reader back to it, and again
   * a second later when the pass ticked over under a screen that had not
   * changed. Two entrances for one arrival, and the second one landed on a
   * frame nobody had left.
   *
   * A constant key is right because this component is CONDITIONALLY RENDERED:
   * leaving the home unmounts it and coming back mounts it again, and a CSS
   * entrance plays on mount without being asked. The key was only ever forcing
   * a replay in the one case that should not have had one — the loop seam,
   * where the screen is already the screen it is about to become.
   */
  return (
    <Enter k="home" className="ownhome">
      {/* THE CHROME, from the app's own home screen: a green rounded square
          carrying the NEAR mark, the word Account, and one control on the
          right. Not two — the reference has a single scan button where the
          older recording had a scan and a lock. */}
      <div className="ownhead">
        <NearAvatar />
        <b>Account</b>
        <span className="ownscan" aria-hidden="true"><ScanIcon strokeWidth={2} /></span>
      </div>

      <span className="ownlab">
        Total balance
        {/* the app puts one here, and it is what says the
            figure can be hidden */}
        <EyeIcon className="owneye" strokeWidth={1.7} />
      </span>
      <span className="owntotal">{usd(total())}</span>

      <div className="ownpair">
        <span className="ownbtn">
          <ArrowDownIcon strokeWidth={2} />
          Receive
        </span>
        {/* the one of the pair that leads somewhere. `live`/`press` and the
            `data-lit` attribute are the same three the balance rows use, so a
            press here reads exactly like a press on Earn. */}
        <span className={'ownbtn' + live(go?.send ?? null)} {...press(go?.send ?? null)}
              data-tap="send" data-lit={lit === 'send' ? '1' : undefined}>
          <SendIcon strokeWidth={2} />
          Send
        </span>
      </div>

      <div className="owncard">
        <span className="owncardh">Balances</span>

        {/* THE LABEL IS THE FRAME'S AGAIN. It read "Crypto and stocks" for as
            long as this wallet held a tokenised share — a row saying Crypto
            with an Apple position under it contradicts itself. The share is
            gone with the rest of the brief's five, so the recording's own word
            is the accurate one again, and "and stocks" would now be the row
            promising something the list does not have. */}
        <Row row="crypto" label="Crypto" value={crypto()} go={go} lit={lit}>
          {/* one chip per ASSET, not per row — the wallet holds USD Coin on
              two networks and a strip reading "USDC, USDC" is a duplicate,
              not a second holding */}
          {SYMS.map((sym) => <Dot a={HOLDINGS.find((h) => h.sym === sym)!} size={17} key={sym} />)}
          <i>{STRIP}</i>
        </Row>

        <Row row="perps" label="Perps" value={PERPS_BAL} go={go} lit={lit}>
          <i>Trade with up to <b>50x</b> leverage</i>
        </Row>

        <Row row="earn" label="Earn" value={EARN_BAL} go={go} lit={lit}>
          <i className="ownup">▲ 5.1%</i><i>blended APY</i>
        </Row>
      </div>
    </Enter>
  );
}

function Row({ row, label, value, children, go, lit }: {
  row: HomeRow;
  label: string;
  value: number;
  children: React.ReactNode;
  go?: Partial<Record<HomeRow, (() => void) | null>>;
  lit?: string | null;
}) {
  const on = go?.[row] ?? null;
  return (
    <div className={'ownrow' + live(on)} {...press(on)}
         data-tap={row} data-lit={lit === row ? '1' : undefined}>
      <span className="ownrowl">
        <em>{label}</em>
        <b>{usd(value)}</b>
        <span className="ownpills">{children}</span>
      </span>
      <Chev />
    </div>
  );
}

/**
 * The affordance every balance row carries.
 *
 * An ARROW and not a chevron. The older recording draws `›` here; the current
 * home screen draws `→`, and this file follows the newer of the two frames.
 * They say different things: a chevron is "there is more of this", an arrow is
 * "this goes somewhere", and the row goes somewhere.
 */
function Chev() {
  return <ArrowRightIcon className="ownchev" strokeWidth={2} />;
}

