import type { Metadata } from 'next';
import { EarnV5Demo } from '@/components/demo/earnv5/EarnV5Demo';

export const metadata: Metadata = {
  title: 'Earn — near.com',
  description:
    'Two managed vaults with their rates, fifteen thousand into one of them in a single press, and a stake that has been accruing the whole time.',
};

export default function Page() {
  return <EarnV5Demo />;
}
