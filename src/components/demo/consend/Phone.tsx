'use client';
import { Keypad } from '@/components/stage/phone/ui/Keypad';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Hand } from '@/components/demo/shell/Hand';
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
    /* `data-motion` rides with the hand because the two are one decision. This
       page is showing a person using the app, so the things that person makes
       appear — the keypad, the token list, the notice that belongs to one
       route — have to arrive rather than already be there. */
    <div className="pdev" data-screen={s.screen} data-motion="rich">
      <StatusBar time="12:12" />
      {/* keyed so a screen change remounts its blocks and they re-lay
          rather than being swapped between two frames */}
      <div className="pdview" key={s.screen}>
        {s.screen === 'account' ? <Account d={d} /> : <Send d={d} />}
      </div>
      <Tabs on="Home" />
      <TokenPicker d={d} />

      {/* Last, so it is over the picker — a finger is.
          It stays put when the clock is paused: someone who stops the script to
          look at the notice is asking what happens next, and the hand resting
          on the box that clears it answers that. It leaves only when a READER
          takes over, because then their own cursor is the pointer and two of
          them is one too many. */}
      <Hand hand={d.hand} on={!d.held} />
    </div>
  );
}

function Account({ d }: { d: Deck }) {
  return (
    <AccountScreen
      explore
      /* Send is a button on this card, not a token row. It was wired to the
         Crypto row because the shared screen's buttons were inert spans; they
         take handlers now, so the transition is fired by the control that
         actually means it. */
      onSend={d.can('toSend')}
      rows={[
        {
          label: 'Crypto',
          value: CRYPTO_BAL,
          sub: <>
            <TokenDot token={dot('NEAR')} size={18} /><TokenDot token={dot('USDC')} size={18} />
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
          <TokenDot token={dot('NEAR')} size={18} />
          <span className="dpaysel">NEAR ⌄</span>
          <span className="dpaybal">Balance<i>{fmt(NEAR_QTY, 4)}</i></span>
          <span className="dmax">Use max</span>
        </div>
      }
      warn={needsAck(s) ? (
        <div className="dwarn">
          <span>⚠ Some exchanges may not credit this transfer.</span>
          <span className={'dchk' + (s.ack ? ' on' : '') + live(ack)} {...press(ack)}
                data-tap="ack">
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

        {/* the balance row: it is a reading, not a control, so it carries no
            `data-tap` — the hand must never be able to aim at it */}
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
            <div className={'dli' + live(on)} key={t.sym} {...press(on)}
                 data-tap={'tok:' + t.sym}>
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
