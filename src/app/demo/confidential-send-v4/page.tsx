import type { Metadata } from 'next';
import { ConSendV4Demo } from '@/components/demo/consendv4/ConSendV4Demo';

export const metadata: Metadata = {
  title: 'Confidential send v4 — near.com',
  description:
    'Sending a shielded asset as a film: one line of copy at a time, and a frame that darkens around the token list where ZEC sits with every other token.',
};

export default function Page() {
  return <ConSendV4Demo />;
}
