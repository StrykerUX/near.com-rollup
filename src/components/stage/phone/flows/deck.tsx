'use client';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * WHICH PERPS SCREEN THE TOUR OPENS ON
 * ==================================================================
 * Two answers, and they are two different arguments about the same product.
 *
 *   app   `/demo/perps-v5`'s screen — the pixel copy, in Figtree, on the app's
 *         own palette — standing in the plate at its own size. THE DEFAULT,
 *         and therefore what `/`, `/guided` and `/live` all show.
 *   card  the screen this page showed first: perps drawn as a card in the
 *         site's own language, on the site's own glass, sized to a plate that
 *         has to hold three other screens after it. Now only `/home-v2`.
 *
 * THE DEFAULT USED TO BE `card` AND THE COMPARISON RAN THE OTHER WAY. The
 * variant was the real device and the shipped page was the drawing of it;
 * having looked at both, the real one is the page and the drawing is the route
 * you go to on purpose. The two names swapped and nothing else moved.
 *
 * It is a context rather than a prop for the same reason `mode` is: the choice
 * is made at the page and consumed four levels down, and threading it through
 * Site → Stage → Lockup → PhoneShell would put a parameter on three components
 * that have no opinion about it.
 *
 * NOTHING ELSE ON THE PAGE CHANGES. Both variants run the same stage engine,
 * the same schedule, the same three other faces and the same light zone — that
 * is the whole point of the other one existing as a route rather than as a
 * branch inside the perps face: the comparison is only worth something if it
 * is the same page either side of it.
 */
export type Deck = 'card' | 'app';

const DeckCtx = createContext<Deck>('app');

export function DeckProvider({ deck, children }: { deck: Deck; children: ReactNode }) {
  return <DeckCtx.Provider value={deck}>{children}</DeckCtx.Provider>;
}

export const useDeckVariant = () => useContext(DeckCtx);
