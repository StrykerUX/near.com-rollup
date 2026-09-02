'use client';
import type { ReactNode } from 'react';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Layer, Tabs } from '@/components/demo/shell/Frame';
import { Dot } from '@/components/demo/app/Dot';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  ACTIONS, EARNS, EARN_BAL, HOLDINGS, MAIN_BAL, PERPS_BAL, confidential, crypto, total, value,
  type OW, type OWAction, type Holding,
} from './state';

type Deck = GenericDeck<OW, OWAction>;

/**
 * EVERYTHING YOU OWN — THE DEVICE
 * ==================================================================
 * Two screens and a sheet, all three read off
 * `rec-Everything you own + Swap screen.MP4` at one frame per second:
 *
 *   the account home        frame 0:00 — total, Receive/Send, three balances
 *   the assets screen       frames 0:01–0:08 — total, Main/Confidential, rows
 *   a row's actions sheet   frame 0:09 — Swap, Send, Earn, Move to Main
 *
 * `.pdev.app` carries the face, the palette, the tempo, the chrome and the
 * sheet mechanics, so this file draws only what is actually an account.
 */

const usd = (v: number, dp = 2) => '$' + fmt(v, dp);
/** the distinct assets behind the rows, in the order they first appear */
const SYMS = [...new Set(HOLDINGS.map((h) => h.sym))];

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev app own" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      <div className="pdview">
        {s.screen === 'home' ? <Home d={d} /> : <Assets d={d} />}
      </div>
      <Tabs on={s.screen === 'home' ? 'Home' : 'Assets'} />
      <ActionSheet d={d} />
    </div>
  );
}

/* ---- 1 · the account --------------------------------------------------- */

function Home({ d }: { d: Deck }) {
  const open = d.can('toAssets');
  return (
    <Enter k={`h${d.pass}`} className="ownhome">
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
        <span className="ownbtn">
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
        <div className={'ownrow' + live(open)} {...press(open)} data-tap="crypto">
          <span className="ownrowl">
            <em>Crypto</em>
            <b>{usd(crypto())}</b>
            <span className="ownpills">
              {/* one chip per ASSET, not per row — the wallet holds USD Coin on
                  two networks and a strip reading "USDC, USDC" is a duplicate,
                  not a second holding */}
              {SYMS.map((sym) => <Dot a={HOLDINGS.find((h) => h.sym === sym)!} size={17} key={sym} />)}
              <i>{SYMS.join(', ')}</i>
            </span>
          </span>
          <Chev />
        </div>

        <div className="ownrow">
          <span className="ownrowl">
            <em>Perps</em>
            <b>{usd(PERPS_BAL)}</b>
            <span className="ownpills"><i>Trade with up to <b>50x</b> leverage</i></span>
          </span>
          <Chev />
        </div>

        <div className="ownrow">
          <span className="ownrowl">
            <em>Earn</em>
            <b>{usd(EARN_BAL)}</b>
            <span className="ownpills"><i className="ownup">▲ 5.1%</i><i>blended APY</i></span>
          </span>
          <Chev />
        </div>
      </div>
    </Enter>
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

/* ---- 2 · the assets ---------------------------------------------------- */

function Assets({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Enter k={`a${d.pass}`} className="ownassets">
      <b className="ownh">Assets</b>

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
      <span className="owntotal">{usd(crypto())}</span>

      {/* THE TWO HALVES, and they are in every frame of this screen. The brief
          does not mention them; keeping them is not a liberty, dropping them
          would be — most of this wallet is confidential and the header is where
          the app says so. */}
      <div className="ownsplit">
        {(['main', 'conf'] as const).map((k) => {
          const on = d.can('bucket', k);
          return (
            <span className={'ownhalf' + (s.bucket === k ? ' on' : '') + live(on)} key={k}
                  {...press(on)} data-tap={'bucket:' + k}>
              <i>{k === 'main' ? 'Main' : 'Confidential'}</i>
              <b>{usd(k === 'main' ? MAIN_BAL : confidential())}</b>
            </span>
          );
        })}
      </div>

      {/* the three rows the recording holds — see HOLDINGS in state.ts for why
          these and not the brief's five */}
      <div className="ownlist">
        {HOLDINGS.map((h, i) => (
          <Row h={h} d={d} key={h.id} i={i} />
        ))}
      </div>
    </Enter>
  );
}

function Row({ h, d, i }: { h: Holding; d: Deck; i: number }) {
  const open = d.can('actions', h.id);
  const apy = EARNS[h.sym];
  return (
    <span className={'ownitem' + live(open)} {...press(open)} data-tap={'row:' + h.id}
          style={{ animationDelay: `${i * 45}ms` }}>
      <Dot a={h} size={34} />
      <span className="ownitemt">
        <b>{h.name}</b>
        <em>{fmt(h.qty, h.dp)} {h.sym}{h.by ? ` · ${h.by}` : ''}</em>
      </span>
      <span className="ownitemv">
        <b>{usd(value(h))}</b>
        <i className={h.up ? 'ownup' : 'owndown'}>{h.chg}</i>
      </span>
      {/* only where there is something to earn — see `.ownearn` in the
          stylesheet for why the column is not reserved on the other three */}
      {apy ? (
        <span className="ownearn">
          <i className="ownpill"><Bars /><b>Earn {apy}</b><PillChev /></i>
        </span>
      ) : null}
    </span>
  );
}

/**
 * lucide `chevron-right` (ISC), and A CHEVRON here where the balance rows take
 * an arrow. The pill is not a destination, it is more of this row — which is
 * the distinction `Chev` above is named for. It came back when the wallet did:
 * the five-holding version printed $149,187.78 and could not spare the 12px,
 * these three print $6,635.62 and can.
 */
function PillChev() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** lucide `bar-chart` (ISC), ascending — the mark the app's Earn tab carries */
function Bars() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" aria-hidden="true">
      <path d="M5 20v-4" /><path d="M12 20V9" /><path d="M19 20V4" />
    </svg>
  );
}

