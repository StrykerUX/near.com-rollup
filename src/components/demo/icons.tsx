import type { SVGProps } from 'react';
import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft01Icon,
  ArrowLeftRightIcon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowTurnBackwardIcon,
  ArrowUpDownIcon,
  Cancel01Icon,
  ChartCandleIcon,
  ChartLineIcon,
  ChartUpIcon,
  DashboardSquare01Icon,
  HelpCircleIcon,
  Home01Icon,
  Navigation03Icon,
  PreferenceHorizontalIcon,
  ScanIcon as ScanGlyph,
  Search01Icon,
  SquareLockCheck01Icon,
  Tick02Icon,
  ViewIcon,
  Wallet01Icon,
  Wallet03Icon,
} from '@hugeicons/core-free-icons';

/**
 * THE PHONE'S INTERFACE ICONS.
 *
 * Every glyph inside the device came from here or it does not exist. Before
 * this file there were twenty-five of them typed out as inline `<svg>` in six
 * components, copied from lucide, with the same glyph re-typed in up to four
 * places — `chevron-down` lived in three chapters, the downward arrow in three
 * call sites, the paper plane in two. Changing one meant finding all of them,
 * and the last time somebody tried, the comments left behind still point at a
 * `phone/icons.tsx` that was deleted rather than written. This is that file.
 *
 * THE SET IS HUGEICONS STROKE ROUNDED, the free tier of @hugeicons/core-free-
 * icons (MIT). One family, one grid, one stroke language — which is the whole
 * reason to take a set rather than keep collecting glyphs: twenty-five icons
 * drawn by one hand look like an interface, and twenty-five sourced one at a
 * time look like a scrapbook.
 *
 * WHY THE PATHS ARE RENDERED HERE AND NOT BY `<HugeiconsIcon>`. The library
 * ships a component, and it takes `size` and `color` as props. This phone does
 * neither: every icon in it is sized by a CSS class (`.swflip` is 13px,
 * `.bcv` is 16, `.dtab svg` is 21) and coloured by inheritance, so that the
 * tab bar can go green under `[aria-current]` and a chevron can sit at .45
 * alpha without either being restated in TSX. Passing that through props would
 * mean moving forty-odd sizes and colours out of the stylesheets and into the
 * markup. The icons are plain data — arrays of `[tag, attributes]` — so
 * rendering them into the `<svg>` contract that is already there costs one
 * component and keeps every existing rule working untouched.
 *
 * `stroke` AND `strokeWidth` ARE STRIPPED FROM EACH PATH, deliberately. The
 * package bakes `stroke="currentColor" strokeWidth="1.5"` into every path, and
 * an attribute on the path beats one on the parent `<svg>` — so a caller could
 * not thin a stroke, and no CSS `stroke-width` rule would ever apply. Lifted to
 * the parent, both become inheritable again and `strokeWidth` becomes a prop
 * the few icons that need it can use.
 *
 * WHAT IS NOT HERE, AND MUST NOT BE:
 *   · token and coin artwork — `lib/tokens.ts` and /public/logos/tokens. Those
 *     are brands, not glyphs, and a generic set has no BTC in it.
 *   · near.com's own mark in the account avatar (`app/AccountHome.tsx`) and
 *     the TradingView watermark on the perps chart. Same reason.
 *   · the progress checklist's three marks (`stage/phone/ui/ProgressList.tsx`).
 *     They are the one place in the phone that does not use `currentColor` —
 *     fixed fills, plus a spinner whose arcs are animated by CSS. They are a
 *     small piece of motion design wearing an icon's clothes.
 */

/** the shape @hugeicons/core-free-icons exports: `[tag, attributes][]` */
type IconData = readonly (readonly [string, Record<string, unknown>])[];

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** defaults to the set's own 1.5; raise it for glyphs drawn small */
  strokeWidth?: number | string;
};

function make(data: IconData) {
  return function Icon({ strokeWidth = 1.5, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {data.map(([tag, attrs], i) => {
          const Tag = tag as 'path';
          /* `stroke` and `strokeWidth` are dropped so the parent's win — see
             the note above. `key` is the package's own, and React wants ours. */
          const rest = Object.fromEntries(
            Object.entries(attrs).filter(([k]) => k !== 'stroke' && k !== 'strokeWidth' && k !== 'key'),
          );
          return <Tag key={i} {...rest} />;
        })}
      </svg>
    );
  };
}

/* ---- NAVIGATION -------------------------------------------------------- */
export const HomeIcon = make(Home01Icon);
export const WalletIcon = make(Wallet01Icon);
/** the perps header's wallet, drawn fuller than the tab bar's */
export const WalletFullIcon = make(Wallet03Icon);
export const SwapIcon = make(ArrowDataTransferHorizontalIcon);
export const CandlesIcon = make(ChartCandleIcon);
export const MenuIcon = make(DashboardSquare01Icon);

/* ---- ARROWS AND CHEVRONS ----------------------------------------------- */
export const ChevronDownIcon = make(ArrowDown01Icon);
export const ChevronRightIcon = make(ArrowRight01Icon);
export const ChevronLeftIcon = make(ArrowLeft01Icon);
/** Receive, and the two settlement arrows in swap */
export const ArrowDownIcon = make(ArrowDown02Icon);
/** the balance row's affordance — a full arrow, not a chevron */
export const ArrowRightIcon = make(ArrowRight02Icon);
/** fiat/token flip */
export const FlipIcon = make(ArrowUpDownIcon);
/** the perps unit toggle, $ against % */
export const UnitSwapIcon = make(ArrowLeftRightIcon);
/** swap again */
export const UndoIcon = make(ArrowTurnBackwardIcon);

/* ---- ACTIONS ----------------------------------------------------------- */
export const SendIcon = make(Navigation03Icon);
export const EarnIcon = make(ChartUpIcon);
export const ScanIcon = make(ScanGlyph);
export const EyeIcon = make(ViewIcon);
export const SearchIcon = make(Search01Icon);
export const CloseIcon = make(Cancel01Icon);
export const CheckIcon = make(Tick02Icon);
export const HelpIcon = make(HelpCircleIcon);
export const SlidersIcon = make(PreferenceHorizontalIcon);
export const LockCheckIcon = make(SquareLockCheck01Icon);
export const LineChartIcon = make(ChartLineIcon);
