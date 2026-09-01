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
const MODULES = [
  [`${FLOWS}/machine.ts`, 'machine'],
  [`${SHELL}/flow.ts`, 'flow'],
  [`${FLOWS}/perps.ts`, 'perps'],
  [`${FLOWS}/swap.ts`, 'swap'],
  [`${FLOWS}/earn.ts`, 'earn'],
  [`${FLOWS}/account.ts`, 'account'],
  /* the standalone /demo/perps machine — same contract, its own arc */
  [`${DEMO}/perps/state.ts`, 'perps-state'],
  [`${DEMO}/perps/script.ts`, 'perps-script'],
  [`${DEMO}/perpsv2/script.ts`, 'perpsv2-script'],
  [`${DEMO}/perpsv3/script.ts`, 'perpsv3-script'],
  [`${DEMO}/perpsv4/script.ts`, 'perpsv4-script'],
  /* the short cut, which is its OWN machine rather than a re-grouping
     of the one above it — a different entry price, a book that starts with a
     position on it, and no passkey. Walked for exactly that reason. */
  [`${DEMO}/perpsv5/state.ts`, 'perpsv5-state'],
  [`${DEMO}/perpsv5/script.ts`, 'perpsv5-script'],
  [`${DEMO}/swap/state.ts`, 'swap-state'],
  [`${DEMO}/swap/script.ts`, 'swap-script'],
  [`${DEMO}/earn/state.ts`, 'earn-state'],
  [`${DEMO}/earn/script.ts`, 'earn-script'],
  [`${DEMO}/condeposit/state.ts`, 'condeposit-state'],
  [`${DEMO}/condeposit/script.ts`, 'condeposit-script'],
  [`${DEMO}/consend/state.ts`, 'consend-state'],
  [`${DEMO}/consend/script.ts`, 'consend-script'],
  /* the marketing cuts. Each one is the same machine as the flow above it,
     re-grouped into eight or so moments — which is exactly why they are worth
     walking: a re-cut that dropped or reordered a beat would still typecheck,
     still build, and refuse silently on the third screen. */
  [`${DEMO}/swapv4/script.ts`, 'swapv4-script'],
  [`${DEMO}/earnv4/script.ts`, 'earnv4-script'],
  [`${DEMO}/condepositv4/script.ts`, 'condepositv4-script'],
  [`${DEMO}/consendv4/script.ts`, 'consendv4-script'],
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
    .replace(/from ['"]@\/components\/demo\/(\w+)\/state['"]/g, "from './$1-state.mjs'");
  writeFileSync(join(dir, `${f}.mjs`), js);
}
const load = (f) => import(pathToFileURL(join(dir, `${f}.mjs`)).href);

const { applyBeat, stateAt } = await load('machine');
const machines = {
  perps: (await load('perps')).perps,
  swap: (await load('swap')).swap,
  earn: (await load('earn')).earn,
  account: (await load('account')).account,
  'demo/perps': (await load('perps-script')).perpsFlow.machine,
  'demo/perps-v2': (await load('perpsv2-script')).perpsV2Flow.machine,
  'demo/perps-v3': (await load('perpsv3-script')).perpsV3Flow.machine,
  'demo/perps-v4': (await load('perpsv4-script')).perpsV4Flow.machine,
  'demo/perps-v5': (await load('perpsv5-script')).perpsV5Flow.machine,
  'demo/swap': (await load('swap-script')).swapFlow.machine,
  'demo/earn': (await load('earn-script')).earnFlow.machine,
  'demo/confidential-deposit': (await load('condeposit-script')).conDepositFlow.machine,
  'demo/confidential-send': (await load('consend-script')).conSendFlow.machine,
  'demo/swap-v4': (await load('swapv4-script')).swapV4Flow.machine,
  'demo/earn-v4': (await load('earnv4-script')).earnV4Flow.machine,
  'demo/confidential-deposit-v4': (await load('condepositv4-script')).conDepositV4Flow.machine,
  'demo/confidential-send-v4': (await load('consendv4-script')).conSendV4Flow.machine,
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
   4 · A MARKETING CUT IS THE SAME FLOW, RE-GROUPED
   --------------------------------------------------------------------------
   Each v4 is the same machine as the flow it was cut from, with the steps
   merged into eight or so moments. That means its beats must be the SAME
   beats, in the SAME order — a cut is where the step boundaries fall, not a
   different set of gestures. A re-cut that quietly dropped a beat, or typed a
   different figure, or pressed two things in the other order would still
   typecheck and still build, and would refuse on some screen halfway through
   where nobody is looking for the cause.
   Only beats that DO something are compared: a cut is free to hold longer,
   and free to add a silent beat at the end to hold on its last frame.
   ========================================================================== */
{
  const PAIRS = [
    ['demo/swap', 'demo/swap-v4'],
    ['demo/earn', 'demo/earn-v4'],
    ['demo/confidential-deposit', 'demo/confidential-deposit-v4'],
    ['demo/confidential-send', 'demo/confidential-send-v4'],
  ];
  const gestures = (m) => m.beats.filter((b) => b.do).map((b) => b.do + (b.arg === undefined ? '' : `:${b.arg}`));
  console.log('\n== marketing cuts play the same beats as the flows they are cut from');
  for (const [base, cut] of PAIRS) {
    const a = gestures(machines[base]);
    const b = gestures(machines[cut]);
    const i = a.findIndex((x, n) => x !== b[n]);
    if (a.length !== b.length || i !== -1) {
      const at = i === -1 ? Math.min(a.length, b.length) : i;
      bad(cut, `beat ${at + 1} of ${base} is "${a[at] ?? '(end)'}" but the cut plays `
        + `"${b[at] ?? '(end)'}" — a cut re-groups beats, it does not change them`);
    } else {
      console.log(`   ${cut}: ${a.length} gestures, ${machines[cut].beats.length} beats, `
        + `${machines[base].beats.length} in ${base} — same gestures, ${machines[cut].beats.length - a.length} holds`);
    }
  }
}

/* ==========================================================================
   5 · THE TAKE PROFIT FILLS ON THE FRAME THE MARKET REACHES IT
   --------------------------------------------------------------------------
   Three numbers in three files have to agree: the chart's climb length
   (RAMP_CANDLES x CANDLE_MS, in real milliseconds), the deck's PACE, and the
   beat that closes the position. They drifted once already — the beat was
   written in real milliseconds, the deck played it at PACE, and the order
   filled 5.6 seconds after the market had traded through the line it was
   supposed to have closed at. Nothing about that is visible to a type checker
   and it looks almost right on screen, which is the worst way for it to fail.
   ========================================================================== */
{
  const chart = readFileSync('src/components/stage/phone/ui/Chart.tsx', 'utf8');
  const CANDLE_MS = Number(chart.match(/const CANDLE_MS = (\d+);/)[1]);
  const RAMP_N = chart.match(/const RAMP = \[([\s\S]*?)\];/)[1]
    .split(',').filter((x) => /-?\d/.test(x)).length;
  const PACE = Number(
    readFileSync('src/components/demo/shell/deck.ts', 'utf8').match(/const PACE = ([\d.]+);/)[1],
  );
  /* the climb, in the units a beat is written in */
  const climb = (RAMP_N * CANDLE_MS) / PACE;
  console.log(`\n== take profit timing — climb is ${RAMP_N} x ${CANDLE_MS}ms, ${climb}ms of script time`);

  for (const name of ['demo/perps-v3', 'demo/perps-v4']) {
    const m = machines[name];
    let st = { ...m.initial };
    let t = 0, openedAt = null, filledAt = null;
    for (const b of m.beats) {
      t += b.ms ?? 0;
      if (b.do) {
        const patch = m.actions[b.do]?.(st, b.arg);
        if (patch) st = { ...st, ...patch };
      }
      if (openedAt === null && st.pos) openedAt = t;
      if (filledAt === null && st.filled) filledAt = t;
    }
    if (openedAt === null) { bad(name, 'no position is ever opened'); continue; }
    if (filledAt === null) { bad(name, 'the take profit never fills'); continue; }
    const gap = filledAt - openedAt;
    if (gap !== climb)
      bad(name, `fills ${gap}ms after the open, but the climb is ${climb}ms — `
        + (gap > climb ? 'the market trades past the line before the order closes'
                       : 'the order closes before the market gets there'));
    else console.log(`   ${name}: opens at ${openedAt}ms, fills at ${filledAt}ms — on the frame`);
  }
}

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
  const m = machines['demo/perps-v5'];
  const authored = m.beats.reduce((t, b) => t + (b.ms ?? 0), 0) + (m.outro ?? 0);
  const real = Math.round(authored * PACE);
  console.log(`\n== the short cut runs the length it says it does\n`
    + `   demo/perps-v5: ${authored}ms authored x ${PACE} = ${real}ms on screen`);
  if (Math.abs(real - LIMIT) > TOL)
    bad('demo/perps-v5', `runs ${real}ms, and the brief is ${LIMIT}ms. `
      + `The budget is ${Math.round(LIMIT / PACE)}ms of authored beats, outro included — `
      + `this script authors ${authored}.`);
}

console.log(fail ? `\n${fail} problem(s)` : '\nall machines clean');
process.exit(fail ? 1 : 0);
