import type { Metadata } from 'next';
import { ConDepositDemo } from '@/components/demo/condeposit/ConDepositDemo';

export const metadata: Metadata = {
  title: 'Confidential deposit, step by step — near.com',
  description:
    "near.com's one-time confidential deposit address rebuilt frame by frame: the rules you have to acknowledge, the networks a token can actually arrive on, and an address that expires.",
};

export default function Page() {
  return <ConDepositDemo />;
}
