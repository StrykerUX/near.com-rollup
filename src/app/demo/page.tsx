import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The app, step by step — near.com',
  description:
    'Five screen recordings of near.com, rebuilt frame by frame as running screens with the argument for each feature written beside them.',
};

const DEMOS = [
  {
    href: '/demo/perps',
    name: 'Perps',
    len: '5m 41s',
    steps: 24,
    blurb:
      'Fund the perps balance with a passkey, build a ticket, run into the two rules the market imposes, open the position and watch it settle in three parts.',
  },
  {
    href: '/demo/perps-v2',
    name: 'Perps v2',
    len: 'the same recording, cut',
    steps: 16,
    blurb:
      'The trade on its own — no account, no funding. $5,000 of margin into a $100,000 position, with the market held still while the stop loss and take profit are typed, because both rules are enforced against a fixed entry price.',
  },
  {
    href: '/demo/perps-v3',
    name: 'Perps v3',
    len: 'the same trade, quieter',
    steps: 9,
    blurb:
      'Half as much on screen and nothing to follow. No pointer — the control about to change lights itself, and every derived figure travels to its new value, so the link between the slider and the number that answered is the thing you watch.',
  },
  {
    href: '/demo/swap',
    name: 'Swap',
    len: '1m 14s',
    steps: 18,
    blurb:
      'A whole USDT balance turned into NEAR across chains — and the yield chip that was sitting on the next row the entire time, used without leaving the list.',
  },
  {
    href: '/demo/earn',
    name: 'Earn',
    len: '48s',
    steps: 16,
    blurb:
      'Two vaults with every fee stated before the rate, a deposit signed with a passkey, and then paying someone straight out of a vault balance.',
  },
  {
    href: '/demo/confidential-deposit',
    name: 'Confidential deposit',
    len: '38s',
    steps: 12,
    blurb:
      'Three quarters warning, and that is the design: two rules in red, a box that gates the button, and an address that is single-use and expires.',
  },
  {
    href: '/demo/confidential-send',
    name: 'Confidential send',
    len: '10s',
    steps: 8,
    blurb:
      'The shortest recording, and the finding is what it does not contain. There is no confidential mode — a shielded asset is picked from the same list as any other.',
  },
];

export default function Page() {
  return (
    <main className="pd">
      <header className="pdtop">
        <Link className="pdback" href="/">← near.com × The Rollup</Link>
        <h1>The app, step by step</h1>
        <p>
          Five screen recordings, rebuilt frame by frame as running screens rather than video.
          Each page plays its own timeline, lets you take the controls, and writes the argument for
          what the app is doing beside it. Every figure on them is the figure that was on screen.
        </p>
      </header>

      <ul className="pdindex">
        {DEMOS.map((demo) => (
          <li key={demo.href}>
            <Link href={demo.href}>
              <span className="pdix">
                <b>{demo.name}</b>
                <em>{demo.blurb}</em>
              </span>
              <span className="pdimeta">
                <i>{demo.len}</i>
                <i>{demo.steps} steps</i>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
