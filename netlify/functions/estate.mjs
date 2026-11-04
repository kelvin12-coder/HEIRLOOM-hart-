import { getStore } from "@netlify/blobs";
import { J, ipOf, sameOrigin, over, body, who } from "../lib/sec.mjs";
// Heirloom Estate: gives every logged-in account its own plot. Plots 0-5 (block 0) are reserved for guests on their own device.
const FIRST = 6, MAX = 1200, PER_BLOCK = 6;
const clean = (s) => String(s || "Player").replace(/[^A-Za-z0-9 _\-]/g, "").trim().slice(0, 14) || "Player";
export default async (req) => {
  if (req.method !== "POST") return J({ error: "post only" }, 405);
  if (!sameOrigin(req)) return J({ error: "blocked" }, 403);
  const store = getStore("heirloom");
  let b; try { b = await body(req, 2000); } catch (e) { return J({ error: "bad request" }, 400); }
  const act = String(b.act || "");
  if (await over(store, "est-" + ipOf(req), 240, 3600000)) return J({ error: "Too many tries. Wait a bit." }, 429);
  if (act === "view") { // who lives in these blocks?
    const blocks = (Array.isArray(b.blocks) ? b.blocks : []).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n < MAX / PER_BLOCK).slice(0, 8);
    const plots = {};
    for (const k of blocks) for (let i = k * PER_BLOCK; i < (k + 1) * PER_BLOCK; i++) {
      const p = await store.get("estate-p-" + i, { type: "json" }).catch(() => null);
      if (p) plots[i] = { n: p.n, t: p.t };
    }
    return J({ plots });
  }
  const id = await who(store, b.token);
  if (!id) return J({ error: "Log in first" }, 401);
  if (act === "claim") {
    if (await over(store, "estc-" + id, 20, 3600000)) return J({ error: "Slow down" }, 429);
    let rec = await store.get("estate-acc-" + id, { type: "json" }).catch(() => null);
    if (!rec) {
      let n = Number((await store.get("estate-next")) || FIRST); if (n < FIRST) n = FIRST;
      let idx = -1;
      for (let tries = 0; tries < 30 && n < MAX; tries++, n++) {
        const taken = await store.get("estate-p-" + n, { type: "json" }).catch(() => null);
        if (!taken) { idx = n; break; }
        if (taken.id === id) { idx = n; break; }
      }
      if (idx < 0) return J({ error: "Estate is full. More plots soon." }, 503);
      rec = { plot: idx };
      await store.setJSON("estate-p-" + idx, { id, n: clean(b.name), t: 1, at: Date.now() });
      await store.setJSON("estate-acc-" + id, rec);
      await store.set("estate-next", String(idx + 1));
    }
    const cur = await store.get("estate-p-" + rec.plot, { type: "json" }).catch(() => null);
    return J({ plot: rec.plot, tier: cur ? cur.t : 1 });
  }
  if (act === "set") { // update my name / house level shown to neighbours
    const rec = await store.get("estate-acc-" + id, { type: "json" }).catch(() => null);
    if (!rec) return J({ error: "no plot" }, 404);
    if (await over(store, "ests-" + id, 30, 3600000)) return J({ error: "Slow down" }, 429);
    const t = Math.max(1, Math.min(3, Math.floor(Number(b.tier) || 1)));
    await store.setJSON("estate-p-" + rec.plot, { id, n: clean(b.name), t, at: Date.now() });
    return J({ ok: 1 });
  }
  return J({ error: "unknown action" }, 400);
};
export const config = { path: "/api/estate" };
