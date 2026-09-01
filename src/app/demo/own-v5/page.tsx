import type { Metadata } from 'next';
import { OwnV5Demo } from '@/components/demo/ownv5/OwnV5Demo';

export const metadata: Metadata = {
  title: 'Everything you own — near.com',
  description:
    'One account and three balances, five holdings sorted by value behind the first of them, and a row that opens into a swap.',
};

export default function Page() {
  return <OwnV5Demo />;
}
