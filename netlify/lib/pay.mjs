import { createHmac, timingSafeEqual } from "node:crypto";
// PRICES LIVE ONLY HERE ON THE SERVER. The browser can never choose an amount.
export const PACKS = {
  A: { n: "Pocket money", naira: 500, cash: 50000 },
  B: { n: "Small cash", naira: 1000, cash: 150000 },
  C: { n: "Cash bag", naira: 2000, cash: 400000 },
  D: { n: "Big bag", naira: 5000, cash: 1500000 },
  E: { n: "Boss", naira: 10000, cash: 4000000 },
  F: { n: "Tycoon", naira: 20000, cash: 10000000 },
  G: { n: "Millionaire", naira: 50000, cash: 30000000 },
  H: { n: "Richest man in Heirloom", naira: 100000, cash: 75000000 },
};
// Friday Mega Deal: every Friday (Lagos time, UTC+1) all packs cost 30% less in Naira.
export const FRIDAY_OFF = 0.3;
export function isFriday(now = Date.now()) { return new Date(now + 3600000).getUTCDay() === 5; }
export function nairaNow(pk, now = Date.now()) { return isFriday(now) ? Math.round(pk.naira * (1 - FRIDAY_OFF)) : pk.naira; }
export const SECRET = () => process.env.PAYSTACK_SECRET_KEY || "";
export const enabled = () => /^sk_(live|test)_[A-Za-z0-9]+$/.test(SECRET());
export async function paystack(path, init = {}) {
  const r = await fetch("https://api.paystack.co" + path, { ...init, headers: { authorization: "Bearer " + SECRET(), "content-type": "application/json", ...(init.headers || {}) } });
  return r.json().catch(() => ({}));
}
export function validSignature(raw, sig) {
  if (!enabled() || !sig) return false;
  const h = createHmac("sha512", SECRET()).update(raw).digest("hex");
  const a = Buffer.from(h), b = Buffer.from(String(sig));
  return a.length === b.length && timingSafeEqual(a, b);
}
// Ask Paystack (not the browser) whether this payment really happened, then credit the account ONCE.
export async function settle(store, ref) {
  ref = String(ref || "").replace(/[^A-Za-z0-9_\-]/g, "").slice(0, 60);
  const rec = await store.get("pay-" + ref, { type: "json" }).catch(() => null);
  if (!rec) return { ok: false, error: "Unknown payment" };
  if (rec.done) return { ok: true, already: true };
  const v = await paystack("/transaction/verify/" + encodeURIComponent(ref));
  const d = v && v.data;
  const pk = PACKS[rec.pack];
  if (!v.status || !d || d.status !== "success" || !pk) return { ok: false, error: "Payment not completed yet" };
  if (d.amount !== (rec.naira || pk.naira) * 100 || d.currency !== "NGN" || d.reference !== ref) return { ok: false, error: "Payment amount mismatch" };
  try { const lk = await store.set("lock-" + ref, "1", { onlyIfNew: true }); if (lk && lk.modified === false) return { ok: true, already: true }; } catch (e) {} // only one caller may credit
  rec.done = true; await store.setJSON("pay-" + ref, rec); // mark first: never credit twice
  const ck = "credit-" + rec.id;
  const list = (await store.get(ck, { type: "json" }).catch(() => null)) || [];
  if (list.some((c) => c.ref === ref)) return { ok: true, already: true };
  list.push({ ref, cash: pk.cash, n: pk.n });
  await store.setJSON(ck, list.slice(-50));
  const mk = "meta-" + rec.id, meta = (await store.get(mk, { type: "json" }).catch(() => null)) || { money: 0, t: 0, paid: 0, paidSeen: 0, strikes: 0, first: true };
  try { const rv = (await store.get("revenue", { type: "json" }).catch(() => null)) || { naira: 0, count: 0, days: {} }; const dk = new Date(Date.now() + 3600000).toISOString().slice(0, 10), amt = rec.naira || pk.naira; rv.naira += amt; rv.count += 1; rv.days[dk] = (rv.days[dk] || 0) + amt; for (const k of Object.keys(rv.days).sort().slice(0, -30)) delete rv.days[k]; await store.setJSON("revenue", rv); } catch (e) {}
  meta.paid = (meta.paid || 0) + pk.cash; await store.setJSON(mk, meta); // tells the anti-cheat this extra cash is legitimate
  return { ok: true };
}
