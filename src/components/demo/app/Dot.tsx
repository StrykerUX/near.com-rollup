import { TOK_ICONS } from '@/lib/tokens';

/**
 * THE TOKEN CHIP, for every screen in the app's own language.
 *
 * A brand colour behind the asset's initial, which is what the app does for
 * anything it has no mark for — and with twenty-seven assets in a picker and
 * five in a wallet, most of them have none.
 *
 * The exceptions are the assets whose artwork the repo already has (`TOK_ICONS`
 * in lib/tokens.ts, which today is Bitcoin, NEAR and Zcash). A letter where the
 * real mark exists is a worse lie than a letter where none does — nobody
 * mistakes a `D` on gold, and everybody knows the ₿.
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
        <img className="swimg" src={art.img} alt="" width={size} height={size} aria-hidden="true" />
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
