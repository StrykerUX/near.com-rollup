'use client';
import { Keypad } from '@/components/stage/phone/ui/Keypad';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Layer, StatusBar, Tabs } from '@/components/demo/shell/Frame';
import { AccountScreen, UniversalSendScreen, usd } from '@/components/demo/shell/Screens';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  CRYPTO_BAL, EARN_BAL, NEAR_QTY, NEAR_USD, PERPS_BAL, TOKENS,
  needsAck, usdOf, type CS, type CSAction,
} from './state';

type Deck = GenericDeck<CS, CSAction>;

const LOCAL: Record<string, { sym: string; color: string; ink: string }> = {
  USDC: { sym: '$', color: '#2775CA', ink: '#fff' },
  USDT: { sym: 'T', color: '#26A17B', ink: '#fff' },
  BTCL: { sym: 'B', color: '#F7931A', ink: '#fff' },
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
      <StatusBar time="12:12" />
      <div className="pdview">
        {s.screen === 'account' ? <Account d={d} /> : <Send d={d} />}
      </div>
      <Tabs on="Home" />
      <TokenPicker d={d} />
    </div>
  );
}

function Account({ d }: { d: Deck }) {
  return (
    <AccountScreen
      explore
      rows={[
        {
          label: 'Crypto',
          value: CRYPTO_BAL,
          on: d.can('toSend'),
          sub: <>
            <TokenDot token={dot('NEAR')} size={13} /><TokenDot token={dot('USDC')} size={13} />
            <i>NEAR, USDC</i>
          </>,
        },
        { label: 'Perps', value: PERPS_BAL, sub: <i>Trade with up to <b>50x</b> leverage</i> },
        { label: 'Earn', value: EARN_BAL, sub: <><i className="dgain">▲ 5.1%</i><i>blended APY</i></> },
      ]}
    />
  );
}

function Send({ d }: { d: Deck }) {
  const { s } = d;
  const ack = d.can('ack');
  return (
    <UniversalSendScreen
      onBack={d.can('home')}
      token={s.token}
      network={s.network}
      mark={<TokenDot token={dot(s.token)} size={22} />}
      onToken={d.can('picker')}
      amount={s.amount}
      usd={usd(usdOf(s), 0)}
      cta={Number(s.amount) > 0 ? 'Review send' : 'Enter amount'}
      pay={
        <div className="davailrow">
          <TokenDot token={dot('NEAR')} size={17} />
          <span className="dpaysel">NEAR ⌄</span>
          <span className="dpaybal">Balance<i>{fmt(NEAR_QTY, 4)}</i></span>
          <span className="dmax">Use max</span>
        </div>
      }
      warn={needsAck(s) ? (
        <div className="dwarn">
          <span>⚠ Some exchanges may not credit this transfer.</span>
          <span className={'dchk' + (s.ack ? ' on' : '') + live(ack)} {...press(ack)}>
            <i className="dbox" />I understand.
          </span>
        </div>
      ) : null}
    >
      {s.focus === 'amount'
        ? <Keypad pressed={s.pressed} onKey={(k) => d.can('key', k)} onDone={d.can('done')} />
        : null}
    </UniversalSendScreen>
  );
}

function TokenPicker({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Layer open={s.over === 'token'} onScrim={d.can('picker')}>
      <div className="dsheet picker">
        <span className="dgrab" />
        <b className="dsh">Select token</b>
        <span className="dsearch"><i>⌕</i><em>Search tokens</em></span>

        <span className="dgroup">Your tokens</span>
        <div className="dli">
          <TokenDot token={dot('NEAR')} size={26} />
          <span className="dlit"><b>NEAR</b><em>Near</em></span>
          <span className="dliv"><b>{usd(NEAR_USD)}</b><i>{fmt(NEAR_QTY, 4)}</i></span>
        </div>

        {/* the point of the whole page: ZEC is in this list, between Tether and
            Solana, and not behind a mode of its own */}
        <span className="dgroup">More tokens</span>
        {TOKENS.map((t) => {
          const on = d.can('pick', t.sym);
          return (
            <div className={'dli' + live(on)} key={t.sym} {...press(on)}>
              <TokenDot token={dot(t.sym)} size={26} />
              <span className="dlit"><b>{t.sym === 'BTCL' ? 'BTC' : t.sym}</b><em>{t.name}</em></span>
              {s.token === t.sym ? <i className="dtick">✓</i> : null}
            </div>
          );
        })}
      </div>
    </Layer>
  );
}
