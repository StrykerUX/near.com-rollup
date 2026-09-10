import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
