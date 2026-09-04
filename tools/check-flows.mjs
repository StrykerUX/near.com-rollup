/**
 * DRIVE THE MACHINES WITHOUT A BROWSER
 * ==================================================================
 * The demo screens are state machines (src/components/stage/phone/flows), and
 * the interesting failures in them are not visual. This walks each one:
 *
 *   1 · every scripted beat that fires a transition must actually be ALLOWED
 *       by that transition's own guard. The script has to satisfy the same
 *       rules a reader does — that is the whole point of both pressing the
 *       same transitions — and this is what catches a script that types a
 *       stop loss the form is right to refuse. (It has, once.)
 *   2 · `restFrame` names a real beat, and `anchor` names real beats and real
 *       actions.
 *   3 · a breadth-first walk of FREE mode: from every reachable state, every
 *       transition the rail offers either applies or is honestly guarded, no
 *       `auto` fires into a refusal, and no screen is a trap with nothing on
 *       it to do.
 *
 * Run: pnpm check:flows
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const FLOWS = 'src/components/stage/phone/flows';
const DEMO = 'src/components/demo';
const SHELL = 'src/components/demo/shell';
/* [source file, name it is written out under] */
/* FOUR MACHINES, WHERE THERE WERE SEVENTEEN. The site was twenty routes and
   every one of them had a script worth walking; it is one route now, and what
   is left is the four chapters the tour actually plays. Every other entry in
   this list pointed at a file that no longer exists, which is what broke this
   checker the moment the routes came out. */
const MODULES = [
  [`${FLOWS}/machine.ts`, 'machine'],
  /* the tour's price table. Its own module because putting it in the account
     chapter made an import cycle — see the note in the file. */
  ['src/lib/prices.ts', 'prices'],
  [`${SHELL}/flow.ts`, 'flow'],
  /* the perps chapter — its own machine rather than a re-grouping of an older
     one: a different entry price, a book that starts with a position on it,
     and no passkey. */
  [`${DEMO}/perpsv5/state.ts`, 'perpsv5-state'],
  [`${DEMO}/perpsv5/script.ts`, 'perpsv5-script'],
  /* the swap chapter — a single form, and a catalogue long enough to be the
     point of one of its scenes */
  [`${DEMO}/swapv5/catalogue.ts`, 'swapv5-catalogue'],
  [`${DEMO}/swapv5/state.ts`, 'swapv5-state'],
  [`${DEMO}/swapv5/script.ts`, 'swapv5-script'],
  /* the account chapter — the tour's "Everything you own, one screen" */
  [`${DEMO}/ownv5/state.ts`, 'ownv5-state'],
  [`${DEMO}/ownv5/script.ts`, 'ownv5-script'],
  [`${DEMO}/earnv5/state.ts`, 'earnv5-state'],
  [`${DEMO}/earnv5/script.ts`, 'earnv5-script'],
];

/* The flow files are types plus plain data — no JSX, no bundler features — so
   a bare transpile is enough to run them under node. Only two imports survive
   the type erasure, and both are rewritten to the flat temp directory. */
