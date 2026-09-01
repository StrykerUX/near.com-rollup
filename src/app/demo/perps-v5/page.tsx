import type { Metadata } from 'next';
import { PerpsV5Demo } from '@/components/demo/perpsv5/PerpsV5Demo';

export const metadata: Metadata = {
  title: 'Perps v5 — near.com',
  description:
    'Thirteen seconds: a Long BTC position already working, and a second one opened beside it at twenty times with both exits set.',
};

export default function Page() {
  return <PerpsV5Demo />;
}
