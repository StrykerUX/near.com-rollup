import type { Metadata } from 'next';
import { SwapV5Demo } from '@/components/demo/swapv5/SwapV5Demo';

export const metadata: Metadata = {
  title: 'Swap v5 — near.com',
  description:
    'A swap page that already knows half of what it needs: BTC pre-filled from the home screen, a destination picked out of twenty-seven, and one press.',
};

export default function Page() {
  return <SwapV5Demo />;
}
