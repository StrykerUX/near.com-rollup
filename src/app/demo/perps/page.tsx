import type { Metadata } from 'next';
import { PerpsDemo } from '@/components/demo/perps/PerpsDemo';

export const metadata: Metadata = {
  title: 'Perps, step by step — near.com',
  description:
    "near.com's perpetuals app rebuilt frame by frame: funding with a passkey, building the ticket, the take profit and stop loss rules, and the position that comes out of it.",
};

export default function Page() {
  return <PerpsDemo />;
}
