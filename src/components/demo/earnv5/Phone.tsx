'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { Layer, Tabs } from '@/components/demo/shell/Frame';
import { Count } from '@/components/demo/shell/Count';
import { Typed, writeMs } from '@/components/demo/shell/Typed';
import { Dot } from '@/components/demo/app/Dot';
import { AccountHome } from '@/components/demo/app/AccountHome';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import { HOLDINGS } from '@/components/demo/ownv5/state';
import { PRICE } from '@/lib/prices';
import {
  BETA, BLURB, COLS, REFERENCE, SEND_NET, SEND_TOK, STAKE_APY, STAKED_NEAR, STEPS, SUB,
  TABS, TAB_NAMES, TITLE, VAULTS, available, balanceOf, cta, stakeUsd, vaultOf,
  type EA, type EAAction, type Vault,
} from './state';

type Deck = GenericDeck<EA, EAAction>;

/**
 * EARN — THE DEVICE
 * ==================================================================
 * Read off `rec-Earn + being able to send:pay from your earn balance.MP4`. The
 * Vaults half is quoted: the Beta badge, the subtitle, the paragraph, the
 * table's own `Vault` / `Balance` headers, both rows with `TVL … · rate` under
 * the name, and Taler's sheet down to the fee wording and the reference id.
 *
 * IT OPENS ON THE ACCOUNT HOME, which is the same screen `/demo/own-v5` opens
 * on — `demo/app/AccountHome.tsx`, one component, because it is one account.
 * That chapter presses Crypto; this one presses the Earn balance.
 *
 * The Staking pane is the brief's — see `STAKED_NEAR` in state.ts. This cut
 * does not go there; the tab is drawn because it is on film.
 */

const usd = (v: number, dp = 2) => '$' + fmt(v, dp);

/*
 * THE VAULT ROW'S DOLLARS ARE CUT, NOT ROUNDED — $1,047 before the deposit and
 * $1,069 after, on a balance of 1069.555. Rounding prints $1,070 and is a
 * dollar out in the only number this chapter exists to move. The truncation is
 * done at the call site now, where `Count` can travel to the whole figure:
 * `Math.trunc` outside, `dp={0}` inside.
 */
const USDC = { sym: 'USDC', color: '#2775CA', ink: '#fff' };
const NEAR = { sym: 'NEAR', color: '#00EC97', ink: '#000' };

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev app earn" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      <div className="pdview">
        {s.screen === 'home'
          ? <AccountHome lit={s.lit} go={{ earn: d.can('toEarn'), send: d.can('toSend') }} />
          : s.screen === 'send'
            ? <Send d={d} />
            : <Earn d={d} />}
      </div>

      {/* THE TAB BAR HAS NO EARN. Home / Assets / Swap / Perps / Menu is the
          whole row in every frame of every recording — Earn is reached from
          the Home screen's third balance row.
          AND NOTHING IS LIT ON THE EARN PAGE, which is the frame: every item in
          that row is dim there, because Earn is not one of them. Lighting Home
          would be the bar claiming you are somewhere you left. */}
      <Tabs on={s.screen === 'home' ? 'Home' : 'None'} />
      <VaultSheet d={d} />
      <PaySheet d={d} />
    </div>
  );
}

/* ---- the earn page ----------------------------------------------------- */

function Earn({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Enter k={`e${d.pass}`} className="ernpage">
      <div className="ernhead">
        <b>{TITLE}</b><i className="ernbeta">{BETA}</i>
      </div>
      <span className="ernsub">{SUB}</span>

      <div className="erntabs">
        {TABS.map((k) => {
          const on = d.can('tab', k);
          return (
            <span className={'erntab' + (s.tab === k ? ' on' : '') + live(on)} key={k}
                  {...press(on)} data-tap={'tab:' + k}
                  data-lit={s.lit === 'tab:' + k ? '1' : undefined}>
              {TAB_NAMES[k]}
            </span>
          );
        })}
      </div>

      {s.tab === 'vaults' ? <Vaults d={d} /> : <Staking d={d} />}
    </Enter>
  );
}

