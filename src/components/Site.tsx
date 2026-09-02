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
 * and WHICH perps screen the tour opens on (flows/deck.tsx — the three of them
 * against /home-v2). Nothing outside the phone changes in either case, which
 * is the point: a comparison is only worth something if it is the same page
 * either side of it.
 *
 * THE DECK DEFAULTS RATHER THAN BEING PASSED, and that is what keeps the three
 * MODES one page. Flip only the root and Demo → Guided would change the phone
 * as well as who is driving it, which is two variables moving on a switch that
 * exists to move one.
 */
export function Site({ mode, deck = 'app' }: { mode: Mode; deck?: Deck }) {
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
