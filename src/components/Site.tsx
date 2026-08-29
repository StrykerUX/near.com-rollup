import { Nav } from '@/components/Nav';
import { Stage } from '@/components/stage/Stage';
import { QuoteBand } from '@/components/stage/QuoteBand';
import { LightZone } from '@/components/light/LightZone';
import { ModeProvider, type Mode } from '@/components/stage/phone/flows/mode';
import { ModeSwitch } from '@/components/ModeSwitch';

/**
 * The page, once. The three routes are the same site with a different driver
 * behind the demo phone — see flows/mode.tsx. Nothing outside the phone
 * changes, which is the point: the comparison is only worth anything if it is
 * the same page either side of it.
 */
export function Site({ mode }: { mode: Mode }) {
  return (
    <ModeProvider mode={mode}>
      <Nav />
      <Stage />
      <QuoteBand />
      <LightZone />
      <ModeSwitch mode={mode} />
    </ModeProvider>
  );
}