/* ---- 1 · the vaults ---------------------------------------------------- */

function Vaults({ d }: { d: Deck }) {
  return (
    <Enter k={`v${d.pass}`} className="ernpane">
      <p className="ernblurb">{BLURB}</p>

      {/* THE TABLE IS A CARD, and its header is inside it. It was three loose
          strips on the page — a header row with a rule under it and two rows
          with rules under them, the last one drawing a line under nothing. The
          frame gives them one container: a fill, a hairline, and dividers that
          are the card's internal furniture rather than marks on the page. */}
      <div className="erntable">
        <div className="erncols"><i>{COLS[0]}</i><i>{COLS[1]}</i></div>

        <div className="ernlist">
          {VAULTS.map((v) => {
            const open = d.can('openVault', v.id);
            return (
              <span className={'ernrow' + live(open)} key={v.id} {...press(open)}
                    data-tap={'vault:' + v.id}
                    data-lit={d.s.lit === 'vault:' + v.id ? '1' : undefined}>
                <Dot a={USDC} size={30} />
                <span className="ernrowt">
                  <b>{v.name}{v.promo ? <i className="ernpromo">Promo</i> : null}</b>
                  <em>TVL {v.tvl} · {v.apr}</em>
                </span>
                {/* THE ONE FIGURE THIS CHAPTER MOVES, so it is the one that
                    travels. `/demo/perps-v5` eases every derived number it has
                    for the reason its `Count` file gives: four figures changing
                    in one frame is correct and unreadable, and the trip is what
                    makes the link between the press and the answer visible at
                    all. 960ms is the duration that cut gives a BALANCE. */}
                <b className="ernbal">
                  <Count value={Math.trunc(balanceOf(d.s, v))} prefix="$" ms={960} />
                </b>
                <Chev />
              </span>
            );
          })}
        </div>
      </div>
    </Enter>
  );
}

