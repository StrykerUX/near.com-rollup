'use client';
import { useEffect, useRef } from 'react';
import { TOKENS } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { TokenDot } from './TokenDot';
import { useSwap } from './swapState';

/**
 * The token picker. A full-shell overlay rather than a dropdown, matched to the
 * app: at this width a menu anchored to the picker button would cover the
 * amount it is about to change.
 */
export function TokenMenu() {
  const { from, to, openSide, closeMenu, pick } = useSwap();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openSide) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('click', onDoc);
    addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      removeEventListener('keydown', onKey);
    };
  }, [openSide, closeMenu]);

  const cur = openSide === 'from' ? from : to;
  const other = openSide === 'from' ? to : from;

  return (
    <div
      className={'tokenmenu' + (openSide ? ' open' : '')}
      id="tokenmenu"
      role="listbox"
      aria-label="Select token"
      ref={ref}
    >
      <div className="tmhead">
        <span id="tmTitle">{openSide === 'to' ? 'You receive' : 'You send'}</span>
        <button className="tmclose" id="tmClose" aria-label="Close" onClick={closeMenu}>×</button>
      </div>
      <div className="tmlist" id="tmList">
        {TOKENS.map((t) => (
          <button
            className="tmrow"
            role="option"
            key={t.sym}
            data-sym={t.sym}
            aria-selected={t === cur}
            disabled={t === other}
            onClick={() => pick(t)}
          >
            <TokenDot token={t} size={30} />
            <span>
              <span className="tsym">{t.sym}</span>
              <span className="tname">{t.name}</span>
            </span>
            <span className="tprice">${fmt(t.price, t.price < 10 ? 2 : 0)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
