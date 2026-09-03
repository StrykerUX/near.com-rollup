import type { Metadata, Viewport } from 'next';
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
      {/* NO <head> OF OUR OWN. It carried the Adobe Fonts kit for Kepler Std —
          a preconnect, a stylesheet at media="print" and a noscript copy — plus
          the component that flipped it to "all" once it landed. The page has no
          Kepler in it any more (see the `em` rule in 04-type.css), so what is
          left is a third-party font request on every visit for a family nothing
          asks for. Every face the page uses is self-hosted in public/fonts. */}
      <body>{children}</body>
    </html>
  );
}
