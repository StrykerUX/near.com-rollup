'use client';
import { Keypad } from '@/components/stage/phone/ui/Keypad';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Layer, StatusBar, Tabs } from '@/components/demo/shell/Frame';
import { AccountScreen, PasskeySheet, UniversalSendScreen, usd } from '@/components/demo/shell/Screens';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  CRYPTO_BAL, DEPOSIT_STEPS, NEAR_QTY, NEAR_USD, PERPS_BAL, REFERENCE,
  TOKENS, USDC_AVAIL, VAULTS,
  balanceOf, earnTotal, needsAck, payBalance, payLabel, sendUsd, vaultOf,
  type EA, type EAAction,
} from './state';

type Deck = GenericDeck<EA, EAAction>;

/**
 * EARN — the app
 * ==================================================================
 * Three screens: the account, the vault list, and Universal Send. The vault
 * sheet does the deposit; the send screen spends what the deposit earns.
 */

const LOCAL: Record<string, { sym: string; color: string; ink: string }> = {
  USDC: { sym: '$', color: '#2775CA', ink: '#fff' },
  USDT: { sym: 'T', color: '#26A17B', ink: '#fff' },
};

const dot = (sym: string) => {
  const base = (() => {
    try {
      return findToken(sym);
    } catch {
      return { sym, name: sym, price: 1, color: '#3A4046', ink: '#fff', chain: '', dp: 2 };
    }
  })();
  return { ...base, ...(LOCAL[sym] ?? {}) };
};

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev" data-screen={s.screen}>
      <StatusBar time="12:09" />
      {/* keyed so a screen change remounts its blocks and they re-lay
          rather than being swapped between two frames */}
      <div className="pdview" key={s.screen}>
        {s.screen === 'account' ? <Account d={d} /> : null}
        {s.screen === 'earn' ? <Earn d={d} /> : null}
        {s.screen === 'send' ? <Send d={d} /> : null}
      </div>
      <Tabs on={s.screen === 'account' ? 'Home' : s.screen === 'earn' ? 'Menu' : 'Home'} />

      <VaultSheet d={d} />
      <TokenPicker d={d} />
      <PayPicker d={d} />
      <PasskeySheet open={s.over === 'passkey'} auth={s.auth} onUse={d.can('step')} />
    </div>
  );
}

/* ---- the account ------------------------------------------------------ */

function Account({ d }: { d: Deck }) {
  return (
    <AccountScreen
      explore
      rows={[
        {
          label: 'Crypto',
          value: CRYPTO_BAL,
          sub: <>
            <TokenDot token={dot('NEAR')} size={13} /><TokenDot token={dot('USDC')} size={13} />
            <i>NEAR, USDC</i>
          </>,
        },
        { label: 'Perps', value: PERPS_BAL, sub: <i>Trade with up to <b>50x</b> leverage</i> },
        {
          label: 'Earn',
          value: earnTotal(d.s),
          on: d.can('toEarn'),
          sub: <><i className="dgain">▲ 5.1%</i><i>blended APY</i></>,
        },
      ]}
    />
  );
}

/* ---- the vault list --------------------------------------------------- */

function Earn({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="dearn">
      <div className="dmhead">
        <span className={'dback' + live(d.can('home'))} {...press(d.can('home'))} aria-label="Back">‹</span>
      </div>
      <b className="dftitle">Earn <i className="dbeta">Beta</i></b>
      <em className="dfsub">Put your idle assets to work.</em>

      <div className="dtabsr">
        {(['vaults', 'staking'] as const).map((k) => {
          const on = d.can('tab', k);
          return (
            <span className={'dlt' + (s.tab === k ? ' on' : '') + live(on)} key={k} {...press(on)}>
              {k === 'vaults' ? 'Vaults' : 'Staking'}
            </span>
          );
        })}
      </div>

      {s.tab === 'vaults' ? (
        <>
          <em className="dnote">
            Earn yield by depositing into professionally managed vaults. As a general guide, the
            APR is considered reflective of the strategy risk level.
          </em>
          <div className="dvhead"><span>Vault</span><span>Balance</span></div>
          {VAULTS.map((v) => {
            const on = d.can('openVault', v.id);
            return (
              <div className={'dli' + live(on)} key={v.id} {...press(on)}>
                <TokenDot token={dot('USDC')} size={26} />
                <span className="dlit">
                  <b>{v.name}{v.promo ? <i className="dpromo">Promo</i> : null}</b>
                  <em>TVL {v.tvl} · {v.apr}</em>
                </span>
                <span className="dliv"><b>{usd(balanceOf(s, v.id), 0)}</b></span>
                <span className="dchev">›</span>
              </div>
            );
          })}
        </>
      ) : (
        <div className="dempty">
          <b>Staking is not open yet</b>
          <em>Network staking will show up here.</em>
        </div>
      )}
    </div>
  );
}

