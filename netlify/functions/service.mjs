import { getStore } from "@netlify/blobs";
import { ipOf, sameOrigin, over, body, isBanned, J } from "../lib/sec.mjs";
import { randomBytes } from "node:crypto";
// Player-to-player services: a customer calls a plumber / engineer / police officer, a real online player on duty answers.
const KINDS = { plumber: 250, engineer: 300, police: 350 }; // reward the worker earns (paid by the game, not by the customer)
const clean = (x, n) => String(x || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, n);
const num = (v, lim) => { v = Number(v); return Number.isFinite(v) ? Math.max(-lim, Math.min(lim, v)) : 0; };
export default async (req) => {
  if (req.method !== "POST") return J({ error: "post" }, 405);
  if (!sameOrigin(req)) return J({ error: "blocked" }, 403);
  let b; try { b = await body(req, 2000); } catch (e) { return J({ error: "bad" }, 400); }
  const id = clean(b.id, 40); if (id.length < 8) return J({ error: "id" }, 400);
  const store = getStore("heirloom"), now = Date.now(), ip = ipOf(req);
  if (await over(store, "svx-" + ip, 120, 60000)) return J({ error: "slow down" }, 429);
  if (await isBanned(store, id)) return J({ error: "no" }, 403);
  const name = String(b.name || "Player").replace(/[^\w \-]/g, "").trim().slice(0, 14) || "Player";
  const D = (await store.get("svc", { type: "json" }).catch(() => null)) || { reqs: [], duty: {} };
  D.reqs = D.reqs.filter((r) => now - r.t < 900000 && !(r.st === "done" && now - r.tDone > 60000));
  for (const k of Object.keys(D.duty)) if (now - D.duty[k].t > 30000) delete D.duty[k];
  const save = () => store.setJSON("svc", D);
  const mine = () => D.reqs.find((r) => r.cid === id && r.st !== "done");
  const job = () => D.reqs.find((r) => r.wid === id && r.st !== "done" && r.st !== "open");
  const view = (r) => r && { rid: r.rid, kind: r.kind, st: r.st, cn: r.cname, wn: r.wname || "", x: r.x, z: r.z, area: r.area, cash: KINDS[r.kind] };
  const act = b.act;

  if (act === "duty") {
    if (b.on && KINDS[b.kind]) D.duty[id] = { k: b.kind, n: name, t: now }; else delete D.duty[id];
    await save(); return J({ ok: true });
  }
  if (act === "call") {
    if (!KINDS[b.kind]) return J({ error: "bad" }, 400);
    if (mine()) return J({ error: "You already have a call open." }, 400);
    if (await over(store, "svc-" + id, 6, 3600000)) return J({ error: "Too many calls this hour." }, 429);
    const r = { rid: randomBytes(6).toString("hex"), kind: b.kind, cid: id, cname: name, cip: ip, area: String(b.area || "").replace(/[^\w \-']/g, "").slice(0, 24), x: num(b.x, 3000), z: num(b.z, 3000), t: now, st: "open" };
    D.reqs.push(r); if (D.reqs.length > 60) D.reqs = D.reqs.slice(-60);
    const n = Object.values(D.duty).filter((d) => d.k === b.kind && now - d.t < 30000).length;
    await save(); return J({ ok: true, req: view(r), workers: n });
  }
  if (act === "poll") {
    if (D.duty[id]) { D.duty[id].t = now; D.duty[id].n = name; await save(); }
    const counts = { plumber: 0, engineer: 0, police: 0 };
    Object.values(D.duty).forEach((d) => { if (counts[d.k] !== undefined) counts[d.k]++; });
    const my = D.duty[id], open = my ? D.reqs.filter((r) => r.st === "open" && r.kind === my.k && r.cid !== id && r.cip !== ip).slice(0, 3).map(view) : [];
    return J({ mine: view(mine()), job: view(job()), open, counts, duty: my ? my.k : "" });
  }
  const r = D.reqs.find((x) => x.rid === clean(b.rid, 16));
  if (!r) return J({ error: "That call is gone." }, 404);
  if (act === "accept") {
    if (r.st !== "open" || r.cid === id || r.cip === ip) return J({ error: "Taken" }, 409);
    if (!D.duty[id] || D.duty[id].k !== r.kind) return J({ error: "Go on duty first" }, 403);
    if (job()) return J({ error: "Finish your current job first" }, 409);
    r.st = "acc"; r.wid = id; r.wname = name; r.tAcc = now; await save(); return J({ ok: true, req: view(r) });
  }
  if (act === "cancel") {
    if (r.cid === id && r.st !== "done") { D.reqs = D.reqs.filter((x) => x !== r); await save(); return J({ ok: true }); }
    if (r.wid === id && r.st !== "done") { r.st = "open"; delete r.wid; delete r.wname; await save(); return J({ ok: true }); }
    return J({ error: "no" }, 403);
  }
  if (act === "arrive") {
    if (r.wid !== id || r.st !== "acc") return J({ error: "no" }, 403);
    if (Math.hypot(num(b.x, 3000) - r.x, num(b.z, 3000) - r.z) > 45) return J({ error: "Not there yet" }, 400);
    r.st = "there"; await save(); return J({ ok: true });
  }
  if (act === "opendoor") {
    if (r.cid !== id || r.st !== "there") return J({ error: "no" }, 403);
    r.st = "door"; r.tDoor = now; await save(); return J({ ok: true });
  }
  if (act === "finish") {
    if (r.wid !== id || r.st !== "door" || now - r.tDoor < 5000) return J({ error: "Not yet" }, 400);
    if (await over(store, "svr-" + id, 15, 3600000)) return J({ error: "Rest a bit — job limit reached." }, 429);
    r.st = "done"; r.tDone = now; await save(); return J({ ok: true, cash: KINDS[r.kind] });
  }
  return J({ error: "bad" }, 400);
};
export const config = { path: "/api/service" };
