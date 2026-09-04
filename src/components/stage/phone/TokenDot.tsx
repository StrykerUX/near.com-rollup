import { TOK_ICONS, type Token } from '@/lib/tokens';

/**
 * The coloured token chip. Real brand glyphs render on a 600 grid where the set
 * has one; every other token falls back to its initial, which is why the font
 * size steps with the dot size.
 */
export function TokenDot({ token, size = 20 }: { token: Token; size?: number }) {
  const glyph = TOK_ICONS[token.sym];
  return (
    <span
      className="tok"
      style={{
        background: token.color,
        color: token.ink,
        width: size + 'px',
        height: size + 'px',
        /* THE LETTER IS TYPE. It stands in for a brand mark the icon set does
           not have, and it was set at 9px in the small dots — under the floor
           this UI keeps. A dot smaller than about 18px cannot hold 12px, so
           the callers that wanted 13 were raised rather than exempted. */
        fontSize: Math.max(12, Math.round(size * 0.42)) + 'px',
      }}
    >
      {glyph && 'img' in glyph ? (
        /* the artwork already contains its own disc, so it covers the dot
           edge to edge rather than sitting inside it. Plain <img>: it is one
           small square that never changes size between renders, which is the
           one case next/image's layout machinery buys nothing for. */
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tokimg" src={glyph.img} alt="" width={size} height={size} aria-hidden="true"
             style={imgBox(glyph, size)} />
      ) : glyph ? (
        <svg viewBox="0 0 600 600" fill={token.ink} aria-hidden="true">
          {'d' in glyph ? <path d={glyph.d} /> : <polygon points={glyph.points} />}
        </svg>
      ) : (
        token.sym.charAt(0)
      )}
    </span>
  );
}

/**
 * As `Dot`'s own `imgBox`, at this file's fraction: `60%` is what
 * `.tok svg` gets in 07-stage.css for a glyph with no disc of its own.
 *
 * `borderRadius: 0` is the one addition. `.tok .tokimg` rounds the image to
 * 50% because artwork here normally IS the disc; on an inset silhouette that
 * same rule would clip the mark into a circle and undo the point of insetting
 * it. See the note on `bare` in lib/tokens.ts.
 */
function imgBox(glyph: { spin?: number; bare?: true }, size: number): React.CSSProperties | undefined {
  if (!glyph.spin && !glyph.bare) return undefined;
  return {
    ...(glyph.spin ? { transform: `rotate(${glyph.spin}deg)` } : null),
    ...(glyph.bare
      ? {
          width: `${size * 0.6}px`,
          height: `${size * 0.6}px`,
          objectFit: 'contain' as const,
          borderRadius: 0,
        }
      : null),
  };
}