function VaultSheet({ d }: { d: Deck }) {
  const { s } = d;
  if (!s.open) return <Layer open={false} onScrim={null}><div className="dsheet vault" /></Layer>;
  const v = vaultOf(s.open);
  const settling = s.step >= 0;
  const finished = s.deposited;
  const max = d.can('max');
  const go = d.can('deposit');

  return (
    <Layer open={s.over === 'vault'} onScrim={d.can('closeVault')}>
      <div className="dsheet vault">
        <span className="dgrab" />
        <span className="dvico"><TokenDot token={dot('USDC')} size={26} /></span>
        <b className="dsh big">{v.name}</b>
        <em className="dvdesc">{v.desc}</em>

        <dl className="dvstat">
          <div><dt>APY</dt><dd>{v.apr}</dd></div>
          <div><dt>TVL</dt><dd>{v.tvl}</dd></div>
        </dl>
        <dl className="dvfees">
          {/* The chip belongs to the vault, not to the row: it used to be
              hardcoded onto Performance fee, so opening a vault that charges a
              performance fee still advertised a promotion on it. */}
          {v.fees.map(([k, val]) => (
            <div key={k}>
              <dt>{k}{v.promo && k === 'Performance fee' ? <i className="dpromo">Promo</i> : null}</dt>
              <dd>{val}</dd>
            </div>
          ))}
        </dl>

        {settling ? (
          <>
            <b className="dsend sm">Depositing {fmt(Number(s.amount), 5)} USDC</b>
            <div className="dchecks left"><ProgressList steps={DEPOSIT_STEPS} at={s.step} /></div>
            <div className="dref"><span>Reference ID</span><b>{REFERENCE} ⧉</b></div>
            {finished
              ? <span className={'dcta light' + live(d.can('close'))} {...press(d.can('close'))}>Close</span>
              : null}
          </>
        ) : (
          <>
            <div className="dseg wide two">
              {(['Deposit', 'Withdraw'] as const).map((k) => {
                const on = d.can('side', k);
                return (
                  <span className={'dsg' + (s.side === k ? ' on' : '') + live(on)} key={k} {...press(on)}>
                    <em>{k}</em>
                  </span>
                );
              })}
            </div>
            <div className="damt tight">
              <b className={s.amount ? '' : 'off'}>
                {s.amount ? fmt(Number(s.amount), 6) : '0'} <i>USDC</i>
              </b>
              <em>{usd(Number(s.amount) || 0)}</em>
            </div>
            <div className="davailrow">
              <TokenDot token={dot('USDC')} size={17} />
              <span>Available<i>{fmt(USDC_AVAIL, 2)} USDC</i></span>
              <span className={'dmax' + live(max)} {...press(max)}>Use max</span>
            </div>
            <span className={'dcta' + (go ? ' light' : ' off') + live(go)} {...press(go)}>
              {Number(s.amount) > 0 ? s.side : 'Enter an amount'}
            </span>
          </>
        )}
      </div>
    </Layer>
  );
}

/* ---- Universal Send --------------------------------------------------- */