/**
 * THE FOUR ICONS THE SHEET CARRIES, and it had none.
 *
 * Each is the mark the app already uses for that verb somewhere else on this
 * device, which is the point of them: Swap is the tab bar's own glyph, Send is
 * the paper plane from the home screen's button, Earn is the bar chart on the
 * row pills, and Move to Main is the arrow back into the unshielded balance.
 * Drawing four new marks for four verbs the device has already named would make
 * the sheet look like a different app's.
 */
const ACT_ICON: Record<string, ReactNode> = {
  Swap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 9.4h9l-2.4-2.4M17 14.6H8l2.4 2.4" />
    </svg>
  ),
  Send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  ),
  Earn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
         strokeLinecap="round" aria-hidden="true">
      <path d="M5 20v-4" /><path d="M12 20V9" /><path d="M19 20V4" />
    </svg>
  ),
  'Move to Main': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  ),
};

/* ---- 3 · what a row opens ---------------------------------------------- */

function ActionSheet({ d }: { d: Deck }) {
  const { s } = d;
  const h = HOLDINGS.find((x) => x.id === s.acted);
  const swap = d.can('swap');

  return (
    <Layer open={!!s.acted} onScrim={d.can('closeSheet')}>
      <div className="dsheet ownact">
        <span className="dgrab" />
        {h ? (
          <>
            <div className="ownacth">
              <Dot a={h} size={34} />
              <span className="ownitemt">
                <b>{h.name}</b>
                <em>{fmt(h.qty, h.dp)} {h.sym}</em>
              </span>
            </div>

            {ACTIONS.map((a) => {
              const first = a === 'Swap';
              const fn = first ? swap : null;
              return (
                <span className={'ownaction' + (s.handoff && first ? ' taken' : '') + live(fn)}
                      key={a} {...press(fn)} data-tap={first ? 'swap' : undefined}>
                  {ACT_ICON[a]}{a}
                </span>
              );
            })}
          </>
        ) : null}
      </div>
    </Layer>
  );
}
