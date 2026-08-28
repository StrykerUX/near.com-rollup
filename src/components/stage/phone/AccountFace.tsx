'use client';
import { useEffect, useRef, useState } from 'react';
import { IconEye, IconReceive, IconSend } from './icons';

const BALANCES = [
  { name: 'Crypto & stocks', value: '$3,190.00' },
  { name: 'Perps', value: '$740.00' },
  { name: 'Earn', value: '$1,070.00' },
];
const TOTAL = '$5,000.00';
const MASK = '••••••';

/**
 * 1 · ACCOUNT — the app home screen.
 *
 * The eye masks every figure on the card at once. Real values live in this
 * module, never re-derived from the DOM, so unmasking cannot reformat them
 * differently from how they first rendered.
 */
export function AccountFace() {
  const [hidden, setHidden] = useState(false);
  /* Micro-crossfade: 140ms out, swap, ease back. The figures keep their box —
     tabular digits and bullets are near-identical width — so nothing shifts and
     there is nothing to animate but opacity.
     `armed` exists so the transition is only applied once the reader has asked
     for one. Mounting with it in place is harmless; removing it in the same
     commit that restores opacity is NOT, because the fade back in then has no
     transition to run on and the figures snap. */
  const [armed, setArmed] = useState(false);
  const [fading, setFading] = useState(false);
  const [action, setAction] = useState<'Receive' | 'Send'>('Send');
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setHidden((h) => !h);
      return;
    }
    setArmed(true);
    setFading(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setHidden((h) => !h);
      setFading(false);
    }, 150);
  };

  const fig = (v: string) => (hidden ? MASK : v);
  const figStyle = armed
    ? { opacity: fading ? 0 : 1, transition: 'opacity 140ms var(--ease-out)' }
    : undefined;

  return (
    <div className="face" data-face="0">
      <div className="totrow">
        <span className="klabel">Total balance</span>
        <button
          className="eye"
          type="button"
          aria-pressed={hidden}
          aria-label={hidden ? 'Show balances' : 'Hide balances'}
          onClick={toggle}
        >
          <IconEye />
        </button>
      </div>
      <div className="kbig" data-fig style={figStyle}>{fig(TOTAL)}</div>

      <div className="seg" role="group" aria-label="Account actions">
        <button
          data-act="Receive"
          aria-pressed={action === 'Receive'}
          onClick={() => setAction('Receive')}
        >
          <IconReceive />Receive
        </button>
        <button
          data-act="Send"
          aria-pressed={action === 'Send'}
          onClick={() => setAction('Send')}
        >
          <IconSend />Send
        </button>
      </div>

      <div className="balgrp">
        <span className="klabel">Balances</span>
        <div className="ballist">
          {BALANCES.map((b) => (
            <button className="balrow" type="button" key={b.name}>
              <span className="brt">
                <span className="bn">{b.name}</span>
                <span className="bar" aria-hidden="true">&rarr;</span>
              </span>
              <span className="bv" data-fig style={figStyle}>{fig(b.value)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
