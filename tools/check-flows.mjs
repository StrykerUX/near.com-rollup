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
  [`${DEMO}/swap/state.ts`, 'swap-state'],
  [`${DEMO}/swap/script.ts`, 'swap-script'],
  [`${DEMO}/earn/state.ts`, 'earn-state'],
  [`${DEMO}/earn/script.ts`, 'earn-script'],
  [`${DEMO}/condeposit/state.ts`, 'condeposit-state'],
  [`${DEMO}/condeposit/script.ts`, 'condeposit-script'],
  [`${DEMO}/consend/state.ts`, 'consend-state'],
  [`${DEMO}/consend/script.ts`, 'consend-script'],
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
    /* v2 shares the long version's state module rather than copying it */
    .replace(/from ['"]@\/components\/demo\/perps\/state['"]/g, "from './perps-state.mjs'");
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
  'demo/swap': (await load('swap-script')).swapFlow.machine,
  'demo/earn': (await load('earn-script')).earnFlow.machine,
  'demo/confidential-deposit': (await load('condeposit-script')).conDepositFlow.machine,
  'demo/confidential-send': (await load('consend-script')).conSendFlow.machine,
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
   4 · THE TAKE PROFIT FILLS ON THE FRAME THE MARKET REACHES IT
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

console.log(fail ? `\n${fail} problem(s)` : '\nall machines clean');
process.exit(fail ? 1 : 0);
