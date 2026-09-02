import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'near.com × THE ROLLUP — home v2',
  description:
    'The same page, with the product tour opening on the card version of the perps screen instead of the app’s own.',
};

/**
 * HOME v2 — one variable changed, and it is inside the phone.
 *
 * Same stage engine, same 588vh schedule, same four-card tour, same light
 * zone. The only difference is which perps screen the tour opens on: this
 * route passes `deck="card"`, the drawing of that screen in the site's own
 * language, on the site's own glass. See flows/deck.tsx.
 *
 * IT USED TO BE THE OTHER WAY ROUND — this route carried the real device and
 * the root carried the drawing. The names swapped when the real one became the
 * page; the route is kept rather than deleted because the comparison is the
 * reason it exists, and it only works if both sides are still reachable.
 */
export default function Page() {
  return <Site mode="demo" deck="card" />;
}
