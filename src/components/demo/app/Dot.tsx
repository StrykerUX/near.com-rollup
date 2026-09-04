import { TOK_ICONS } from '@/lib/tokens';

/**
 * THE TOKEN CHIP, for every screen in the app's own language.
 *
 * A brand colour behind the asset's initial, which is what the app does for
 * anything it has no mark for — and with twenty-seven assets in a picker and
 * five in a wallet, most of them have none.
 *
 * The exceptions are the assets whose artwork the repo has (`TOK_ICONS` in
 * lib/tokens.ts — twenty of the twenty-seven in the picker, as official
 * full-colour files). A letter where the real mark exists is a worse lie than a
 * letter where none does — nobody mistakes a `D` on gold, and everybody knows
 * the ₿.
 *
 * The brand colour stays under the artwork on purpose: each file is a disc that
 * covers its own square, so what `a.color` paints is the single frame before
 * the image decodes, in the right colour rather than in a hole.
 */
export type Chip = { sym: string; color: string; ink: string };

export function Dot({ a, size = 30 }: { a: Chip; size?: number }) {
  const art = TOK_ICONS[a.sym];
  return (
    <span
      className="swdot"
      style={{
        background: a.color,
        color: a.ink,
        width: size + 'px',
        height: size + 'px',
        fontSize: Math.max(12, Math.round(size * 0.4)) + 'px',
      }}
    >
      {art && 'img' in art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="swimg" src={art.img} alt="" width={size} height={size} aria-hidden="true"
             style={imgBox(art, size)} />
      ) : art && 'd' in art ? (
        <svg className="swsvg" viewBox="0 0 600 600" fill={a.ink} aria-hidden="true"><path d={art.d} /></svg>
      ) : art && 'points' in art ? (
        <svg className="swsvg" viewBox="0 0 600 600" fill={a.ink} aria-hidden="true"><polygon points={art.points} /></svg>
      ) : (
        a.sym.charAt(0)
      )}
    </span>
  );
}

/**
 * The inline box a file-backed mark needs, and nothing when it needs none.
 *
 * `58%` is `.swsvg`'s own number in 24-demo-app.css — the size this chip gives
 * a glyph that does not bring a disc — and it is applied in PIXELS rather than
 * as a percentage because a percentage block size does not resolve on an
 * `<img>` inside `.swdot`'s centred grid. `lib/tokens.ts` has the measurement.
 *
 * The box is square and `contain` fits the artwork inside it, so a mark that
 * is taller than it is wide keeps its proportions. At 58% the box's own corners
 * sit 0.41 of the chip from its centre against a radius of 0.5, so the round
 * clip cannot reach even those.
 */
function imgBox(art: { spin?: number; bare?: true }, size: number): React.CSSProperties | undefined {
  if (!art.spin && !art.bare) return undefined;
  return {
    ...(art.spin ? { transform: `rotate(${art.spin}deg)` } : null),
    ...(art.bare
      ? { width: `${size * 0.58}px`, height: `${size * 0.58}px`, objectFit: 'contain' as const }
      : null),
  };
}
