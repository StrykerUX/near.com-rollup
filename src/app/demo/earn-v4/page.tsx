import type { Metadata } from 'next';
import { EarnV4Demo } from '@/components/demo/earnv4/EarnV4Demo';

export const metadata: Metadata = {
  title: 'Earn v4 — near.com',
  description:
    'The vault deposit as a film: one line of copy at a time, and a phone that ends up paying a transfer straight out of the position it just opened.',
};

export default function Page() {
  return <EarnV4Demo />;
}
