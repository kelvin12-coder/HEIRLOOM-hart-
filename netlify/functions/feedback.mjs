import { getStore } from "@netlify/blobs";
import { J, ipOf, sameOrigin, over, body, isBanned } from "../lib/sec.mjs";
// Players tell the owner what they like / dislike. Stored on the server (shown on the admin dashboard) and pushed to the owner's phone through ntfy if NTFY_TOPIC is set.
export default async (req) => {
  if (req.method !== "POST") return J({ error: "post" }, 405);
  if (!sameOrigin(req)) return J({ error: "blocked" }, 403);
  let b; try { b = await body(req, 3000); } catch (e) { return J({ error: "bad" }, 400); }
  const store = getStore("heirloom");
  if (await over(store, "fb-" + ipOf(req), 5, 3600000)) return J({ error: "You already sent a few messages. Please try again later." }, 429);
  const text = String(b.text || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 600);
  if (text.length < 3) return J({ error: "Please write a little more." }, 400);
  const id = String(b.id || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  if (id && (await isBanned(store, id))) return J({ error: "no" }, 403);
  const name = String(b.name || "").replace(/[^a-zA-Z0-9_ ]/g, "").slice(0, 16);
  const cat = ["dislike", "bug", "idea", "like"].includes(b.cat) ? b.cat : "idea";
  const list = (await store.get("feedback", { type: "json" }).catch(() => null)) || [];
  list.push({ t: Date.now(), id: id.slice(0, 8), name, cat, text });
  await store.setJSON("feedback", list.slice(-300));
  const topic = process.env.NTFY_TOPIC;
  if (topic) { try { await fetch("https://ntfy.sh/" + encodeURIComponent(topic), { method: "POST", body: "[" + cat + "] " + (name || "player") + ": " + text, headers: { Title: "Heirloom feedback" } }); } catch (e) {} }
  return J({ ok: 1 });
};
export const config = { path: "/api/feedback" };