/** lucide `chevron-right` (ISC) */
function Chev() {
  return (
    <svg className="ernchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ---- 2 · the stake ----------------------------------------------------- */

function Staking({ d }: { d: Deck }) {
  return (
    <Enter k={`s${d.pass}`} className="ernpane">
      <p className="ernblurb">
        Stake NEAR to help secure the network. Rewards accrue every epoch and
        compound into the same position.
      </p>
      <div className="ernstake">
        <div className="ernstakeh">
          <Dot a={NEAR} size={34} />
          <span className="ernrowt"><b>NEAR</b><em>Staked · {STAKE_APY} APY</em></span>
          <span className="ernlive"><i />Accruing</span>
        </div>
        <b className="ernstakev">{fmt(STAKED_NEAR, 0)} <em>NEAR</em></b>
        <span className="ernstakeu">{usd(stakeUsd())}</span>
      </div>
    </Enter>
  );
}

/* `Positions` was a third tab and a third pane, and no frame of any recording
   has either — see `TABS` in state.ts. Both are gone. */

/* ---- Universal Send, and paying out of the vault ------------------------ */

/** the vault, as a thing you can pay with */
const PAY_VAULT = {
  id: 'gauntlet', name: 'Gauntlet USDC', sub: 'Yield vault', sym: 'USDC',
  a: USDC,
};

/** what a pay-with source is called and what it holds, in one place */
function paySource(s: EA) {
  if (s.payFrom === 'gauntlet') {
    const bal = balanceOf(s, vaultOf('gauntlet'));
    return { name: PAY_VAULT.name, a: USDC, bal: `~${fmt(bal, 2)} USDC`, usd: bal };
  }
  const h = HOLDINGS.find((x) => x.id === s.payFrom) ?? HOLDINGS[0];
  return {
    name: h.sym, a: { sym: h.sym, color: h.color, ink: h.ink },
    bal: `${fmt(h.qty, h.dp)} ${h.sym}`, usd: h.qty * (PRICE[h.sym] ?? 0),
  };
}

/**
 * THE SCREEN THAT SPENDS THE YIELD.
 *
 * Read off `ScreenRecording_09-02-2026 22-01-47_1.MP4` at two frames a second:
 * a title and a one-line subtitle, three summary rows (Token, Network,
 * Recipient), the amount in the destination token with its dollar value under
 * it, and then `Pay with` — a divider, a source chip, that source's balance,
 * and `Use max`. The button below is `Enter amount` until there is one and
 * `Review send` after, and it stays grey either way because no recipient has
 * been chosen. That greyness is in the clip and it is kept: this chapter is
 * about where the money comes FROM, and a live send button would invite a
 * reader to wonder where it is going.
 */
function Send({ d }: { d: Deck }) {
  const { s } = d;
  const src = paySource(s);
  const amt = Number(s.sendAmt || 0);
  const pick = d.can('payPicker');

  return (
    <Enter k={`n${d.pass}`} className="ernsend">
      <b className="ernsendh">Universal Send</b>
      <p className="ernsendp">Send any token to any network, pay with any asset you own.</p>

      {/* THREE ROWS, AND THEY ARE NOT CONTROLS ON THIS CUT. The clip opens the
          token picker to get to ZEC; this scene arrives with the destination
          already set, the way the swap chapter's form does, because the
          gesture worth the beats here is the one underneath. */}
      <div className="ernsrow">
        <Dot a={{ sym: 'ZEC', color: '#F4B728', ink: '#000' }} size={26} />
        <span><i>Token</i><b>{SEND_TOK}</b></span>
        <ChevDown />
      </div>
      <div className="ernsrow">
        <Dot a={{ sym: 'ZEC', color: '#F4B728', ink: '#000' }} size={26} />
        <span><i>Network</i><b>{SEND_NET}</b></span>
        <ChevDown />
      </div>
      <div className="ernsrow">
        <span className="ernswal" aria-hidden="true" />
        <span><i>Recipient</i><b>Select recipient</b></span>
        <ChevDown />
      </div>

      <div className="ernsamt">
        {/* the same field the vault sheet and the swap screen have, and for
            the same reason: the figure is WRITTEN rather than counted, because
            easing 0 up to a typed number scrambles every glyph at once. The
            dollars underneath are counted, and wait for the writing to finish. */}
        <span className="ernsfig" style={{ '--len': (s.sendAmt || '0').length } as React.CSSProperties}>
          <b><Typed text={s.sendAmt || '0'} /></b>
          <em>{SEND_TOK}</em>
        </span>
        <span className="ernsusd">
          <Count value={amt * PRICE.ZEC} dp={amt ? 0 : 2} prefix="$"
                 delay={writeMs(s.sendAmt || '0')} ms={780} />
        </span>

        <span className="ernspayl">Pay with</span>
        <div className="ernspay">
          <span className={'ernspick' + live(pick)} {...press(pick)}
                data-tap="payPicker" data-lit={s.lit === 'payPicker' ? '1' : undefined}>
            <Dot a={src.a} size={20} />
            <b>{src.name}</b>
            <ChevDown />
          </span>
          <span className="ernspbal"><i>Balance</i><b>{src.bal}</b></span>
          {/* drawn, live, and unused — the same call the vault sheet makes */}
          <span className="ernspmax">Use max</span>
        </div>
      </div>

      <span className="bcta off">{s.sendAmt ? 'Review send' : 'Enter amount'}</span>
    </Enter>
  );
}

/**
 * ONE ROW OF THE PICKER, AND IT IS DECLARED OUT HERE ON PURPOSE.
 *
 * It was a closure inside `PaySheet`, which reads well and is a bug: a
 * component built during a render is a NEW type every render, so React unmounts
 * and remounts the whole subtree each time and any state in it is thrown away.
 * These rows are stateless, so the damage would have been a remount a frame
 * rather than anything visible — which is exactly the kind of thing that stays
 * in until something else grows state and starts flickering for no reason.
 */
function PayRow({ d, id, a, name, sub, right, sub2 }: {
  d: Deck; id: string; a: { sym: string; color: string; ink: string };
  name: string; sub: string; right: string; sub2: string;
}) {
  const on = d.can('payPick', id);
  return (
    <span className={'ernprow' + live(on)} {...press(on)} data-tap={'payPick:' + id}
          data-lit={d.s.lit === 'payPick:' + id ? '1' : undefined}>
      <Dot a={a} size={34} />
      <span className="ernprowl"><b>{name}</b><i>{sub}</i></span>
      <span className="ernprowr"><b>{right}</b><i>{sub2}</i></span>
    </span>
  );
}

/**
 * THE PAY-WITH PICKER, AND THE ONE LINE THIS CHAPTER IS FOR.
 *
 * `Your vaults` is a section of a token picker, ABOVE the wallet, with the
 * Gauntlet position in it carrying a dollar figure and a USDC equivalent. That
 * is the whole of "spend directly from a yield-earning deposit — no unwinding,
 * no moving funds out": the app does not offer to withdraw first, it offers
 * the position as a thing you can pay with, in the most ordinary place it
 * could possibly be.
 */
function PaySheet({ d }: { d: Deck }) {
  const { s } = d;
  const vaultBal = balanceOf(s, vaultOf('gauntlet'));

  return (
    <Layer open={s.payPicker} onScrim={d.can('payPicker')}>
      <div className="dsheet ernpsheet">
        <span className="dgrab" />
        <b className="ernph">Select token</b>

        <span className="ernpsec">Your vaults</span>
        <PayRow d={d} id="gauntlet" a={USDC} name={PAY_VAULT.name} sub={PAY_VAULT.sub}
                right={usd(vaultBal)} sub2={`~${fmt(vaultBal, 2)} USDC`} />

        <span className="ernpsec">Your tokens</span>
        {HOLDINGS.map((h) => (
          <PayRow key={h.id} d={d} id={h.id} a={{ sym: h.sym, color: h.color, ink: h.ink }}
                  name={h.sym} sub={h.name}
                  right={usd(h.qty * (PRICE[h.sym] ?? 0))} sub2={fmt(h.qty, h.dp)} />
        ))}
      </div>
    </Layer>
  );
}

/** lucide `chevron-down` (ISC). The file's other `Chev` points RIGHT and marks
    a row that goes somewhere; these three mark a field that opens a picker. */
function ChevDown() {
  return (
    <svg className="ernschev" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ---- the vault's sheet ------------------------------------------------- */

function VaultSheet({ d }: { d: Deck }) {
  const { s } = d;
  const v: Vault | null = s.open ? vaultOf(s.open) : null;
  const c = cta(s);

  return (
    <Layer open={!!s.open} onScrim={d.can('closeVault')}>
      <div className="dsheet ernsheet">
        <span className="dgrab" />
        {v ? (
          <>
            <Dot a={USDC} size={30} />
            <b className="ernsh">{v.name}</b>
            <p className="erndesc">{v.desc}</p>

            <div className="ernstat">
              <span><i>APY</i><b>{v.apy}</b></span>
              <span><i>TVL</i><b>{v.tvlFull}</b></span>
            </div>

            <dl className="ernfees">
              {v.fees.map(([k, val, promo]) => (
                <div key={k}>
                  <dt>{k}{promo ? <i className="ernpromo">Promo</i> : null}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>

            {s.submitting ? (
              <div className="ernsettle">
                {/* FIVE DECIMALS, ROUNDED. The frame reads `Depositing 22.55523
                    USDC` for a figure of 22.555228 — the same five the other
                    recording's `41.72349` gives for 41.723488. The field above
                    carries all six; the sentence about it does not. */}
                <b className="ernsettleh">Depositing {Number(s.amount).toFixed(5)} USDC</b>
                <ProgressList steps={STEPS} at={s.step} />
                <span className="ernref"><i>Reference ID</i><b>{REFERENCE}</b></span>
                {/* THE SHEET WAITS. Three ticks and a reference id, and then a
                    button — the recording sits here until something presses it.
                    A settlement that dismisses itself is the app deciding you
                    have finished reading the receipt. */}
                {s.settled ? (
                  <span className={'bcta' + live(d.can('close'))} {...press(d.can('close'))}
                        data-tap="close" data-lit={s.lit === 'close' ? '1' : undefined}>
                    Close
                  </span>
                ) : null}
              </div>
            ) : (
              <>
                <div className="ernside">
                  {(['deposit', 'withdraw'] as const).map((k) => {
                    const on = d.can('side', k);
                    return (
                      <span className={'ernsg' + (s.side === k ? ' on' : '') + live(on)} key={k}
                            {...press(on)}>{k === 'deposit' ? 'Deposit' : 'Withdraw'}</span>
                    );
                  })}
                </div>

                {/* THE FIELD PRINTS WHAT IS IN IT, TO SIX DECIMALS AND WITH NO
                    SEPARATOR — `22.555228`, which is the whole lot Use max put
                    there. It used to round to a whole USDC, which on a deposit
                    of twenty-two dollars threw away most of the figure. */}
                {/* THE FIELD AND ITS DOLLARS TRAVEL TOGETHER, at the 780ms
                    `/demo/perps-v5` gives a derived estimate. `Use max` puts
                    six decimals in a field that was empty; snapping there is
                    the screen being replaced rather than answering. */}
                <div className="ernamt">
                  <span className="ernamtv"
                        style={{ '--len': (s.amount || '0').length } as React.CSSProperties}>
                    {/* WRITTEN, NOT COUNTED — the same field the swap screen
                        has, and for the same reason: easing 0 to `22.555228`
                        scrambles nine glyphs at once, and `Use max` did not
                        compute this figure, it PUT it there. No caret either;
                        there is no keyboard on this phone. */}
                    <b><Typed text={s.amount || '0'} /></b>
                    <em>USDC</em>
                  </span>
                  {/* the dollars are what the field is worth, so they wait for
                      the field to finish being written — same rule the swap
                      screen's destination follows */}
                  <span className="ernamtu">
                    <Count value={Number(s.amount) || 0} dp={2} prefix="$"
                           delay={writeMs(s.amount || '0')} ms={780} />
                  </span>
                </div>

                <div className="ernavail">
                  <Dot a={USDC} size={22} />
                  {/* TRUNCATED, NOT ROUNDED — the frame reads `22.55 USDC` for
                      a balance of 22.555228, and `Use max` then puts all six
                      decimals in the field. Rounding prints 22.56, which is an
                      availability the wallet does not have. */}
                  <span className="ernrowt">
                    <em>Available</em>
                    {/* TRUNCATED, NOT ROUNDED, AND GROUPED. The frame reads
                        `22.55 USDC` for a balance of 22.555228 — rounding would
                        print 22.56, an availability the wallet does not have.
                        Grouped and trimmed because this one is five digits:
                        `18,400` is a balance and `18400.00` is a serial. */}
                    <b>
                      <Count value={available(s)} dp={2} trim trunc suffix=" USDC" ms={960} />
                    </b>
                  </span>
                  <span className={'ernmax' + live(d.can('max'))} {...press(d.can('max'))}
                        data-tap="max" data-lit={s.lit === 'max' ? '1' : undefined}>Use max</span>
                </div>

                <span className={'bcta' + (c.ok ? '' : ' off') + live(d.can('confirm'))}
                      {...press(d.can('confirm'))} data-tap="deposit"
                      data-lit={s.lit === 'deposit' ? '1' : undefined}>{c.label}</span>
              </>
            )}
          </>
        ) : null}
      </div>
    </Layer>
  );
}
