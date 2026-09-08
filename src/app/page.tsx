import { ComingSoon } from '@/components/ComingSoon';

/**
 * TEMPORARY. The holding page has the homepage while the tour is not being
 * shown publicly; the tour itself is unchanged and still complete at
 * `/preview`.
 *
 * PUTTING IT BACK IS THIS FILE. Swap the import for `@/components/Site` and
 * delete `app/preview/page.tsx` — nothing in the tour was gated, unpicked or
 * conditioned to make room for this, and `<ComingSoon />` shares the field
 * through tokens rather than by holding a copy of it.
 */
export default function Home() {
  return <ComingSoon />;
}
