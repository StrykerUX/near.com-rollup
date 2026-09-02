import { Site } from '@/components/Site';

/**
 * 1 · DEMO — the product tour. It plays itself, slowly, and takes no pointer.
 *
 * It opens on the app's OWN perps screen, which is `flows/deck.tsx`'s default
 * and so needs no prop here. The card drawing of that screen is at `/home-v2`.
 */
export default function Home() {
  return <Site mode="demo" />;
}
