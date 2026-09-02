import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The app, step by step — near.com',
  description:
    'Five screen recordings of near.com, rebuilt frame by frame as running screens with the argument for each feature written beside them.',
};

const DEMOS = [
  {
    href: '/demo/own-v5',
    name: 'Everything you own',
    len: 'twenty seconds',
    steps: 4,
    blurb:
      'One account and three balances, and behind the first of them the screen the tour’s own headline is about: five holdings sorted by value, a tokenised share among them, and a row that opens into a swap. Rebuilt off `rec-Everything you own + Swap screen.MP4` — the recording that finally put the assets screen on film.',
  },
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
    steps: 10,
    blurb:
      'Half as much on screen and nothing to follow. No pointer — the control about to change lights itself, and every derived figure travels to its new value, so the link between the slider and the number that answered is the thing you watch.',
  },
  {
    href: '/demo/perps-v4',
    name: 'Perps v4',
    len: 'the marketing cut',
    steps: 9,
    blurb:
      'The same trade as a film. One line of copy at a time, and a camera that pushes in on whatever the moment is about — the map that used to move a pointer now moves the frame.',
  },
  {
    href: '/demo/perps-v5',
    name: 'Perps v5',
    len: 'twenty-five seconds',
    steps: 2,
    blurb:
      'The cut for a feed rather than a room. It opens on a Long already working — $120,000 at 20x, in front — and spends the rest opening a second one beside it: $5,000 of margin, twenty times, both exits set. Its own device, rebuilt against the app rather than argued down from it, and the only screen here set in the face the app actually uses.',
  },
  {
    href: '/demo/earn-v5',
    name: 'Earn v5',
    len: 'twenty-three seconds',
    steps: 5,
    blurb:
      'Two managed vaults with their rate on the row, fifteen thousand into one of them in a single press, and a stake that has been accruing the whole time. The Vaults half is quoted frame by frame; the Staking and Positions tabs are the brief’s and say so where they are declared.',
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
    href: '/demo/swap-v4',
    name: 'Swap v4',
    len: 'the marketing cut',
    steps: 9,
    blurb:
      'The same eighteen steps as nine. One line of copy at a time, and the yield chip promoted from a detail on a row to the moment the cut ends on.',
  },
  {
    href: '/demo/swap-v5',
    name: 'Swap v5',
    len: 'twenty-five seconds',
    steps: 4,
    blurb:
      'A form that already knows half of what it needs — BTC is in the top field because the reader tapped it on the home screen, and what is left is how much and into what. A destination picker of twenty-seven, scrolled three times rather than glided once, and one press. Same device as Perps v5.',
  },
  {
    href: '/demo/earn',
    name: 'Earn',
    len: '48s',
    steps: 17,
    blurb:
      'Two vaults with every fee stated before the rate, a deposit signed with a passkey, and then paying someone straight out of a vault balance.',
  },
  {
    href: '/demo/earn-v4',
    name: 'Earn v4',
    len: 'the marketing cut',
    steps: 9,
    blurb:
      'The deposit and what it buys, in nine moments: every fee stated before the amount field, both numbers moving after it settles, and the vault turning up in the token picker as something you can spend.',
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
    href: '/demo/confidential-deposit-v4',
    name: 'Confidential deposit v4',
    len: 'the marketing cut',
    steps: 7,
    blurb:
      'Seven moments, and the refusal is still one of them — the picker naming the chains it will not take is the most interesting thing the screen does.',
  },
  {
    href: '/demo/confidential-send',
    name: 'Confidential send',
    len: '10s',
    steps: 8,
    blurb:
      'The shortest recording, and the finding is what it does not contain. There is no confidential mode — a shielded asset is picked from the same list as any other.',
  },
  {
    href: '/demo/confidential-send-v4',
    name: 'Confidential send v4',
    len: 'the marketing cut',
    steps: 6,
    blurb:
      'Six, because six is the honest length. A ten-second recording whose finding is that there is nothing extra to show does not get a seventh moment invented for it.',
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
        <p>
          Several are here more than once. A <b>v4</b> is the same machine and the same gestures
          re-cut into eight or so moments, with the reasons taken off the page and one line of copy
          left in their place — the argument made to a room rather than to a reader.
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
