import { getStore } from "@netlify/blobs";
import { createHash, randomBytes } from "node:crypto";
import { ipOf, sameOrigin, over, isBanned } from "../lib/sec.mjs";

/* Friend races with a bet. Play money only (never real money).
   Both players race the same circuit in the same rented car; each phone sends its
   position about twice a second so the other player sees a live ghost car. */
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const sha = (x) => createHash("sha256").update(String(x)).digest("hex");
const pidOf = (id) => sha("pid" + id).slice(0, 10);
const MAX_STAKE = 100000, LAPS = 2, COUNTDOWN = 25000, GIVE_UP = 150000, VOID_AFTER = 420000;

export default async (req) => {
  if (req.method !== "POST") return J({ error: "post" }, 405);
  if (!sameOrigin(req)) return J({ error: "blocked" }, 403);
  let b = {}; try { b = await req.json(); } catch (e) { return J({ error: "bad" }, 400); }
  const id = String(b.id || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  if (id.length < 8) return J({ error: "id" }, 400);
  const name = String(b.name || "Player").replace(/[^\w \-]/g, "").trim().slice(0, 14) || "Player";
  const store = getStore({ name: "heirloom", consistency: "strong" });
  if (await over(store, "race-" + ipOf(req), 400, 60000)) return J({ error: "slow down" }, 429);
  if (await isBanned(store, id)) return J({ error: "suspended" }, 403);
  const now = Date.now(), me = pidOf(id), act = String(b.act || "");
  const code = String(b.code || "").replace(/[^a-z0-9]/g, "").slice(0, 8);
  const K = (c) => "duel-" + c;
  const roleOf = (d) => (d.host.pid === me ? "h" : d.guest && d.guest.pid === me ? "g" : "");
  const view = async (d, role) => {
    const other = role === "h" ? "g" : "h";
    const op = await store.get("dpos-" + d.code + "-" + other, { type: "json" });
    const fin = { h: await store.get("dfin-" + d.code + "-h", { type: "json" }), g: await store.get("dfin-" + d.code + "-g", { type: "json" }) };
    return { code: d.code, stake: d.stake, laps: d.laps, status: d.status, t0: d.t0, now, role, host: d.host.n, guest: d.guest ? d.guest.n : null, opp: op && now - op.at < 8000 ? op : null, fin: { me: fin[role] && fin[role].t, other: fin[other] && fin[other].t }, finAt: { me: fin[role] && fin[role].at, other: fin[other] && fin[other].at }, paid: !!(await store.get("dpaid-" + d.code + "-" + role)) };
  };

  if (act === "create") {
    const stake = Math.max(0, Math.min(MAX_STAKE, Math.floor(Number(b.stake) || 0)));
    if ((await over(store, "racec-" + me, 6, 600000))) return J({ error: "Too many challenges. Wait a few minutes." }, 429);
    const old = await store.get("mine-" + me);
    if (old) { const od = await store.get(K(old), { type: "json" }); if (od && (od.status === "open" || od.status === "ready") && now - od.created < 900000) return J({ error: "You already have a challenge. Cancel it first.", code: old }, 409); }
    const c = randomBytes(4).toString("hex").slice(0, 6);
    const d = { code: c, stake, laps: LAPS, status: "open", created: now, t0: 0, to: String(b.to || "").replace(/[^a-f0-9]/g, "").slice(0, 10), host: { pid: me, n: name }, guest: null };
    await store.setJSON(K(c), d); await store.set("mine-" + me, c);
    const ix = (await store.get("duel-index", { type: "json" })) || []; ix.push(c); await store.setJSON("duel-index", ix.slice(-40));
    return J({ ok: 1, code: c, d: await view(d, "h") });
  }
  if (act === "list") {
    const mine = await store.get("mine-" + me); let cur = null;
    if (mine) { const d = await store.get(K(mine), { type: "json" }); if (d && roleOf(d) && now - d.created < 3600000) { const vv = await view(d, roleOf(d)); if (!vv.paid) cur = vv; } }
    const idx = (await store.get("duel-index", { type: "json" })) || [];
    const open = [];
    for (const c of idx.slice(-14).reverse()) {
      const d = await store.get(K(c), { type: "json" });
      if (d && d.status === "open" && now - d.created < 600000 && d.host.pid !== me && (!d.to || d.to === me)) open.push({ code: d.code, stake: d.stake, host: d.host.n, direct: !!d.to });
    }
    return J({ ok: 1, cur, open: open.slice(0, 8), me });
  }
  if (!code) return J({ error: "code" }, 400);
  const d = await store.get(K(code), { type: "json" });
  if (!d) return J({ error: "That challenge is gone." }, 404);
  if (act === "peek") return J({ ok: 1, code: d.code, stake: d.stake, host: d.host.n, status: d.status, mine: d.host.pid === me });
  if (act === "join") {
    if (d.host.pid === me) return J({ error: "That is your own challenge." }, 400);
    if (d.status !== "open" || now - d.created > 900000) return J({ error: "This challenge is already taken or expired." }, 409);
    if (d.to && d.to !== me) return J({ error: "This challenge is for someone else." }, 403);
    d.guest = { pid: me, n: name }; d.status = "ready"; d.t0 = now + COUNTDOWN;
    await store.setJSON(K(code), d); await store.set("mine-" + me, code);
    return J({ ok: 1, d: await view(d, "g") });
  }
  const role = roleOf(d);
  if (!role) return J({ error: "Not your race." }, 403);
  if (act === "cancel") { if (d.status === "open" || (d.status === "ready" && now < d.t0 - 2000)) { d.status = "closed"; d.cancelled = now; await store.setJSON(K(code), d); } return J({ ok: 1, d: await view(d, role) }); }
  if (act === "state") return J({ ok: 1, d: await view(d, role) });
  if (act === "pos") {
    if (d.status !== "ready") return J({ ok: 1, d: await view(d, role) });
    const n = (v, m) => Math.max(-m, Math.min(m, Number(v) || 0));
    await store.setJSON("dpos-" + code + "-" + role, { x: n(b.x, 5000), z: n(b.z, 5000), h: n(b.h, 10), s: n(b.s, 200), k: Math.floor(n(b.k, 999)), at: now });
    return J({ ok: 1, d: await view(d, role) });
  }
  if (act === "fin") {
    const t = Number(b.time) || 0, since = (now - d.t0) / 1000;
    if (d.status !== "ready" || since < 10) return J({ error: "Race not running" }, 400);
    if (t < 25 || t > 600 || t > since + 3 || t < since * 0.55) { return J({ error: "Time rejected" }, 400); } // time must match the clock on the server
    if (!(await store.get("dfin-" + code + "-" + role))) await store.setJSON("dfin-" + code + "-" + role, { t, at: now });
    return J({ ok: 1, d: await view(d, role) });
  }
  if (act === "res") {
    const v = await view(d, role); const other = role === "h" ? "g" : "h";
    let res = null;
    if (d.status === "closed" || (d.status === "open" && now - d.created > 900000)) res = { void: 1 };
    else if (v.fin.me && v.fin.other) res = v.fin.me < v.fin.other ? { win: 1 } : v.fin.me > v.fin.other ? { win: 0 } : { tie: 1 };
    else if (v.fin.me && now - v.finAt.me > GIVE_UP) res = { win: 1, walkover: 1 };
    else if (v.fin.other && now - v.finAt.other > GIVE_UP) res = { win: 0 };
    else if (d.t0 && now - d.t0 > VOID_AFTER && !v.fin.me && !v.fin.other) res = { void: 1 };
    if (!res) return J({ ok: 1, done: 0, d: v });
    const ck = "dpaid-" + code + "-" + role; let payout = 0;
    if (!(await store.get(ck))) {
      await store.set(ck, "1");
      payout = res.void || res.tie ? d.stake : res.win ? d.stake * 2 : 0;
    } else return J({ ok: 1, done: 1, claimed: 1, res, d: v });
    return J({ ok: 1, done: 1, res, payout, stake: d.stake, d: v });
  }
  return J({ error: "act" }, 400);
};
export const config = { path: "/api/race" };
