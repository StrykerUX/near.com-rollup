import type { Metadata } from 'next';
import { PerpsV2Demo } from '@/components/demo/perpsv2/PerpsV2Demo';

export const metadata: Metadata = {
  title: 'Perps v2 — near.com',
  description:
    "The perps trade on its own: the market, a position, the take profit and stop loss rules read against a price held still, and the perp screen with the position on it.",
};

export default function Page() {
  return <PerpsV2Demo />;
}
