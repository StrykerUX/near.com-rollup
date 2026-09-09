import type { Metadata, Viewport } from 'next';
import './globals.css';
import { InlineScript } from '@/components/InlineScript';
import { Splash } from '@/components/Splash';

export const metadata: Metadata = {
  title: "near.com — The only onchain account you'll need",
  description:
    "Everything you do onchain is public. It doesn't have to be. Fully confidential swaps, transfers, deposits and withdrawals across 30+ chains, from one account.",
  other: { 'build-version': 'v08_rollup' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /* the engine flips this to the light paper as the closing plate lands */
  themeColor: '#000000',
};

/* THE SESSION GATE FOR THE CURTAIN, and it has to be a parsing-time script.
   `sessionStorage` does not exist on the server, so the markup cannot know
   whether this reader has already seen the intro; deciding it in an effect
   would show the curtain and then remove it, which is worse than always
   showing it. A script in `<head>` runs before the first paint — the pattern
   in Next's own guide (`docs/01-app/02-guides/preventing-flash-before-
   hydration.md`), which exists for exactly this class of problem.

   IT MARKS WHAT HAS BEEN SEEN; the stylesheet is what hides. That direction is
   deliberate — `32-splash.css` has the long note — because it means a reader
   with no JavaScript, or a private window where `sessionStorage` throws, still
   gets a curtain that leaves on its own. The worst failure is seeing it twice.

   The `try` is not defensive noise: Safari in private browsing throws on
   `setItem`, and an uncaught error in a `<head>` script would take the rest of
   the script with it. */
/**
 * THE CURTAIN'S GATE. It plays on every load; this decides how long for.
 *
 * `data-splash="again"` means "this tab has seen it" — 32-splash.css reads it
 * to pick 1800ms over the first run's 2500ms. It used to mean "do not draw it
 * at all", and the value said `seen`, which described the fact rather than
 * what is done with it.
 *
 * THE THROW IS THE POINT OF THE try/catch. `sessionStorage` throws outright in
 * some privacy modes, and there the attribute is never written — so the reader
 * gets the unmarked state, which is the full-length first run. Failing toward
 * the complete version is the right way round: the short one only makes sense
 * as a second viewing.
 */
const GATE =
  'try{if(sessionStorage.getItem("splash"))' +
  'document.documentElement.dataset.splash="again";' +
  'else sessionStorage.setItem("splash","1")}catch(e){}';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* `suppressHydrationWarning` IS LOAD-BEARING, NOT NOISE SUPPRESSION. The
       gate script below writes `data-splash` onto this element while the HTML
       is still parsing, so the DOM React finds at hydration carries an
       attribute its own render does not. Without this, React does not merely
       warn: it treats the mismatch as an error and recovers by client
       rendering from the nearest boundary, which for the root layout is the
       whole page — the server HTML is thrown away and re-rendered, and any
       inline-script correction inside that boundary is lost with it. With it,
       the DOM wins, which is right: the DOM is where the script already did
       the work. Next's own guide says so at
       `docs/01-app/02-guides/preventing-flash-before-hydration.md:113`. */
    <html lang="en" suppressHydrationWarning>
      {/* THERE IS A <head> AGAIN, AND IT IS NOT THE ONE THAT WAS REMOVED. What
          used to be here was the Adobe Fonts kit for Kepler Std — a
          preconnect, a stylesheet at media="print" and a noscript copy, plus
          the component that flipped it to "all" once it landed. The page has no
          Kepler in it any more (see the `em` rule in 04-type.css) and every
          face it does use is self-hosted in public/fonts, so none of that came
          back. What is here is the curtain's gate and two of our own images.

          THE PRELOADS ARE FOR THE EYEBROW'S TWO MARKS. Both are drawn as CSS
          `background-image`, which means the browser cannot discover them until
          it has fetched and parsed the stylesheet — and `rollup-logo.png` is
          95KB. The curtain shows that eyebrow in its first half second, and the
          hero shows the same two files immediately after, so starting the
          requests from the HTML helps both. (The real fix is that a 95KB PNG of
          a logo should be a WebP or an SVG; that is a separate change.) */}
      <head>
        <InlineScript html={GATE} />
        {/* THE DARK-FIELD CUTS, not the PNGs. 33-hero-skyline.css re-points the
            two tokens — The Rollup's own silver artwork and a near.com wordmark
            re-coloured to `--fg` — and every surface that draws them (the
            curtain, the hero, the narrow tour) is that field. Preloading the
            black PNGs would fetch 100KB nobody paints. */}
        <link rel="preload" as="image" href="/img/rollup-logo-silver.webp" />
        <link rel="preload" as="image" href="/img/near-logo-light.webp" />
        {/* THE FIELD ITSELF, for the same reason and more so: it is the largest
            thing on the first screen and it is a CSS `background-image` on
            `.gcss`, so it is not discovered until 33-hero-skyline.css has been
            fetched and parsed. `imageSrcSet`/`imageSizes` is how a preload
            picks the same plate the media query will — without them the
            browser would eagerly fetch the wide one on a phone and then load
            the small one as well. 1080px is NARROW_MAX, the seam the
            stylesheet cuts on. */}
        <link
          rel="preload"
          as="image"
          href="/img/skyline.webp"
          imageSrcSet="/img/skyline-sm.webp 1280w, /img/skyline.webp 2400w"
          imageSizes="(max-width: 1080px) 1280px, 2400px"
        />
      </head>
      <body>
        {/* FIRST, BEFORE THE CONTENT IT COVERS. The stacking is settled by
            z-index rather than document order (see 32-splash.css), so this
            position buys one specific thing: the curtain is parsed no later
            than the markup it is meant to be in front of, whatever order the
            response arrives in. It is `aria-hidden` with no text inside, so
            being first costs nothing in reading order. */}
        <Splash />
        {children}
      </body>
    </html>
  );
}
