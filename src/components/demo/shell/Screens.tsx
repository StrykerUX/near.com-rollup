'use client';
import type { ReactNode } from 'react';
import { Ticker } from '@/components/stage/phone/ui/Ticker';
import { live, press } from '@/components/stage/phone/ui/tap';
import { fmt } from '@/lib/format';
import { Layer } from './Frame';

/**
 * THE TWO SCREENS EVERY RECORDING HAS
 * ==================================================================
 * Four of the five demos open on the account card and every one of them signs
 * with the same passkey sheet. They are here rather than copied five times,
 * because the moment they differ by accident is the moment the demos stop
 * describing one app.
 */

export const usd = (v: number, dp = 2) => '$' + fmt(v, dp);

export type BalanceRow = {
  label: string;
  value: number;
  /** the line under the figure: token chips, a yield, a P&L */
  sub: ReactNode;
  on?: (() => void) | null;
};

export function AccountScreen({ rows, explore, onReceive, onSend }: {
  rows: BalanceRow[];
  /** the cards under the balances; absent on the screens that do not scroll */
  explore?: boolean;
  /**
   * The two buttons were inert spans, which was fine while no flow started
   * from them. `/demo/earn` opens Universal Send from this card and
   * `/demo/confidential-deposit` opens Receive from it, and a script that
   * fires a transition no control on screen can fire is a script the reader
   * cannot follow — the hand would have nowhere to point.
   */
  onReceive?: (() => void) | null;
  onSend?: (() => void) | null;
}) {
  const total = rows.reduce((t, r) => t + r.value, 0);
  return (
    <div className="dacc">
      <div className="dhead">
        <span className="davatar" aria-hidden="true" />
        <b>Account</b>
        <span className="dhicons" aria-hidden="true"><i /><i /><i /></span>
      </div>

      <span className="dlabel">Total balance <i className="deye" aria-hidden="true" /></span>
      {/* the headline is the sum of the rows under it, always */}
      <Ticker className="dtotal" base={total} amp={1.4} dp={2} prefix="$" every={2600} />

      <div className="dpair">
        <span className={'dbtn' + live(onReceive)} {...press(onReceive)} data-tap="receive">
          ↓ Receive
        </span>
        <span className={'dbtn' + live(onSend)} {...press(onSend)} data-tap="send">
          ➤ Send
        </span>
      </div>

      <div className="dcard">
        <span className="dcardh">Balances</span>
        {rows.map((r) => (
          <div className={'drow' + live(r.on)} key={r.label} {...press(r.on)}
           data-tap={'row:' + r.label.toLowerCase()}>
            <span className="drowl">
              <em>{r.label}</em>
              <b>{usd(r.value)}</b>
              <span className="dpills">{r.sub}</span>
            </span>
            <span className="dchev">›</span>
          </div>
        ))}
      </div>

      {explore ? (
        <div className="dexp">
          <span className="dexph">Explore</span>
          <div className="dexpr">
            <span className="dexpc">
              <i aria-hidden="true" />
              <b>Track your NEAR@3.33 rewards</b>
              <em>You&rsquo;re ranked #131, in top 4% of users.</em>
            </span>
            <span className="dexpc">
              <i aria-hidden="true" />
              <b>Confidential Send</b>
              <em>Send to any wallet, privately.</em>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * UNIVERSAL SEND
 * ------------------------------------------------------------------
 * Two of the five recordings open this screen — the Earn one, to pay out of a
 * vault, and the confidential one, to send a shielded asset. It is the same
 * screen both times, so it is one component: the rows, the amount, and slots
 * for whatever each flow puts under them.
 */
export function UniversalSendScreen({
  onBack, token, network, mark, onToken, amount, usd: usdLine, pay, warn, cta,
  onAmount, children,
}: {
  onBack: (() => void) | null;
  token: string;
  network: string;
  /** the token's chip, which the flow owns because it owns the token table */
  mark: ReactNode;
  onToken: (() => void) | null;
  amount: string;
  usd: string;
  /** the Pay with row: a wallet token in one flow, a vault balance in the other */
  pay: ReactNode;
  /** the notice, when the chosen route has one */
  warn?: ReactNode;
  cta: string;
  /** tapping the figure raises the pad; null on a screen that opens with it up */
  onAmount?: (() => void) | null;
  /** the keypad, when a field has it */
  children?: ReactNode;
}) {
  return (
    <div className="dsend2">
      <div className="dmhead">
        <span className={'dback' + live(onBack)} {...press(onBack)} aria-label="Back">‹</span>
      </div>
      <b className="dftitle">Universal Send</b>
      <em className="dfsub">Send any token to any network, pay with any asset you own.</em>

      <SendRow mark={mark} label="Token" value={token} on={onToken} tap="row:token" />
      <SendRow mark={mark} label="Network" value={network} on={null} />
      <SendRow mark={<span className="dbagm" />} label="Recipient" value="Select recipient" muted on={null} />

      <div className="damt big">
        <b className={(amount ? '' : 'off') + live(onAmount)} {...press(onAmount)} data-tap="amount">
          {amount || '0'} <i>{token}</i>
        </b>
        <em>{usdLine}</em>
        <span className="dpaylab">Pay with</span>
        {pay}
      </div>

      {warn}

      <span className="dcta off">{cta}</span>
      {children}
    </div>
  );
}

export function SendRow({ mark, label, value, muted, on, tap }: {
  mark: ReactNode; label: string; value: string;
  muted?: boolean; on: (() => void) | null;
  /** the id a demo's hand aims at, when this row is one the script presses */
  tap?: string;
}) {
  return (
    <div className={'dfrow' + (muted ? ' muted' : '') + live(on)} {...press(on)} data-tap={tap}>
      <span className="dfmark">{mark}</span>
      <span className="dftext"><em>{label}</em><b>{value}</b></span>
      <span className="dchev2">⌄</span>
    </div>
  );
}

/**
 * The passkey. Three states and no password field, which is the entire point:
 * every one of these recordings signs the same way, and none of them types a
 * secret into the app.
 */
export function PasskeySheet({ open, auth, onUse }: {
  open: boolean;
  auth: 'ask' | 'signing' | 'done';
  onUse: (() => void) | null;
}) {
  return (
    <Layer open={open} onScrim={null}>
      <div className="dsheet pass">
        <span className="dx">×</span>
        <span className="dface" aria-hidden="true" />
        <b className="dsh">Sign In</b>
        <em className="dpsub">
          Sign in to &ldquo;near.com&rdquo; with your passkey for<br />
          &ldquo;Long for a living&rdquo; saved in &ldquo;Passwords&rdquo;?
        </em>
        {auth === 'ask' ? (
          <>
            <span className={'dcta blue' + live(onUse)} {...press(onUse)} data-tap="passkey">
              Use Passkey
            </span>
            <span className="dghost">More Options</span>
          </>
        ) : (
          <div className="dauth">
            {auth === 'signing'
              ? <><span className="dspin big" /><em>Signing in</em></>
              : <><span className="ddone">✓</span><em>Done</em></>}
          </div>
        )}
      </div>
    </Layer>
  );
}
