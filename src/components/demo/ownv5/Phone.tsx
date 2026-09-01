'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Layer, Tabs } from '@/components/demo/shell/Frame';
import { Dot } from '@/components/demo/app/Dot';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  ACTIONS, EARN_BAL, HOLDINGS, MAIN_BAL, PERPS_BAL, confidential, crypto, total, value,
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
      <div className="ownhead">
        <span className="ownav" aria-hidden="true" />
        <b>Account</b>
      </div>

      <span className="ownlab">Total balance</span>
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

        {/* THE LABEL IS THE BRIEF'S, NOT THE FRAME'S. The recording reads
            "Crypto", because the wallet it was filmed on holds none. This one
            holds a tokenised share, and a row that says Crypto with an Apple
            position under it would be the screen contradicting itself. */}
        <div className={'ownrow' + live(open)} {...press(open)} data-tap="crypto">
          <span className="ownrowl">
            <em>Crypto and stocks</em>
            <b>{usd(crypto())}</b>
            <span className="ownpills">
              {HOLDINGS.slice(0, 3).map((h) => <Dot a={h} size={17} key={h.sym} />)}
              <i>{HOLDINGS.slice(0, 3).map((h) => h.sym).join(', ')}</i>
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

/** lucide `chevron-right` (ISC) — the affordance every balance row carries */
function Chev() {
  return (
    <svg className="ownchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ---- 2 · the assets ---------------------------------------------------- */

function Assets({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Enter k={`a${d.pass}`} className="ownassets">
      <b className="ownh">Assets</b>

      <span className="ownlab">Total balance</span>
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

      {/* five rows, and they are sorted by value — see HOLDINGS in state.ts for
          the two quantities that had to move for that to be true */}
      <div className="ownlist">
        {HOLDINGS.map((h, i) => (
          <Row h={h} d={d} key={h.sym} i={i} />
        ))}
      </div>
    </Enter>
  );
}

function Row({ h, d, i }: { h: Holding; d: Deck; i: number }) {
  const open = d.can('actions', h.sym);
  return (
    <span className={'ownitem' + live(open)} {...press(open)} data-tap={'row:' + h.sym}
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
    </span>
  );
}

/* ---- 3 · what a row opens ---------------------------------------------- */

function ActionSheet({ d }: { d: Deck }) {
  const { s } = d;
  const h = HOLDINGS.find((x) => x.sym === s.acted);
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
                  {a}
                </span>
              );
            })}
          </>
        ) : null}
      </div>
    </Layer>
  );
}
