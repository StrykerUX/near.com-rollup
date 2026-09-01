import type { Metadata } from 'next';
import { SwapV4Demo } from '@/components/demo/swapv4/SwapV4Demo';

export const metadata: Metadata = {
  title: 'Swap v4 — near.com',
  description:
    'A whole balance swapped across chains as a film: one line of copy at a time, and a frame that darkens around the number being read.',
};

export default function Page() {
  return <SwapV4Demo />;
}
