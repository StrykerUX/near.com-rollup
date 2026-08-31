import type { Metadata } from 'next';
import { ConSendDemo } from '@/components/demo/consend/ConSendDemo';

export const metadata: Metadata = {
  title: 'Confidential send, step by step — near.com',
  description:
    "near.com's Universal Send rebuilt frame by frame, sending a shielded asset: one token list, one screen, and a notice that only appears on the route it applies to.",
};

export default function Page() {
  return <ConSendDemo />;
}