const dir = mkdtempSync(join(tmpdir(), 'flows-'));
for (const [src, f] of MODULES) {
  const js = ts
    .transpileModule(readFileSync(src, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    })
    .outputText
    .replace(/from ['"](\.\/|@\/components\/stage\/phone\/flows\/)machine['"]/g, "from './machine.mjs'")
    .replace(/from ['"]@\/components\/demo\/shell\/flow['"]/g, "from './flow.mjs'")
    /* each demo's script imports `./state`; they are written out side by side,
       so the rewrite has to know which one it is looking at */
    .replace(/from ['"]\.\/state['"]/g, `from './${f.replace('-script', '')}-state.mjs'`)
    /* A CUT DOES NOT GET ITS OWN STATE. v2, v3 and every v4 name their flow's
       state module by its absolute path rather than importing a copy — that is
       the whole claim those versions make, that they are the same machine seen
       differently — so the rewrite has to resolve any feature's state, not
       just the one this rule was written for. */
    .replace(/from ['"]@\/components\/demo\/(\w+)\/state['"]/g, "from './$1-state.mjs'")
    /* the swap's catalogue is data beside its state, and its state imports it */
    .replace(/from ['"]\.\/catalogue['"]/g, "from './swapv5-catalogue.mjs'")
    /* the account chapter imports the swap's catalogue for NEAR's price */
    .replace(/from ['"]@\/components\/demo\/swapv5\/catalogue['"]/g, "from './swapv5-catalogue.mjs'")
    /* and everything that does arithmetic imports the price table */
    .replace(/from ['"]@\/lib\/prices['"]/g, "from './prices.mjs'");
  writeFileSync(join(dir, `${f}.mjs`), js);
}
const load = (f) => import(pathToFileURL(join(dir, `${f}.mjs`)).href);

const { applyBeat, stateAt } = await load('machine');
const machines = {
  'perps-v5': (await load('perpsv5-script')).perpsV5Flow.machine,
  'swap-v5': (await load('swapv5-script')).swapV5Flow.machine,
  'own-v5': (await load('ownv5-script')).ownV5Flow.machine,
  'earn-v5': (await load('earnv5-script')).earnV5Flow.machine,
};

let fail = 0;
const bad = (name, msg) => {
  console.log(`  ✗ ${name}: ${msg}`);
  fail++;
};

for (const [name, m] of Object.entries(machines)) {
  console.log(`\n== ${name} — ${m.beats.length} beats`);

  let s = { ...m.initial };
  const visits = [];
  m.beats.forEach((b, i) => {
    if (b.do && !m.actions[b.do](s, b.arg))
      bad(name, `beat ${i} (${b.do}) was REFUSED by its own guard`);
    s = applyBeat(m, s, b);
    if (s.screen !== visits[visits.length - 1]) visits.push(s.screen);
  });
  console.log('   script visits:', visits.join(' → '));

  if (m.restFrame < 0 || m.restFrame >= m.beats.length)
    bad(name, `restFrame ${m.restFrame} is not a beat`);
  else console.log('   restFrame:', m.restFrame, '→', stateAt(m, m.restFrame).screen);

  for (const [a, i] of Object.entries(m.anchor ?? {})) {
    if (!(a in m.actions)) bad(name, `anchor names unknown action "${a}"`);
    if (i < 0 || i >= m.beats.length) bad(name, `anchor ${a} → beat ${i} is not a beat`);
  }

  const seen = new Set();
  const queue = [{ ...m.initial }];
  while (queue.length && seen.size < 5000) {
    const st = queue.shift();
    const k = JSON.stringify(st);
    if (seen.has(k)) continue;
    seen.add(k);

    const opens = m.guided(st);
    const auto = m.auto?.(st);
    let live = 0;
    for (const a of opens) {
      const patch = m.actions[a](st, undefined);
      if (patch) {
        live++;
        queue.push({ ...st, ...patch });
      }
    }
    if (!live && !auto && !opens.length)
      bad(name, `dead end at screen "${st.screen}"`);
    if (auto) {
      const patch = m.actions[auto.do](st, auto.arg);
      if (!patch) bad(name, `auto "${auto.do}" is refused at screen "${st.screen}"`);
      else queue.push({ ...st, ...patch });
    }
  }
  console.log('   free-mode reachable states:', seen.size);
}

/* ==========================================================================
   4 · (RETIRED) THE MARKETING CUTS PLAYED THE SAME BEATS AS THEIR FLOWS
   --------------------------------------------------------------------------
   This walked four pairs — a long flow and the v4 re-cut of it — and asserted
   that the cut re-grouped beats without changing them, because a re-cut that
   dropped or reordered one would still typecheck, still build, and refuse
   silently on the third screen. It was a good assertion about a shape the site
   no longer has: both halves of all four pairs went with the demo routes. The
   number is left in the sequence so the checks below keep the ids they have
   always had in the log.
   ========================================================================== */


/* ==========================================================================
   5 · (RETIRED) THE TAKE PROFIT FILLED ON THE FRAME THE MARKET REACHED IT
   --------------------------------------------------------------------------
   Three numbers in three files had to agree: the chart's climb length
   (RAMP_CANDLES x CANDLE_MS, in real milliseconds), the deck's PACE, and the
   beat that closed the position. They drifted once — the beat was written in
   real milliseconds, the deck played it at PACE, and the order filled 5.6
   seconds after the market had traded through the line it was supposed to have
   closed at. Nothing about that was visible to a type checker.

   It walked `/demo/perps-v3` and `/demo/perps-v4`, and both are gone. The
   perps chapter that survives does not open a position against a climbing
   chart — it sets up a trade and stops — so the assertion has no subject
   rather than a new one. If a chapter ever fills an order off the chart again,
   this is the check to bring back, and the failure it caught is in the
   paragraph above.
   ========================================================================== */


/* ==========================================================================
   6 · THE SHORT CUT RUNS THE LENGTH IT SAYS IT DOES
   --------------------------------------------------------------------------
   `/demo/perps-v5` is commissioned to a length rather than to a feel, because
   a clip that runs a second and a half long is not a slightly long version of
   it — it is a different deliverable, and a feed does not forgive one. The
   length is not a number anywhere in the source: it is the sum of twenty-seven
   beats plus an outro, multiplied by the deck's PACE. Nothing about it is
   visible to a type checker, and every future edit to a beat changes it by
   exactly as much as nobody notices.

   It has grown twice, and both times because it could not be read. 10,000 put
   a press 115ms after the sheet it opened had finished arriving, so nothing on
   screen ever came to rest; 13,125 fixed the sheets and left the FIELDS with
   the same problem — a value landing and being built on in the same breath. So
   scene 2 now carries four silent beats, one after each value it sets, and its
   keystrokes are 160ms apart rather than 105. Another 800 is the third row of
   the order checklist finally being allowed to finish before the sheet closes,
   and 3,000 is the ending: five things land in that frame at once and two
   seconds was enough to see them, not to read them. The last 4,250 is the
   outro — the same dwell, on the loop's side of the seam.

   Enforced with a tolerance of one frame at 60Hz. Anything looser and the
   guard is decorative; anything tighter and rounding a beat to a round number
   would fail the build.
   ========================================================================== */
{
  const LIMIT = 24575;
  const TOL = 17;
  const PACE = Number(
    readFileSync('src/components/demo/shell/deck.ts', 'utf8').match(/const PACE = ([\d.]+);/)[1],
  );
  console.log('\n== the short cuts run the length they say they do');
  for (const [name, limit] of [['perps-v5', LIMIT], ['swap-v5', 23625], ['own-v5', 14400], ['earn-v5', 23600]]) {
    const m = machines[name];
    const authored = m.beats.reduce((t, b) => t + (b.ms ?? 0), 0) + (m.outro ?? 0);
    const real = Math.round(authored * PACE);
    console.log(`   ${name}: ${authored}ms authored x ${PACE} = ${real}ms on screen`);
    if (Math.abs(real - limit) > TOL)
      bad(name, `runs ${real}ms, and the brief is ${limit}ms. `
        + `The budget is ${Math.round(limit / PACE)}ms of authored beats, outro included — `
        + `this script authors ${authored}.`);
  }
}

console.log(fail ? `\n${fail} problem(s)` : '\nall machines clean');
process.exit(fail ? 1 : 0);
