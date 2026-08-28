/**
 * The sequential checklist the app shows while something settles: a swap
 * routing, a deposit confirming, an order submitting.
 *
 * Three states per row, and they are the whole point of the component:
 *   done     a filled green check
 *   active   a spinning arc, label in full white
 *   pending  an empty ring, label dimmed
 *
 * The connecting rail between the rows fills as the list advances, so it reads
 * as one thing progressing rather than three unrelated rows lighting up.
 */
export type StepState = 'done' | 'active' | 'pending';

export function ProgressList({ steps, at }: { steps: string[]; at: number }) {
  return (
    <ol className="plist">
      {steps.map((label, i) => {
        const state: StepState = i < at ? 'done' : i === at ? 'active' : 'pending';
        return (
          <li className="pstep" data-state={state} key={label}>
            <span className="pmark" aria-hidden="true">
              {state === 'done' ? (
                <svg viewBox="0 0 20 20" className="pcheck">
                  <circle cx="10" cy="10" r="9" />
                  <path d="M5.8 10.3l2.7 2.7 5.7-5.7" fill="none" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : state === 'active' ? (
                <svg viewBox="0 0 20 20" className="pspin">
                  <circle cx="10" cy="10" r="8" className="ptrack" />
                  <circle cx="10" cy="10" r="8" className="parc" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="pring">
                  <circle cx="10" cy="10" r="8" />
                </svg>
              )}
            </span>
            <span className="plabel">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
