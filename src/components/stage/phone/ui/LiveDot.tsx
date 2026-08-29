/**
 * The pulse next to data that is coming off a feed rather than out of a
 * database. One dot, and it is the cheapest possible way to say "this number is
 * not a screenshot".
 */
export function LiveDot() {
  return <i className="livedot" aria-hidden="true" />;
}
