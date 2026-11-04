import { getStore } from "@netlify/blobs";
import { ipOf, sameOrigin, over, body, isBanned, J } from "../lib/sec.mjs";
import { createHash, randomBytes } from "node:crypto";
// Photos are sent to ONE chosen online player (never to a public feed), stay for 7 days, then are deleted.
const pidOf = (id) => createHash("sha256").update("pid" + id).digest("hex").slice(0, 10);
const DAY = 86400000, KEEP = 7 * DAY, MAXLEN = 200000;
const clean = (x, n) => String(x || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, n);
export default async (req) => {
  if (req.method !== "POST") return J({ error: "post" }, 405);
  if (!sameOrigin(req)) return J({ error: "blocked" }, 403);
  let b; try { b = await body(req, MAXLEN + 2000); } catch (e) { return J({ error: "bad" }, 400); }
  const id = clean(b.id, 40); if (id.length < 8) return J({ error: "id" }, 400);
  const store = getStore("heirloom"), now = Date.now();
  if (await over(store, "phx-" + ipOf(req), 90, 60000)) return J({ error: "slow down" }, 429);
  if (await isBanned(store, id)) return J({ error: "no" }, 403);
  const inboxKey = "ib-" + id;
  const loadInbox = async () => {
    const all = (await store.get(inboxKey, { type: "json" }).catch(() => null)) || [];
    const old = all.filter((x) => now - x.t >= KEEP);
    for (const o of old) await store.delete("ph-" + o.k).catch(() => {}); // 7 days passed → photo is deleted for good
    if (old.length) await store.setJSON(inboxKey, all.filter((x) => now - x.t < KEEP));
    return all.filter((x) => now - x.t < KEEP);
  };

  if (b.act === "inbox") { // what has been sent to me?
    const ib = await loadInbox();
    return J({ items: ib.map((x) => ({ k: x.k, n: x.n, t: x.t })) });
  }
  if (b.act === "get") { // open one photo (only the receiver can)
    const k = clean(b.k, 32), ib = await loadInbox(), it = ib.find((x) => x.k === k);
    if (!it) return J({ error: "gone" }, 404);
    const img = await store.get("ph-" + k).catch(() => null);
    if (!img) return J({ error: "gone" }, 404);
    return J({ img, n: it.n, t: it.t });
  }
  if (b.act === "report" || b.act === "block") {
    const k = clean(b.k, 32), ib = await loadInbox(), it = ib.find((x) => x.k === k);
    if (!it) return J({ ok: true });
    if (b.act === "report") {
      const rk = "prep-" + it.from, seen = (await store.get(rk, { type: "json" }).catch(() => null)) || [];
      if (!seen.includes(id)) seen.push(id);
      await store.setJSON(rk, seen.slice(-20));
      if (seen.length >= 3) await store.set("pban-" + it.from, String(now)); // 3 different people reported → can no longer send photos
      const f = (await store.get("flags", { type: "json" }).catch(() => null)) || [];
      f.push({ id: it.from, user: it.n, why: "photo reported", t: now }); await store.setJSON("flags", f.slice(-200));
    }
    const bk = "blk-" + id, bl = (await store.get(bk, { type: "json" }).catch(() => null)) || [];
    if (!bl.includes(it.from)) bl.push(it.from); await store.setJSON(bk, bl.slice(-100));
    await store.delete("ph-" + k).catch(() => {});
    await store.setJSON(inboxKey, ib.filter((x) => x.k !== k));
    return J({ ok: true });
  }
  if (b.act === "delete") {
    const k = clean(b.k, 32), ib = await loadInbox();
    await store.delete("ph-" + k).catch(() => {}); await store.setJSON(inboxKey, ib.filter((x) => x.k !== k));
    return J({ ok: true });
  }
  if (b.act === "send") {
    if ((await store.get("pban-" + id)) !== null) return J({ error: "You can no longer send photos." }, 403);
    if (await over(store, "phs-" + id, 8, 600000) || await over(store, "phi-" + ipOf(req), 12, 600000)) return J({ error: "Too many photos. Wait a few minutes." }, 429);
    const img = String(b.img || "");
    if (img.length > MAXLEN || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(img)) return J({ error: "Photo not accepted" }, 400);
    const bytes = Buffer.from(img.slice(23), "base64");
    if (bytes.length < 500 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return J({ error: "Photo not accepted" }, 400);
    const L = (await store.get("lobby", { type: "json" }).catch(() => null)) || { players: {} };
    const to = Object.keys(L.players).find((k) => pidOf(k) === String(b.to || "") && now - L.players[k].t < 70000);
    if (!to || to === id) return J({ error: "That player is not online any more." }, 404);
    const blk = (await store.get("blk-" + to, { type: "json" }).catch(() => null)) || [];
    if (blk.includes(id)) return J({ ok: true }); // silently dropped
    const name = String((L.players[id] && L.players[id].n) || b.name || "Player").replace(/[^\w \-]/g, "").slice(0, 14) || "Player";
    const k = randomBytes(12).toString("hex");
    await store.set("ph-" + k, img);
    const ibk = "ib-" + to, ib = ((await store.get(ibk, { type: "json" }).catch(() => null)) || []).filter((x) => now - x.t < KEEP);
    ib.push({ k, n: name, from: id, t: now });
    const dropped = ib.length > 15 ? ib.splice(0, ib.length - 15) : [];
    for (const d of dropped) await store.delete("ph-" + d.k).catch(() => {});
    await store.setJSON(ibk, ib);
    return J({ ok: true });
  }
  return J({ error: "bad" }, 400);
};
export const config = { path: "/api/photo" };
