import { AppDevice } from './AppDevice';

/**
 * THE DEVICE ON THE STAGE.
 *
 * `.morph` is not a card. It keeps its id and every transform the stage engine
 * writes to it — `--card-y` (the peek), `--card-s` (the plate shrink),
 * `--card-pk`, `--card-o` — so the entry, the recede and the fade all still
 * happen to it. What it is not is a SURFACE: 25-home-app.css strips the glass,
 * the border, the halo and the clip, because the object on the page is
 * `/demo/perps-v5`'s device at its own size.
 *
 * IT USED TO BE TWO SHELLS AND A BRANCH. The other one was a chrome plus a
 * four-card viewport — one header, one tab bar, and `PerpsFace`, `AccountFace`,
 * `SwapFace` and `EarnFace` sliding inside it — and the branch that chose
 * between them read a `deck` prop that only `/home-v2` ever set to anything.
 * With that route gone nothing could reach it: the import was still there, so
 * five components and their stylesheet shipped in every bundle to render a
 * screen no URL could ask for.
 *
 * The comment that branch carried is worth keeping, because it is the reason
 * this file is one line now: `.cswap` gave 547px and the device lays out 763,
 * so fitting the real screen into the plate meant dropping the chrome, the time
 * axis and the ticket's sheet — a different screen wearing the same palette.
 * The point of putting this screen on this page is to look at THAT screen.
 */
export function PhoneShell() {
  return (
    <div className="morph appmorph" id="morph">
      <AppDevice />
    </div>
  );
}