function Send({ d }: { d: Deck }) {
  const { s } = d;
  const pay = d.can('payPicker');
  const ack = d.can('ack');

  return (
    <UniversalSendScreen
      onBack={d.can('home')}
      token={s.token}
      network={s.network}
      mark={<TokenDot token={dot(s.token)} size={22} />}
      onToken={d.can('tokenPicker')}
      amount={s.samount}
      usd={usd(sendUsd(s), 0)}
      cta={Number(s.samount) > 0 ? 'Review send' : 'Enter amount'}
      pay={
        <div className="davailrow">
          <TokenDot token={dot(s.pay === 'NEAR' ? 'NEAR' : 'USDC')} size={17} />
          <span className={'dpaysel' + live(pay)} {...press(pay)}>{payLabel(s)} \u2304</span>
          <span className="dpaybal">Balance<i>
            {s.pay === 'NEAR' ? fmt(NEAR_QTY, 4) : `~${fmt(payBalance(s), 2)} USDC`}
          </i></span>
          <span className="dmax">Use max</span>
        </div>
      }
      warn={needsAck(s) ? (
        <div className="dwarn">
          <span>\u26a0 Some exchanges may not credit this transfer.</span>
          <span className={'dchk' + (s.ack ? ' on' : '') + live(ack)} {...press(ack)}>
            <i className="dbox" />I understand.
          </span>
        </div>
      ) : null}
    >
      {s.focus === 'send'
        ? <Keypad pressed={s.pressed} onKey={(k) => d.can('skey', k)} onDone={d.can('done')} />
        : null}
    </UniversalSendScreen>
  );
}

function TokenPicker({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Layer open={s.over === 'token'} onScrim={d.can('tokenPicker')}>
      <div className="dsheet picker">
        <span className="dgrab" />
        <b className="dsh">Select token</b>
        <span className="dsearch"><i>⌕</i><em>Search tokens</em></span>

        <span className="dgroup">Your tokens</span>
        <PickRow d={d} sym="NEAR" name="Near" right={usd(NEAR_USD)} note={fmt(NEAR_QTY, 4)} />

        <span className="dgroup">More tokens</span>
        {TOKENS.map((t) => <PickRow d={d} sym={t.sym} name={t.name} key={t.sym} />)}
      </div>
    </Layer>
  );
}

function PickRow({ d, sym, name, right, note }: {
  d: Deck; sym: string; name: string; right?: string; note?: string;
}) {
  const on = d.can('pickToken', sym);
  return (
    <div className={'dli' + live(on)} {...press(on)}>
      <TokenDot token={dot(sym)} size={26} />
      <span className="dlit"><b>{sym}</b><em>{name}</em></span>
      {right ? <span className="dliv"><b>{right}</b><i>{note}</i></span> : null}
    </div>
  );
}

/**
 * The picker that makes the whole page worth building: your vaults are listed
 * above your tokens, as things that can pay.
 */
function PayPicker({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Layer open={s.over === 'paywith'} onScrim={d.can('payPicker')}>
      <div className="dsheet picker">
        <span className="dgrab" />
        <b className="dsh">Select token</b>
        <span className="dsearch"><i>⌕</i><em>Search tokens</em></span>

        <span className="dgroup">Your vaults</span>
        {VAULTS.map((v) => {
          const on = d.can('pickPay', v.id);
          return (
            <div className={'dli' + live(on)} key={v.id} {...press(on)}>
              <TokenDot token={dot('USDC')} size={26} />
              <span className="dlit"><b>{v.name}</b><em>Yield vault</em></span>
              <span className="dliv">
                <b>{usd(balanceOf(s, v.id))}</b>
                <i>~{fmt(balanceOf(s, v.id), 2)} USDC</i>
              </span>
            </div>
          );
        })}

        <span className="dgroup">Your tokens</span>
        <div className={'dli' + live(d.can('pickPay', 'NEAR'))} {...press(d.can('pickPay', 'NEAR'))}>
          <TokenDot token={dot('NEAR')} size={26} />
          <span className="dlit"><b>NEAR</b><em>Near</em></span>
          <span className="dliv"><b>{usd(NEAR_USD)}</b><i>{fmt(NEAR_QTY, 4)}</i></span>
        </div>
      </div>
    </Layer>
  );
}
