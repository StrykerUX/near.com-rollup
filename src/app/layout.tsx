import type { Metadata, Viewport } from 'next';
import { KeplerProbe } from '@/components/KeplerProbe';
import { TYPEKIT_HREF, TypekitStylesheet } from '@/components/TypekitStylesheet';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Kepler Std is licensed via Adobe Fonts. This IS the permitted way to
          use it: their terms require the kit's stylesheet and forbid
          self-hosting the files, so Kepler is the one face here that cannot be
          bundled. It needs a network connection — offline, the stacks fall
          through the local() chain to the embedded serif.

          media="print" makes it non-render-blocking; TypekitStylesheet flips it
          to "all" once it lands. The link is server-rendered rather than
          injected so the fetch is in flight before `document.fonts.ready`
          resolves — see that component for what breaks otherwise. */}
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href={TYPEKIT_HREF} media="print" />
        <noscript>
          <link rel="stylesheet" href={TYPEKIT_HREF} />
        </noscript>
      </head>
      <body>
        <TypekitStylesheet />
        <KeplerProbe />
        {children}
      </body>
    </html>
  );
}
