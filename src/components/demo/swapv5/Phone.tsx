'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { Count } from '@/components/demo/shell/Count';
import { Layer } from '@/components/demo/shell/Frame';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import { TOK_ICONS } from '@/lib/tokens';
import { CATALOGUE, type Asset } from './catalogue';
import {
  FROM_BAL, SWAP_STEPS, cta, least, out, rate, usd, type SV, type SVAction,
} from './state';

type Deck = GenericDeck<SV, SVAction>;

/**
 * SWAP v5 — THE DEVICE
 * ==================================================================
 * The same device as `/demo/perps-v5`: `.pdev.app` carries the face, the
 * palette, the tempo, the chrome, the fields, the sheets and the CTA, so this
 * file only draws what is actually a swap. That class was `.pdev.btc` while
 * perps was the only screen wearing it — a name that would have been a lie
 * here, on the first screen with no BTC chart in it.
 *
 * WHAT IS NEW is the picker, and it is new because nothing else in this repo
 * has had to make a list feel long. Everything else — the amount field, the
 * checklist, the primary button, the sheet mechanics — is the shared vocabulary
 * doing its job.
 */

const ROW = 56;

/**
 * The token chip. Brand colour behind an initial — which is what the app does
 * for every asset it has no mark for, and the honest thing for twenty-seven
 * rows nobody has drawn icons for.
 *
 * BITCOIN IS THE EXCEPTION because the repo has its artwork already: it is the
 * one asset a reader knows by heart, and a `B` on orange where the real mark
 * exists is a worse lie than a `D` on gold where none does.
 */
function Dot({ a, size = 30 }: { a: Asset; size?: number }) {
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
      {art && 'img' in art
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="swimg" src={art.img} alt="" width={size} height={size} aria-hidden="true" />
        : a.sym.charAt(0)}
    </span>
  );
}

export function Phone({ d }: { d: Deck }) {
  return (
    <div className="pdev app swp" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      <Chrome />
      <div className="pdview">
        <Swap d={d} />
      </div>
      <Picker d={d} />
    </div>
  );
}

/* ---- the chrome -------------------------------------------------------- */

