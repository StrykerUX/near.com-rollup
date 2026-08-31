import type { Metadata } from 'next';
import { SwapDemo } from '@/components/demo/swap/SwapDemo';

export const metadata: Metadata = {
  title: 'Swap, step by step — near.com',
  description:
    "near.com's cross-chain swap rebuilt frame by frame: the assets list, the token picker, the price stated three ways, a passkey, and the yield chip on the row next to it.",
};

export default function Page() {
  return <SwapDemo />;
}
