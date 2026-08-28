'use client';
import { useEffect, useRef } from 'react';
import { fmt } from '@/lib/format';
import { seedNum, setNum } from './useAnimatedFigure';
import { IconSlippage, IconSwapDir } from './icons';
import { TokenDot } from './TokenDot';
import { useSwap } from './swapState';

/**
 * 2 · SWAP.
 *
 * Everything derived from (from, to, amount) is plain JSX. The two amount
 * fields are the exception: they are contentEditable and driven through refs,
 * because re-rendering the field the user is typing in moves the caret and
 * clobbers the keystroke. That is the same rule the original enforced with
 * `document.activeElement !== swSend`.
 *
 * The picker itself is not here — see TokenMenu and swapState for why.
 */
export function SwapFace() {
  const { from, to, amt, out, openSide, setAmt, toggleSide, flip } = useSwap();

  const sendRef = useRef<HTMLSpanElement>(null);
  const recvRef = useRef<HTMLSpanElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);

  /* ---- the two editable figures ---------------------------------------- */
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.activeElement !== sendRef.current)
      setNum(sendRef.current, amt, (v) => fmt(v, amt < 1 ? 6 : 0), reduce);
    if (document.activeElement !== recvRef.current)
      setNum(recvRef.current, out, (v) => fmt(v, out < 1 ? 6 : to.dp), reduce);
  }, [amt, out, to.dp]);

  /* ---- typing ----------------------------------------------------------- */
  const onAmountInput = (el: HTMLSpanElement | null, isFrom: boolean) => {
    if (!el) return;
    let v = parseFloat((el.textContent || '').replace(/[^0-9.]/g, ''));
    if (isNaN(v)) v = 0;
    /* the user just typed this number — sync the tween base so the blur
       reformat is instant instead of animating their own input at them */
    seedNum(el, v);
    setAmt(isFrom ? v : (v * to.price) / from.price);
  };

  /* Reformat on blur, not on every keystroke: while the field has focus the
     user's own text is the truth, and rewriting it would move the caret. The
     effect above skips the focused field for the same reason, and it does not
     re-run on blur — so blur has to ask for the write itself. */
  const reformat = () => {
    setNum(sendRef.current, amt, (v) => fmt(v, amt < 1 ? 6 : 0), true);
    setNum(recvRef.current, out, (v) => fmt(v, out < 1 ? 6 : to.dp), true);
  };

  /* ---- the flip chip's notch ------------------------------------------- */
  useSwapNotch(faceRef);

  const rate = to.price / from.price; /* 1 <to> costs N <from> */

  return (
    <div className="face" data-face="1" ref={faceRef}>
      <div className="swfield">
        <div className="swtop">
          <span
            className="swamt"
            id="swSend"
            ref={sendRef}
            contentEditable
            suppressContentEditableWarning
            inputMode="decimal"
            spellCheck={false}
            role="textbox"
            aria-label="Amount to send"
            onInput={(e) => onAmountInput(e.currentTarget, true)}
            onBlur={reformat}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
            }}
          />
          <button
            className="picker"
            id="pkFrom"
            data-side="from"
            aria-expanded={openSide === 'from'}
            aria-haspopup="listbox"
            onClick={(e) => { e.stopPropagation(); toggleSide('from'); }}
          >
            <TokenDot token={from} />
            <span className="sym">{from.sym}</span>
            <span className="car">▼</span>
          </button>
        </div>
        <div className="swsub">
          <span className="su">
            <span id="swSendUsd">${fmt(amt * from.price, 2)}</span> <IconSwapDir />
          </span>
          <span id="swFromBal">{fmt(from.bal || 0)} {from.sym}</span>
        </div>
      </div>

      <div className="swmid">
        <button className="rot" id="swFlip" aria-label="Flip tokens" onClick={flip}>↓</button>
      </div>

      <div className="swfield">
        <div className="swtop">
          <span
            className="swamt"
            id="swRecv"
            ref={recvRef}
            contentEditable
            suppressContentEditableWarning
            inputMode="decimal"
            spellCheck={false}
            role="textbox"
            aria-label="Amount to receive"
            onInput={(e) => onAmountInput(e.currentTarget, false)}
            onBlur={reformat}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
            }}
          />
          <button
            className="picker"
            id="pkTo"
            data-side="to"
            aria-expanded={openSide === 'to'}
            aria-haspopup="listbox"
            onClick={(e) => { e.stopPropagation(); toggleSide('to'); }}
          >
            <TokenDot token={to} />
            <span className="sym">{to.sym}</span>
            <span className="car">▼</span>
          </button>
        </div>
        <div className="swsub">
          <span className="su" id="swRecvUsd">${fmt(out * to.price, 2)}</span>
          <span id="swToBal">{fmt(to.bal || 0)} {to.sym}</span>
        </div>
      </div>

      <button className="swreview" type="button">Review trade</button>

      <div className="swrows">
        <div className="swrow">
          <span>Exchange rate</span>
          <b id="swRate">1 {to.sym} = {fmt(rate, 5)} {from.sym}</b>
        </div>
        <div className="swrow">
          <span>Max slippage <span className="qm">?</span></span>
          <span className="slipchip">0.50% <IconSlippage /></span>
        </div>
        <div className="swrow">
          <span>Receive at least <span className="qm">?</span></span>
          <b id="swMin">{fmt(out * 0.995, out < 1 ? 6 : to.dp)} {to.sym}</b>
        </div>
      </div>

    </div>
  );
}

