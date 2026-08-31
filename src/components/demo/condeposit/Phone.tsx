'use client';
import { useMemo } from 'react';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { Hand } from '@/components/demo/shell/Hand';
import { Layer, StatusBar, Tabs } from '@/components/demo/shell/Frame';
import { AccountScreen } from '@/components/demo/shell/Screens';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  ACK, ADDRESS, CRYPTO_BAL, EARN_BAL, PERPS_BAL, RULES, TOKENS, VALID_DAYS,
  minimum, supported, unsupported,
  type CD, type CDAction,
} from './state';

type Deck = GenericDeck<CD, CDAction>;

const LOCAL: Record<string, { sym: string; color: string; ink: string }> = {
  USDC: { sym: '$', color: '#2775CA', ink: '#fff' },
  USDT: { sym: 'T', color: '#26A17B', ink: '#fff' },
  ZEC: { sym: 'Z', color: '#F4B728', ink: '#000' },
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

const STAGES = ['Important', 'Configure', 'Deposit'] as const;

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    /* `data-motion` rides with the hand because the two are one decision. This
       page is showing a person using the app, so the things that person makes
       appear — the picker they just opened, the code they just asked for —
       have to arrive rather than already be there. */
    <div className="pdev" data-screen={s.screen} data-motion="rich">
      <StatusBar time="12:10" />
      {/* keyed so a screen change remounts its blocks and they re-lay
          rather than being swapped between two frames */}
      <div className="pdview" key={s.screen + s.stage}>
        {s.screen === 'account' ? <Account d={d} /> : <Receive d={d} />}
      </div>
      <Tabs on="Home" />
      <TokenPicker d={d} />
      <NetworkPicker d={d} />

      {/* Last, so it is over both pickers — a finger is.
          It stays put when the clock is paused: someone who stops the script on
          the Important screen is asking what happens next, and the hand resting
          on the box that unlocks Continue answers that. It leaves only when a
          READER takes over, because then their own cursor is the pointer and
          two of them is one too many. */}
      <Hand hand={d.hand} on={!d.held} />
    </div>
  );
}

function Account({ d }: { d: Deck }) {
  return (
    <AccountScreen
      explore
      /* Receive is a button on this card, not a token row. It was wired to the
         Crypto row because the shared screen's buttons were inert spans; they
         take handlers now, so a flow whose whole subject is a deposit ADDRESS
         starts from the control that says Receive. */
      onReceive={d.can('toReceive')}
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
        { label: 'Earn', value: EARN_BAL, sub: <><i className="dgain">▲ 5.1%</i><i>blended APY</i></> },
      ]}
    />
  );
}

/* ---- the receive flow -------------------------------------------------- */

function Receive({ d }: { d: Deck }) {
  const { s } = d;
  const at = STAGES.indexOf(s.stage === 'important' ? 'Important' : s.stage === 'configure' ? 'Configure' : 'Deposit');

  return (
    <div className="drecv">
      <div className="dmhead">
        <span className={'dback' + live(d.can(s.stage === 'important' ? 'home' : 'back'))}
              {...press(d.can(s.stage === 'important' ? 'home' : 'back'))} aria-label="Back">‹</span>
      </div>
      <b className="dftitle">Receive</b>
      <b className="dsub2">One-time confidential deposit <i className="dalpha">Alpha</i></b>
      <em className="dfsub">
        In response to demand from advanced users, we&rsquo;re releasing an early version of
        confidential deposits that comes with some constraints.
      </em>

      {/* three dots and two rails: the stage you are on, and the ones you had
          to pass to get here */}
      <ol className="dstages">
        {STAGES.map((name, i) => (
          <li key={name} data-state={i < at ? 'done' : i === at ? 'on' : 'off'}>
            <i /><span>{name}</span>
          </li>
        ))}
      </ol>

      {s.stage === 'important' ? <Important d={d} /> : null}
      {s.stage === 'configure' ? <Configure d={d} /> : null}
      {s.stage === 'deposit' ? <Deposit d={d} /> : null}
    </div>
  );
}

function Important({ d }: { d: Deck }) {
  const { s } = d;
  const ack = d.can('ack');
  const go = d.can('continue');
  return (
    <div className="dcard flat">
      <span className="dcardh">Before you continue</span>
      <ul className="drules">
        {RULES.map((r) => (
          /* the text is wrapped: `.drules li` is a two-column grid, and bare
             text runs beside an element become grid items of their own */
          <li key={r.text} data-tone={r.tone}><i /><span>{r.text}</span></li>
        ))}
      </ul>
      <span className={'dchk' + (s.ack ? ' on' : '') + live(ack)} {...press(ack)} data-tap="ack">
        <i className="dbox" />{ACK}
      </span>
      <span className={'dcta' + (go ? ' light' : ' off') + live(go)} {...press(go)}
            data-tap="continue">Continue</span>
    </div>
  );
}

function Configure({ d }: { d: Deck }) {
  const { s } = d;
  const go = d.can('continue');
  return (
    <>
      <Row mark={<TokenDot token={dot(s.token)} size={22} />} label="Token" value={s.token}
           on={d.can('tokenPicker')} tap="token" />
      <Row mark={<span className={'dnetm' + (s.network ? ' set' : '')} />} label="Network"
           value={s.network ?? 'Select network'} muted={!s.network} on={d.can('netPicker')}
           tap="network" />
      <span className={'dcta' + (go ? ' light' : ' off') + live(go)} {...press(go)}
            data-tap="continue">Continue</span>
    </>
  );
}

