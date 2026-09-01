import { Nav } from '@/components/Nav';
import { Stage } from '@/components/stage/Stage';
import { QuoteBand } from '@/components/stage/QuoteBand';
import { LightZone } from '@/components/light/LightZone';
import { ModeProvider, type Mode } from '@/components/stage/phone/flows/mode';
import { DeckProvider, type Deck } from '@/components/stage/phone/flows/deck';
import { ModeSwitch } from '@/components/ModeSwitch';

/**
 * The page, once. The routes are the same site with two things varied and
 * nothing else: WHO drives the demo phone (flows/mode.tsx — /, /guided, /live)
 * and WHICH perps screen the tour opens on (flows/deck.tsx — / against
 * /home-v2). Nothing outside the phone changes in either case, which is the
 * point: a comparison is only worth something if it is the same page either
 * side of it.
 */
export function Site({ mode, deck = 'card' }: { mode: Mode; deck?: Deck }) {
  return (
    <ModeProvider mode={mode}>
      <DeckProvider deck={deck}>
        <Nav />
        <Stage />
        <QuoteBand />
        <LightZone />
        <ModeSwitch mode={mode} />
      </DeckProvider>
    </ModeProvider>
  );
}
