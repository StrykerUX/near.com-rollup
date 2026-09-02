import { CARDS } from '@/lib/cards';
import { PhoneShell } from './phone/PhoneShell';

const LOGIN = 'https://near.com/login?ref=therollup';

const OFFER = (
  <p className="offer">
    Rollup traders keep <b>20% of every fee</b>, back in stablecoins.
  </p>
);

/**
 * THE CARD LOCKUP — copy left, phone centre, offer and CTA right.
 *
 * Three stacks of four faces, all authored in DISPLAY order (Perps, Account,
 * Swap, Earn) and kept index-aligned: the engine walks `.side.l .face`,
 * `.cswap > .face` and `.side.r .face` by position, so a face added to one
 * column has to be added to all three.
 */
export function Lockup() {
  return (
    <div className="lockup" id="lockup">
      {/* THREE PIECES, NOT FOUR. It was a near wordmark SVG, a CSS hairline, a
          3D pinwheel and The Rollup's wordmark masked out of a copper
          gradient — four elements assembled into something that had to be
          re-tuned every time either brand moved. The supplied artwork already
          contains each brand's mark and wordmark at the spacing they belong
          in, so the assembly is gone and what is left is two lockups and the
          rule between them. */}
      <div className="rollbrow" aria-label="near.com and The Rollup">
        <span className="nearw" role="img" aria-label="near.com" />
        <span className="rule" aria-hidden="true" />
        <span className="rolllock" role="img" aria-label="The Rollup" />
      </div>

      {/* Below 1080px the layout stacks brow / head / offer / phone / body /
          cta, so the offer moves above the phone: it is the reason a Rollup
          listener is on this page at all, and under the phone it lands past the
          fold. Rendered in both slots and switched by the stylesheet — a
          media-query listener that physically moved the node had to re-run on
          every resize and invalidated the engine's cached child lists. */}
      <div className="offerslot">{OFFER}</div>

      {/* THE HEADLINES, RENDERED FROM `CARDS`. Both columns walk the same
          array, so the pairing that the engine relies on — `.side.l .face[n]`
          and `.side.r .face[n]` are the same chapter — is now a fact of the
          data rather than a convention two blocks of markup had to keep. */}
      <div className="side l">
        {CARDS.map((c) => (
          <div className="face" data-face={c.face} key={c.id}>
            <h2 className={'h1' + (c.headClass ?? '')}>{c.head}</h2>
          </div>
        ))}
      </div>

      <div className="rollcta">
        {OFFER}
        <a className="btn btn-primary btn-lg ripple-cta" href={LOGIN}>
          Create account <span className="arw">&rarr;</span>
        </a>
        <p className="friction">No email. No KYC. Ready in seconds.</p>
      </div>

      {/* PENDING LEGAL. Wording and the jurisdiction list are unapproved.
          Confirm both with counsel before this page ships. */}
      <p className="perpsdisc">
        Perps are not available to US persons or in other restricted
        jurisdictions. Leveraged trading carries a substantial risk of loss.
      </p>

      <PhoneShell />

      <div className="side r">
        {CARDS.map((c) => (
          <div className="face" data-face={c.face} key={c.id}>{c.aside}</div>
        ))}
      </div>
    </div>
  );
}
