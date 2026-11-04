import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";
import { J, ipOf, over, body } from "../lib/sec.mjs";
// Owner-only: list flagged cheaters / un-suspend by 8-letter id. Needs the ADMIN_KEY environment variable (a long random password you choose).
export default async (req) => {
  if (req.method !== "POST") return J({ error: "post" }, 405);
  const store = getStore("heirloom");
  if (await over(store, "adm-" + ipOf(req), 10, 3600000)) return J({ error: "no" }, 429);
  let b; try { b = await body(req, 1000); } catch (e) { return J({ error: "bad" }, 400); }
  const k = process.env.ADMIN_KEY || "", g = String(b.key || "");
  if (k.length < 16 || g.length !== k.length || !timingSafeEqual(Buffer.from(g), Buffer.from(k))) return J({ error: "no" }, 401);
  if (b.unban) { const id = String(b.unban).replace(/[^a-zA-Z0-9]/g, ""); await store.delete("ban-" + id); const m = (await store.get("meta-" + id, { type: "json" })) || {}; m.strikes = 0; await store.setJSON("meta-" + id, m); const f = ((await store.get("flags", { type: "json" })) || []).filter((x) => x.id !== id); await store.setJSON("flags", f); return J({ ok: 1 }); }
  const flags = (await store.get("flags", { type: "json" })) || [];
  if (b.act === "stats") { // the owner dashboard
    const st = (await store.get("stats", { type: "json" })) || { total: 0, active: {} }, now = Date.now();
    const online = Object.keys(st.active || {}).filter((k) => now - st.active[k] < 75000).length;
    const daily = st.daily || {}, days = Object.keys(daily).sort().slice(-14).map((d) => ({ d, n: daily[d].n || 0, s: daily[d].s || 0 }));
    const rv = (await store.get("revenue", { type: "json" })) || { naira: 0, count: 0, days: {} };
    const fb = ((await store.get("feedback", { type: "json" })) || []).slice(-60).reverse();
    return J({ total: st.total || 0, online, yes: st.yes || 0, no: st.no || 0, days, places: st.places || {}, revenue: { naira: rv.naira || 0, count: rv.count || 0, days: rv.days || {} }, feedback: fb, flags });
  }
  return J({ flags });
};
export const config = { path: "/api/admin" };
