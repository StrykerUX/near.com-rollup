'use client';
import type { ReactNode } from 'react';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Layer, Tabs } from '@/components/demo/shell/Frame';
import { Dot } from '@/components/demo/app/Dot';
import { AccountHome } from '@/components/demo/app/AccountHome';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  ACTIONS, HOLDINGS, crypto, earnsOn, value,
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
 *   a row's actions sheet   frame 0:09 — Swap, Send, Earn
 *
 * `.pdev.app` carries the face, the palette, the tempo, the chrome and the
 * sheet mechanics, so this file draws only what is actually an account.
 */

const usd = (v: number, dp = 2) => '$' + fmt(v, dp);

/**
 * A QUANTITY OF AN ASSET, WHICH IS NOT A FIGURE IN DOLLARS.
 *
 * `0.75 BTC` and `25000 NEAR` — no thousands separator, and no decimals where
 * there are none to show. The reference screen prints `1555.3148 NEAR` and
 * `45.4039 USDC`: ungrouped, and to as many places as the quantity actually
 * has. Grouped and padded, this wallet read `25,000.0000 NEAR`, which is four
 * zeroes claiming a precision about nothing and a comma in a figure you could
 * paste into a field.
 */
const qty = (v: number, dp: number) =>
  /* ONLY INSIDE THE FRACTION. `/\.?0+$/` ate the zero off `120 AAPL` and made
     it 12 — a share count is not a decimal place. */
  v.toFixed(dp).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev app own" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      <div className="pdview">
        {s.screen === 'home'
          ? <AccountHome lit={s.lit} go={{ crypto: d.can('toAssets') }} />
          : <Assets d={d} />}
      </div>
      <Tabs on={s.screen === 'home' ? 'Home' : 'Assets'} />
      <ActionSheet d={d} />
    </div>
  );
}

/* ---- 1 · the account --------------------------------------------------
   THE HOME IS `demo/app/AccountHome.tsx` NOW. The earn chapter opens on the
   same screen and presses a different row on it; a copy would have been two
   homes for one account, and the tour would have shown two totals for the same
   wallet within one scroll the first time anybody adjusted a figure. */

/* ---- 2 · the assets ---------------------------------------------------- */

function Assets({ d }: { d: Deck }) {
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

      {/* NO MAIN / CONFIDENTIAL SPLIT. It was two halves across the top of this
          screen, because the app used to hold two balances and most of this
          wallet was in the private one. near.com is confidential BY DEFAULT
          now — its own Assets screen has one total and no split — so the halves
          are gone and so is the `bucket` they switched between. */}

      {/* the five holdings — see HOLDINGS in state.ts for the reversal that put
          the brief's list back and the one number in it that moved */}
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
  const apy = earnsOn(h.sym);
  return (
    <span className={'ownitem' + live(open)} {...press(open)} data-tap={'row:' + h.id}
          data-lit={d.s.lit === 'row:' + h.id ? '1' : undefined}
          style={{ animationDelay: `${i * 45}ms` }}>
      <Dot a={h} size={34} />
      <span className="ownitemt">
        <b>{h.name}</b>
        <em>{qty(h.qty, h.dp)} {h.sym}{h.by ? ` · ${h.by}` : ''}</em>
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
 * row pills. Drawing new marks for verbs the device has already named would
 * make the sheet look like a different app's.
 */
const ACT_ICON: Record<string, ReactNode> = {
  /* SCALED, because it is drawn on the tab bar's grid and the others are not.
     This path spans 10 units of the 24 viewBox where Send spans 20 and the
     other two span 14, so at the same 18px box it rendered at about half their
     size. 1.4 takes it to 14 and puts it with the arrow and the bars rather
     than matching Send, which is the largest of the four. The stroke is
     pre-divided so it still lands at the 1.9 the others use — scaling a path
     scales its stroke with it. */
  Swap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.36"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="translate(12 12) scale(1.4) translate(-12 -12)">
        <path d="M7 9.4h9l-2.4-2.4M17 14.6H8l2.4 2.4" />
      </g>
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
  /* `Move to Main` had one here — an arrow back into the unshielded balance —
     and it went with the balance. There is one now. */
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
                      key={a} {...press(fn)} data-tap={first ? 'swap' : undefined}
                      data-lit={first && s.lit === 'swap' ? '1' : undefined}>
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
