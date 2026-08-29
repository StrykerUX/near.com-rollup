import type { Metadata } from 'next';
import { PerpsDemo } from '@/components/demo/perps/PerpsDemo';

export const metadata: Metadata = {
  title: 'Perps, paso a paso — near.com',
  description:
    'La app de perpetuos de near.com reconstruida cuadro por cuadro: fondear con passkey, armar el ticket, las reglas de take profit y stop loss, y la posición que sale de ahí.',
};

export default function Page() {
  return <PerpsDemo />;
}
