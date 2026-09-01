import type { Metadata } from 'next';
import { ConDepositV4Demo } from '@/components/demo/condepositv4/ConDepositV4Demo';

export const metadata: Metadata = {
  title: 'Confidential deposit v4 — near.com',
  description:
    'The one-time confidential deposit as a film: seven moments, one line of copy at a time, and a frame that darkens around the rule being read — including the network the picker refuses by name.',
};

export default function Page() {
  return <ConDepositV4Demo />;
}
