import type { Metadata } from 'next';
import { Site } from '@/components/Site';

export const metadata: Metadata = {
  title: 'near.com × THE ROLLUP — home v2',
  description:
    'The same page, with the product tour opening on the app’s own perps screen instead of the card version of it.',
};

/**
 * HOME v2 — one variable changed, and it is inside the phone.
 *
 * Same stage engine, same 588vh schedule, same four-card tour, same light
 * zone. The only difference is which perps screen the tour opens on: this
 * route passes `deck="app"`, which swaps the first face for the pixel copy
 * that `/demo/perps-v5` runs. See flows/deck.tsx.
 */
export default function Page() {
  return <Site mode="demo" deck="app" />;
}
