import type { Metadata } from 'next';
import { PerpsV3Demo } from '@/components/demo/perpsv3/PerpsV3Demo';

export const metadata: Metadata = {
  title: 'Perps v3 — near.com',
  description:
    'The perps trade with half as much on screen and no pointer: the control about to change lights itself, and every derived figure travels to its new value.',
};

export default function Page() {
  return <PerpsV3Demo />;
}
