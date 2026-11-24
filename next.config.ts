import type { NextConfig } from 'next';

/**
 * THE ONLY THIRD-PARTY ORIGIN THE PAGE TALKS TO. Umami's script is loaded from
 * here and its events are sent back here (`layout.tsx`). If that `<Script src>`
 * moves, this has to move with it or analytics goes quiet under the CSP.
 */
const UMAMI = 'https://umami-production-c53b.up.railway.app';

const isDev = process.env.NODE_ENV === 'development';

/**
 * THE CONTENT SECURITY POLICY, AND WHY IT IS NOT THE STRICT KIND.
 *
 * A nonce-based policy is the textbook answer, but a nonce has to be new on
 * every response, and that makes every page dynamic. This site is entirely
 * prerendered (`○ /` in the build output) and served from Vercel's cache, so a
 * nonce would cost exactly what the site is built around. `'unsafe-inline'` for
 * scripts is the price of staying static: Next's own bootstrap is inline, and
 * so is `GATE` in `layout.tsx`, which has to run before first paint.
 *
 * What the policy still buys is the part that matters for a page with no user
 * input: scripts can come from nowhere but this origin and Umami's, nothing
 * can be fetched from anywhere else, no `<base>` or `<object>` tricks, and no
 * other site can frame this one over its own buttons (clickjacking).
 *
 * `style-src 'unsafe-inline'` is for GSAP and React, which write inline
 * `style` attributes on every animated element. `'unsafe-eval'` and `ws:` are
 * development-only: `next dev` needs them for React's debug tooling and HMR.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${UMAMI}${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${UMAMI}${isDev ? ' ws:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * REPORT-ONLY FIRST. The browser evaluates the policy and logs every violation
 * to the console without blocking anything, so a resource this file forgot
 * shows up as a warning instead of a broken page. Once production has run
 * clean under it, flip this to `false` and the same policy is enforced.
 */
const CSP_REPORT_ONLY = true;

const securityHeaders = [
  {
    key: CSP_REPORT_ONLY ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    value: csp,
  },
  /* `frame-ancestors` is ignored while the CSP is report-only, and older
     browsers never read it: this is what actually stops framing today. */
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /* The browser default, stated so a proxy or CDN cannot loosen it. The
     outbound `ref=therollup` lives in the url, not in the referrer. */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  /* Vercel already sends HSTS on the custom domain, but without
     `includeSubDomains`. No `preload`: that is a decision for near.com as a
     whole, not for one subdomain. */
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  /** `X-Powered-By: Next.js` tells a scanner which advisories to try. */
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  /**
   * THE PARTNER'S DOORS.
   *
   * `therollup.co/nearperps` redirects here, and the whole point of landing on
   * a PATH rather than on `/` with a query is that a path cannot be stripped:
   * no "clean url" tool removes it, and a reader who copies the address bar
   * and sends it to somebody carries the attribution with them.
   *
   * REWRITES, NOT REDIRECTS, AND THE DIFFERENCE IS THE ENTIRE MECHANISM. A
   * redirect to `/` would tidy the address bar and erase the only signal there
   * was, before any script ran. A rewrite serves the homepage while leaving
   * `location.pathname` saying `/perps`, which is what `lib/analytics.ts`
   * reads. There is no second copy of the page and no route file to keep in
   * step — `/` is whatever `app/page.tsx` renders that week, holding page or
   * tour.
   *
   * TWO SHAPES. `/perps` is the named door in the brief; `/r/:source` is the
   * namespace every later one should use, because a bare name competes with
   * the site's own routes and `/r/` never will. Adding a bare name here means
   * adding it to `SOURCE_PATHS` in `lib/analytics.ts` as well — the allowlist
   * there is what stops `/preview` being read as a campaign.
   */
  async rewrites() {
    return [
      { source: '/perps', destination: '/' },
      { source: '/r/:source', destination: '/' },
    ];
  },

  /**
   * `/preview` WAS THE TOUR WHILE THE HOLDING PAGE HELD `/`, and links to it
   * went out. The route is gone, so without this they 404 — a worse answer
   * than the page they were promised, which now lives one path up.
   *
   * PERMANENT, and that is the honest status: `/preview` existed for one
   * reason and that reason has ended. A 308 also tells a crawler which url is
   * canonical, which matters because that route carried `robots: noindex` for
   * exactly as long as it existed and nothing should now be weighing the two
   * against each other.
   */
  async redirects() {
    return [{ source: '/preview', destination: '/', permanent: true }];
  },
};

export default nextConfig;
