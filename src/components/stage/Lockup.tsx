import { CARDS, OFFER, PERPS_NOTE } from '@/lib/cards';
import { PhoneShell } from './phone/PhoneShell';

const LOGIN = 'https://near.com/login?ref=therollup';

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
      {/* THE ROLLUP LEADS. It was near.com first, which is the order a
          near.com page would normally take; the comp puts the host brand in
          front of it, and that is the argument — this is The Rollup's audience
          arriving on a co-branded page, so the mark they came for reads first
          and near.com is what it opens onto. The `aria-label` follows the
          visual order, because a screen reader is reading the same lockup. */}
      <div className="rollbrow" aria-label="The Rollup and near.com">
        <span className="rolllock" role="img" aria-label="The Rollup" />
        <span className="rule" aria-hidden="true" />
        <span className="nearw" role="img" aria-label="near.com" />
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
        <a
          className="btn btn-primary btn-lg ripple-cta"
          href={LOGIN}
          target="_blank"
          rel="noopener"
          data-umami-event="cta-lockup"
        >
          Create account <span className="arw">&rarr;</span>
        </a>
        <p className="friction">No email. No KYC. Ready in seconds.</p>
      </div>

      <p className="perpsdisc">{PERPS_NOTE}</p>

      <PhoneShell />

      <div className="side r">
        {CARDS.map((c) => (
          <div className="face" data-face={c.face} key={c.id}>{c.aside}</div>
        ))}
      </div>
    </div>
  );
}
