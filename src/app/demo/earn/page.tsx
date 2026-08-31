import type { Metadata } from 'next';
import { EarnDemo } from '@/components/demo/earn/EarnDemo';

export const metadata: Metadata = {
  title: 'Earn, step by step — near.com',
  description:
    "near.com's yield vaults rebuilt frame by frame: the vault list, the fees stated before the rate, a passkey deposit, and paying a transfer straight out of a vault balance.",
};

export default function Page() {
  return <EarnDemo />;
}