/**
 * THE FLIP CHIP CUTS OUT OF THE VALUE BOXES.
 *
 * The chip overlaps both `.swfield` cards; being translucent, the card surfaces
 * used to read through it. Each neighbour gets an alpha mask with a rounded
 * hole matching the chip plus a 3.5px ring, so the chip sits in a real notch
 * and the shell shows through around it — the app's own cutout language.
 *
 * Geometry is measured in LAYOUT space (the offset chain, immune to the
 * peek/shrink transforms) and re-derived on resize, because the chip is 36px on
 * desktop and 30px at tight shells.
 */
function useSwapNotch(faceRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let timer = 0;
    const run = () => {
      const face = faceRef.current;
      const mid = face?.querySelector<HTMLElement>('.swmid');
      if (!face || !mid) return;
      const rot = mid.querySelector<HTMLElement>('.rot');
      const up = mid.previousElementSibling as HTMLElement | null;
      const dn = mid.nextElementSibling as HTMLElement | null;
      if (!rot || !up || !dn) return;

      const pos = (el: HTMLElement | null) => {
        let x = 0, y = 0;
        for (let n = el; n && n !== face; n = n.offsetParent as HTMLElement | null) {
          x += n.offsetLeft;
          y += n.offsetTop;
        }
        return { x, y };
      };
      const rp = pos(rot);
      const pad = 3.5;
      const r = (parseFloat(getComputedStyle(rot).borderRadius) || 11) + pad;
      const w = rot.offsetWidth + pad * 2;
      const h = rot.offsetHeight + pad * 2;

      [up, dn].forEach((fl) => {
        const fp = pos(fl);
        const x = rp.x - fp.x - pad;
        const y = rp.y - fp.y - pad;
        const W = fl.offsetWidth;
        const H = fl.offsetHeight;
        const d =
          `M0 0H${W}V${H}H0Z` +
          `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
          `a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}` +
          `a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}` +
          `a${r} ${r} 0 0 1 ${r} -${r}Z`;
        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
          `<path fill-rule="evenodd" fill="#000" d="${d}"/></svg>`;
        const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
        fl.style.maskImage = url;
        fl.style.webkitMaskImage = url;
        fl.style.maskSize = fl.style.webkitMaskSize = '100% 100%';
        fl.style.maskRepeat = fl.style.webkitMaskRepeat = 'no-repeat';
      });
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(run, 180);
    };
    run();
    addEventListener('load', run);
    addEventListener('resize', onResize);
    return () => {
      removeEventListener('load', run);
      removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [faceRef]);
}
