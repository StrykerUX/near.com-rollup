import type { Metadata } from 'next';
import { PerpsV5Demo } from '@/components/demo/perpsv5/PerpsV5Demo';

export const metadata: Metadata = {
  title: 'Perps v5 — near.com',
  description:
    'Twenty seconds: a Long BTC position already working, a second one opened beside it at twenty times with both exits set, and the market left running under it.',
};

export default function Page() {
  return <PerpsV5Demo />;
}
