'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Dot } from '@/components/demo/app/Dot';
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
        <span className="ownav" aria-hidden="true"><NearMark /></span>
        <b>Account</b>
        <span className="ownscan" aria-hidden="true">
          {/* lucide `scan` (ISC) */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          </svg>
        </span>
      </div>

      <span className="ownlab">
        Total balance
        {/* lucide `eye` (ISC) — the app puts one here, and it is what says the
            figure can be hidden */}
        <svg className="owneye" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </span>
      <span className="owntotal">{usd(total())}</span>

      <div className="ownpair">
        <span className="ownbtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
          </svg>
          Receive
        </span>
        {/* the one of the pair that leads somewhere. `live`/`press` and the
            `data-lit` attribute are the same three the balance rows use, so a
            press here reads exactly like a press on Earn. */}
        <span className={'ownbtn' + live(go?.send ?? null)} {...press(go?.send ?? null)}
              data-tap="send" data-lit={lit === 'send' ? '1' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
          </svg>
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
 * lucide `arrow-right` (ISC) — the affordance every balance row carries.
 *
 * An ARROW and not a chevron. The older recording draws `›` here; the current
 * home screen draws `→`, and this file follows the newer of the two frames.
 * They say different things: a chevron is "there is more of this", an arrow is
 * "this goes somewhere", and the row goes somewhere.
 */
function Chev() {
  return (
    <svg className="ownchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/**
 * THE NEAR MARK, as the account avatar — the path from the supplied
 * `Vector.svg`, on its own 326-unit grid. `marks/index.tsx` carries the same
 * logo on a 351 grid for the nav; this is the file that was handed over for
 * this spot, so this is the one that is drawn here.
 */
function NearMark() {
  return (
    <svg viewBox="0 0 326 325" fill="currentColor" aria-hidden="true">
      <path d="M291.272 3.04803e-08C285.334 -0.000248205 279.495 1.51575 274.312 4.40348C269.129 7.2912 264.774 11.4544 261.662 16.4962L193.515 117.358C192.45 118.953 192.063 120.904 192.439 122.783C192.626 123.713 192.994 124.597 193.524 125.386C194.054 126.174 194.734 126.85 195.526 127.377C196.842 128.248 198.408 128.667 199.986 128.571C201.563 128.474 203.066 127.867 204.265 126.841L271.337 68.8377C272.447 67.8354 274.165 67.9406 275.171 69.0471C275.627 69.5602 275.871 70.2121 275.871 70.888V252.482C275.871 252.838 275.801 253.19 275.664 253.519C275.527 253.847 275.327 254.146 275.074 254.397C274.821 254.648 274.52 254.847 274.19 254.982C273.86 255.117 273.506 255.186 273.149 255.184C272.752 255.185 272.36 255.099 272.001 254.932C271.641 254.765 271.323 254.521 271.069 254.217L68.3104 12.2558C65.0505 8.41718 60.9912 5.33241 56.4147 3.21593C51.8382 1.09945 46.8542 0.00203948 41.8092 3.04803e-08H34.7281C15.5529 3.04803e-08 0 15.5058 0 34.6228V290.377C0 309.494 15.5529 325 34.7281 325C40.6659 325.001 46.505 323.486 51.6885 320.598C56.872 317.711 61.2269 313.547 64.3378 308.505L132.485 207.642C133.013 206.853 133.38 205.968 133.564 205.037C133.749 204.106 133.748 203.148 133.562 202.218C133.375 201.288 133.006 200.403 132.477 199.615C131.947 198.826 131.267 198.15 130.475 197.623C129.159 196.752 127.592 196.332 126.015 196.429C124.437 196.526 122.934 197.133 121.735 198.159L54.6627 256.163C53.5528 257.165 51.8348 257.059 50.8305 255.953C50.3768 255.447 50.1306 254.79 50.1406 254.112V72.4728C50.1403 72.1168 50.2106 71.7643 50.3475 71.4355C50.4843 71.1067 50.685 70.8081 50.938 70.5568C51.191 70.3056 51.4913 70.1067 51.8217 69.9716C52.152 69.8365 52.5059 69.7678 52.863 69.7696C53.6584 69.7696 54.4287 70.1188 54.9434 70.7361L257.666 312.745C260.927 316.583 264.986 319.667 269.563 321.783C274.139 323.899 279.123 324.997 284.168 325H291.249C310.424 325 325.988 309.518 326 290.401V34.6228C326 15.5058 310.447 3.04803e-08 291.272 3.04803e-08Z" />
    </svg>
  );
}
