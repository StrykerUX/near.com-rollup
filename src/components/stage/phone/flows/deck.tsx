'use client';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * WHICH PERPS SCREEN THE TOUR OPENS ON
 * ==================================================================
 * Two answers, and they are two different arguments about the same product.
 *
 *   card  the screen this page has always shown: perps drawn as a card in the
 *         site's own language, on the site's own glass, sized to a plate that
 *         has to hold three other screens after it.
 *   app   `/demo/perps-v5`'s screen — the pixel copy, in Figtree, on the app's
 *         own palette — brought into that plate to see how it reads there.
 *
 * It is a context rather than a prop for the same reason `mode` is: the choice
 * is made at the page and consumed four levels down, and threading it through
 * Site → Stage → Lockup → PhoneShell would put a parameter on three components
 * that have no opinion about it.
 *
 * NOTHING ELSE ON THE PAGE CHANGES. Both variants run the same stage engine,
 * the same schedule, the same three other faces and the same light zone — that
 * is the whole point of `/home-v2` existing as a route rather than as a branch
 * inside the perps face: the comparison is only worth something if it is the
 * same page either side of it.
 */
export type Deck = 'card' | 'app';

const DeckCtx = createContext<Deck>('card');

export function DeckProvider({ deck, children }: { deck: Deck; children: ReactNode }) {
  return <DeckCtx.Provider value={deck}>{children}</DeckCtx.Provider>;
}

export const useDeckVariant = () => useContext(DeckCtx);
