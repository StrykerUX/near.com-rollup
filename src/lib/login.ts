/**
 * WHERE THE SIGNUP LIVES, AND IT IS ONE STRING.
 *
 * `uykzkl1o` IS A CODE near.com ISSUED. It is opaque by design — eight
 * characters that mean nothing on their own and everything in their database,
 * which is where the account, the fee share and the 20% rebate are all keyed
 * from. DO NOT CONCATENATE TO IT, derive from it, parse it, or replace it with
 * a name that reads better. A code with anything appended is not a code near
 * .com knows, and it fails the way an unregistered one fails: silently, with a
 * link that still works, a page that still loads, and nothing attributed.
 *
 * THAT IS NOT HYPOTHETICAL. This file exists because the ref was `therollup` —
 * a placeholder nobody had checked — and because a hook then rewrote it to
 * `therollup-nearperps` at hydration to carry the door the reader came through.
 * Both were invalid, and near.com saw two different wrong values depending on
 * whether their page had hydrated yet. Weeks of signups went unattributed.
 *
 * THE UTM TAGS ARE THEIRS, NOT OURS. They belong to near.com's own analytics,
 * tagging the traffic this landing page sends them, and they arrived with the
 * code in the same message. Our own campaign measurement is separate and never
 * touches this url — see `lib/analytics.ts`.
 *
 * IT IS SHARED RATHER THAN REPEATED, and that is the other half of the fix.
 * This string was declared in six components, byte-identical and with no import
 * between them, which is precisely what let the served markup and the hydrated
 * href drift apart without anything failing. One export, six importers, one
 * place to change when the campaign does.
 */
export const LOGIN_URL =
  'https://near.com/login?ref=uykzkl1o' +
  '&utm_source=perpscampaign&utm_medium=landing&utm_campaign=near_q3_perps';
