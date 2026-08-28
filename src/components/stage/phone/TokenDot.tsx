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
        fontSize: (size < 24 ? 9 : 11) + 'px',
      }}
    >
      {glyph ? (
        <svg viewBox="0 0 600 600" fill={token.ink} aria-hidden="true">
          {'d' in glyph ? <path d={glyph.d} /> : <polygon points={glyph.points} />}
        </svg>
      ) : (
        token.sym.charAt(0)
      )}
    </span>
  );
}
