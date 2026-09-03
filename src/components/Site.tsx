import { Nav } from '@/components/Nav';
import { Stage } from '@/components/stage/Stage';
import { QuoteBand } from '@/components/stage/QuoteBand';
import { LightZone } from '@/components/light/LightZone';

/**
 * The page.
 *
 * IT USED TO TAKE TWO PROPS AND WRAP TWO PROVIDERS. The site was three routes
 * of the same page with one thing varied each — `mode` chose who drove the demo
 * phone (`/`, `/guided`, `/live`) and `deck` chose which perps screen the tour
 * opened on (`/home-v2` against this one) — and the argument for that was
 * sound: a comparison is only worth something if it is the same page either
 * side of it. There is nothing left to compare. One route, one composition, and
 * the props that selected between them were both down to a single value.
 */
export function Site() {
  return (
    <>
      <Nav />
      <Stage />
      <QuoteBand />
      <LightZone />
    </>
  );
}
