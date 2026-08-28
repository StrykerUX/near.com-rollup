'use client';
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { findToken, type Token } from '@/lib/tokens';
import { setMenuCloser } from '@/stage/bus';

export type Side = 'from' | 'to';

type SwapState = {
  from: Token;
  to: Token;
  amt: number;
  /** the amount the other side receives, at the current pair's rate */
  out: number;
  openSide: Side | null;
  setAmt: (v: number) => void;
  toggleSide: (s: Side) => void;
  closeMenu: () => void;
  pick: (t: Token) => void;
  flip: () => void;
};

const Ctx = createContext<SwapState | null>(null);

/**
 * The swap screen's state lives above the phone shell rather than inside the
 * swap face, because the token picker does not: `.tokenmenu` is `inset:0` on
 * `.morph`, so it covers the header and the tab bar too. Nested inside the face
 * it would both stop short of them and inherit the per-frame opacity and
 * transform the stage engine writes onto that face.
 */
export function SwapProvider({ children }: { children: ReactNode }) {
  const [from, setFrom] = useState<Token>(() => findToken('NEAR'));
  const [to, setTo] = useState<Token>(() => findToken('ZEC'));
  const [amt, setAmt] = useState(400);
  const [openSide, setOpenSide] = useState<Side | null>(null);

  const closeMenu = useCallback(() => setOpenSide(null), []);
  /* the engine closes it when the frame it belongs to leaves the stage */
  useEffect(() => setMenuCloser(closeMenu), [closeMenu]);

  const value = useMemo<SwapState>(() => ({
    from,
    to,
    amt,
    out: (amt * from.price) / to.price,
    openSide,
    setAmt,
    toggleSide: (s) => setOpenSide((cur) => (cur === s ? null : s)),
    closeMenu,
    pick: (t) => {
      if (openSide === 'from') setFrom(t);
      else setTo(t);
      closeMenu();
    },
    flip: () => {
      setFrom(to);
      setTo(from);
    },
  }), [from, to, amt, openSide, closeMenu]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSwap() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSwap must be used inside <SwapProvider>');
  return v;
}