function Chrome() {
  return (
    <div className="bchrome">
      <span className="bback" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5L8 12l6.5 6.5" /></svg>
      </span>
      <span className="swtitle">Swap</span>
      <span className="bspace" />
      <span className="bwallet" aria-hidden="true">
        {/* lucide `settings-2` (ISC) — the app's own affordance on this screen */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7h-9" /><path d="M14 17H5" />
          <circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
        </svg>
      </span>
    </div>
  );
}

/* ---- the form ---------------------------------------------------------- */

function Swap({ d }: { d: Deck }) {
  const { s } = d;
  const c = cta(s);
  const from = CATALOGUE.find((a) => a.sym === s.from)!;
  const to = s.to ? CATALOGUE.find((a) => a.sym === s.to)! : null;
  const open = d.can('picker');

  if (s.done) return <Done d={d} to={to} />;

  return (
    <div className="swform">
      {/* ---- the source, already chosen ---- */}
      <div className="swfield">
        <span className="swlab">You pay</span>
        <div className="swrow">
          <span className={'swfin' + (s.focus === 'amount' ? ' on' : '')}
                data-tap={s.focus === 'amount' ? 'field' : undefined}>
            <b>{s.amount || '0'}</b>
            {s.focus === 'amount' ? <i className="bcaret" /> : null}
          </span>
          {/* THE TOKEN IS NOT A PICKER HERE. The reader chose it on the home
              screen by tapping the asset, which is the whole reason this form
              opens half-filled; offering to change it would be offering to
              undo the gesture that got them here.

              `given`, and it was `fixed` for one commit. `.fixed` is a TAILWIND
              UTILITY — `position: fixed` — so the chip left the flow and landed
              on top of the amount it was supposed to sit beside. The ported
              stylesheets outrank Tailwind because they are imported unlayered,
              but only where they SET the property, and nothing here set
              `position`. A modifier named after a utility is a rule you did not
              write and cannot see. */}
          <span className="swtok given">
            <Dot a={from} size={26} /><b>{from.sym}</b>
          </span>
        </div>
        <span className="swsub">
          <i>{usd(s) > 0 ? '$' + fmt(usd(s), 2) : '$0.00'}</i>
          <em>Balance {FROM_BAL} {from.sym}</em>
        </span>
      </div>

      {/* the swap arrow, which is chrome rather than a control on this cut */}
      <span className="swarrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
        </svg>
      </span>

      {/* ---- the destination, empty and waiting ---- */}
      <div className="swfield">
        <span className="swlab">You receive</span>
        <div className="swrow">
          <span className="swfin quiet">
            {to ? <Count value={out(s)} dp={4} /> : <b className="off">0</b>}
          </span>
          <span className={'swtok' + (to ? ' picked' : ' empty') + live(open)}
                {...press(open)} data-tap="to">
            {to ? <><Dot a={to} size={26} /><b>{to.sym}</b></> : <b>Select token</b>}
            <svg className="bcv" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
        <span className="swsub">
          <i>{to ? '$' + fmt(usd(s), 2) : '—'}</i>
        </span>
      </div>

      {/* ---- what the quote actually says ---- */}
      {to && usd(s) > 0 ? (
        <Enter k={`q${s.to}`} className="swquote">
          <div><dt>Rate</dt><dd>1 {s.from} = {fmt(rate(s), 2)} {to.sym}</dd></div>
          <div><dt>Least you receive</dt><dd>{fmt(least(s), 4)} {to.sym}</dd></div>
          <div><dt>Network</dt><dd>Best route, auto</dd></div>
        </Enter>
      ) : null}

      {s.submitting ? (
        <>
          <span className="bcta off"><i className="bspin" /></span>
          <div className="bochk"><ProgressList steps={SWAP_STEPS} at={s.step} /></div>
        </>
      ) : (
        <span className={'bcta' + (c.ok ? '' : ' off') + live(d.can('confirm'))}
              {...press(d.can('confirm'))} data-tap="confirm">{c.label}</span>
      )}
    </div>
  );
}

/* ---- the success state -------------------------------------------------- */

function Done({ d, to }: { d: Deck; to: Asset | null }) {
  const { s } = d;
  if (!to) return null;
  return (
    <Enter k={`d${d.pass}`} className="swdone">
      <span className="swtick" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
             strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
      <b className="swdoneh">Swap complete</b>
      <span className="swdonev">{fmt(out(s), 4)} {to.sym}</span>
      <i className="swdonep">for {s.amount} {s.from}</i>

      <dl className="swdoned">
        <div><dt>Rate</dt><dd>1 {s.from} = {fmt(rate(s), 2)} {to.sym}</dd></div>
        <div><dt>Value</dt><dd>${fmt(usd(s), 2)}</dd></div>
      </dl>
    </Enter>
  );
}

/* ---- the picker, and the only new idea on this screen ------------------- */

/**
 * THE LIST HAS TO FEEL LONG, which is a different job from being long.
 *
 * It is twenty-seven rows and only six fit, so the honest way to say so is to
 * move it: `s.at` is a row index and the track is translated by it, with a CSS
 * transition doing the travel. Three stops rather than one glide — a single
 * continuous move reads as one fact, and what a reader should come away with
 * is that there was more every time they looked.
 *
 * The scrollbar is drawn rather than native. A native one would be the browser
 * disagreeing with the phone about what a scrollbar looks like, on a screen
 * whose whole claim is that it is a copy of an app.
 */
function Picker({ d }: { d: Deck }) {
  const { s } = d;
  const rows = CATALOGUE;
  const span = Math.max(1, rows.length - 6);
  const frac = Math.min(1, s.at / span);

  return (
    <Layer open={s.picker} onScrim={d.can('closePicker')}>
      <div className="dsheet swpick">
        <span className="dgrab" />
        <b className="swpickh">Select a token</b>

        <div className="swlistwrap">
          <div className="swlist" style={{ transform: `translateY(${-s.at * ROW}px)` }}>
            {rows.map((a) => {
              const pick = d.can('pick', a.sym);
              const self = a.sym === s.from;
              return (
                <span className={'switem' + (self ? ' self' : '') + live(pick)} key={a.sym}
                      {...press(pick)} data-tap={'pick:' + a.sym}>
                  <Dot a={a} />
                  <span className="switemt"><b>{a.sym}</b><em>{a.name}</em></span>
                  {self ? <i className="swself">You pay this</i> : null}
                </span>
              );
            })}
          </div>
          {/* the rail, drawn — see the note above */}
          <span className="swrail" aria-hidden="true">
            <i style={{ top: `${frac * 100}%`, translate: `0 -${frac * 100}%` }} />
          </span>
        </div>
      </div>
    </Layer>
  );
}