function Deposit({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <>
      <div className="dqrwrap">
        <b className="dqrt">
          Send at least ${minimum(s)} of {s.token} <i className="dinfo">ⓘ</i>
          <em>on the {s.network} network</em>
        </b>
        <div className="dqr">{s.issued ? <Qr seed={ADDRESS + s.token + s.network} /> : <span className="dspin" />}</div>
        {s.issued ? (
          <div className="daddr">
            <span>Deposit address</span>
            <b>{ADDRESS} <i>⧉</i></b>
          </div>
        ) : null}
      </div>

      <ul className="drules deposit">
        <li data-tone="no">
          <i />
          <span>
            Only send <u>{s.token}</u> on the {s.network} network. Sending other assets or using
            a different network will result in loss of funds.
          </span>
        </li>
        <li data-tone="no"><i /><span>Do not send a test deposit first</span></li>
        <li data-tone="no"><i /><span>Do not reuse, save, whitelist, or share the address</span></li>
        <li data-tone="ok"><i /><span>This address is valid for {VALID_DAYS} days</span></li>
      </ul>
      <em className="dfsub small">
        Need different deposit details?{' '}
        <span className={'dlink' + live(d.can('again'))} {...press(d.can('again'))}
              data-tap="again">Create a new address.</span>
        {' '}Creating another address will not deactivate this one.
      </em>
    </>
  );
}

function Row({ mark, label, value, muted, on, tap }: {
  mark: React.ReactNode; label: string; value: string;
  muted?: boolean; on: (() => void) | null;
  /** what the hand calls this row when it comes to press it */
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

/* ---- the pickers ------------------------------------------------------- */

function TokenPicker({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <Layer open={s.over === 'token'} onScrim={d.can('tokenPicker')}>
      <div className="dsheet picker">
        <span className="dgrab" />
        <b className="dsh">Select token</b>
        <span className="dsearch"><i>⌕</i><em>Search tokens</em></span>
        <span className="dgroup">All tokens</span>
        {TOKENS.map((t) => {
          const on = d.can('pickToken', t);
          return (
            <div className={'dli' + live(on)} key={t} {...press(on)} data-tap={'tok:' + t}>
              <TokenDot token={dot(t)} size={26} />
              <span className="dlit"><b>{t}</b><em>{dot(t).name}</em></span>
              {s.token === t ? <i className="dtick">✓</i> : null}
            </div>
          );
        })}
      </div>
    </Layer>
  );
}

function NetworkPicker({ d }: { d: Deck }) {
  const { s } = d;
  const q = s.query.trim().toLowerCase();
  const hit = (n: string) => !q || n.toLowerCase().startsWith(q);
  const ok = supported(s).filter(hit);
  const no = unsupported(s).filter(hit);

  return (
    <Layer open={s.over === 'network'} onScrim={d.can('netPicker')}>
      <div className="dsheet picker">
        <div className="drevh"><b>Select network</b><span className="dx">×</span></div>
        <span className="dsearch">
          <i>⌕</i>
          <b>{s.query || <em>Search networks</em>}</b>
          {s.query ? <span className="dcaret" /> : null}
        </span>

        {/* the first option is not a chain: receiving inside the app skips the
            entire problem, and the picker leads with that */}
        {!q ? (
          <div className="dli internal">
            <span className="dnetm near" />
            <span className="dlit">
              <b>From another near.com user</b>
              <em>For receiving inside the app</em>
            </span>
            <i className="dintern">● Internal</i>
          </div>
        ) : null}

        {ok.length ? <span className="dgroup">Available networks</span> : null}
        {ok.map((n) => {
          const on = d.can('pickNet', n);
          return (
            <div className={'dli' + live(on)} key={n} {...press(on)} data-tap={'net:' + n}>
              <span className="dnetm set" />
              <span className="dlit"><b>{n}</b></span>
              {s.network === n ? <i className="dtick">✓</i> : null}
            </div>
          );
        })}

        {/* named, not hidden. A network you cannot find and a network that will
            eat your deposit look identical if the list simply omits it.
            No `data-tap` on any of them: they refuse to be pressed, and a hand
            that could travel here would be aiming at a control that is not
            one — which is the one thing a pointer must never do. */}
        {no.length ? <span className="dgroup">Unsupported networks <i>ⓘ</i></span> : null}
        {no.map((n) => (
          <div className="dli off" key={n}>
            <span className="dnetm" />
            <span className="dlit"><b>{n}</b></span>
          </div>
        ))}
      </div>
    </Layer>
  );
}

/**
 * A QR-shaped code. It is not a real QR — there is no address behind these
 * screens to encode — so it is a deterministic pattern with the three finder
 * squares a reader's eye actually checks for. Drawing a scannable code that
 * pointed at nothing would be worse than drawing a picture of one.
 */
function Qr({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    const N = 25;
    /* Each cell is a PURE function of the seed and its own coordinates: no
       running state, so the pattern does not depend on the order the loop
       happens to visit in — and nothing is reassigned across a render. */
    const bit = (x: number, y: number) => {
      let h = 2166136261;
      const key = `${seed}:${x}:${y}`;
      for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return ((h >>> 0) % 1000) / 1000 > 0.52;
    };
    const finder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);

    const out: [number, number][] = [];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (finder(x, y)) {
          const fx = x > N - 8 ? x - (N - 7) : x;
          const fy = y > N - 8 ? y - (N - 7) : y;
          const r = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
          if (r !== 1 && r <= 3) out.push([x, y]);
        } else if (bit(x, y)) {
          out.push([x, y]);
        }
      }
    }
    return out;
  }, [seed]);

  return (
    <svg className="dqrsvg" viewBox="0 0 25 25" aria-label="Deposit address QR code" role="img">
      <rect width="25" height="25" fill="#fff" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />)}
    </svg>
  );
}
