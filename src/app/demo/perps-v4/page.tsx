import type { Metadata } from 'next';
import { PerpsV4Demo } from '@/components/demo/perpsv4/PerpsV4Demo';

export const metadata: Metadata = {
  title: 'Perps v4 — near.com',
  description:
    'The perps trade as a film: one line of copy at a time, and a camera that pushes in on whatever the moment is about.',
};

export default function Page() {
  return <PerpsV4Demo />;
}
