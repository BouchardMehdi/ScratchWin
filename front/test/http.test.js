import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

let http;
const json = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { "content-type": "application/json" },
});

beforeEach(async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  globalThis.window = new EventTarget();
  http = await import(`../src/api/http.js?case=${Math.random()}`);
  localStorage.setItem(http.ACCESS_TOKEN_KEY, "old-access");
  localStorage.setItem(http.REFRESH_TOKEN_KEY, "old-refresh");
});

test("le refresh programme et les requetes 401 partagent une seule rotation", async () => {
  let rotations = 0;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/auth/refresh")) {
      rotations++;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return json({ token: "new-access", refreshToken: "new-refresh", user: { id: 1 } });
    }
    return options.headers.get("Authorization") === "Bearer new-access" ? json({ ok: true }) : json({ message: "expire" }, 401);
  };
  const [session, first, second] = await Promise.all([
    http.refreshAccessToken(), http.apiFetch("/games/history"), http.apiFetch("/tickets"),
  ]);
  assert.equal(rotations, 1);
  assert.equal(session.token, "new-access");
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
});

test("un refresh termine apres deconnexion ne restaure pas la session", async () => {
  let release;
  globalThis.fetch = () => new Promise((resolve) => { release = resolve; });
  const pending = http.refreshAccessToken();
  http.invalidatePendingSession();
  localStorage.removeItem(http.ACCESS_TOKEN_KEY);
  localStorage.removeItem(http.REFRESH_TOKEN_KEY);
  release(json({ token: "late-access", refreshToken: "late-refresh" }));
  await assert.rejects(pending, /Session modifiee/);
  assert.equal(localStorage.getItem(http.ACCESS_TOKEN_KEY), null);
  assert.equal(localStorage.getItem(http.REFRESH_TOKEN_KEY), null);
});

test("un refresh refuse efface la session et avertit le store", async () => {
  let expired = false;
  window.addEventListener(http.SESSION_EXPIRED_EVENT, () => { expired = true; });
  globalThis.fetch = async () => json({ message: "expire" }, 401);
  await assert.rejects(http.refreshAccessToken(), { status: 401 });
  assert.equal(expired, true);
  assert.equal(localStorage.getItem(http.REFRESH_TOKEN_KEY), null);
});

test("une panne reseau conserve la session et permet de retenter le refresh", async () => {
  globalThis.fetch = async () => { throw new TypeError("Network unavailable"); };
  await assert.rejects(http.refreshAccessToken());
  assert.equal(localStorage.getItem(http.REFRESH_TOKEN_KEY), "old-refresh");
  globalThis.fetch = async () => json({ token: "new-access", refreshToken: "new-refresh" });
  await http.refreshAccessToken();
  assert.equal(localStorage.getItem(http.ACCESS_TOKEN_KEY), "new-access");
});

test("une erreur de connexion ne declenche pas un refresh", async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests++; return json({ message: "Identifiants invalides." }, 401); };
  await assert.rejects(http.apiFetch("/auth/login", { method: "POST" }), { status: 401 });
  assert.equal(requests, 1);
});

test("une reponse vide ne masque pas le statut HTTP", async () => {
  globalThis.fetch = async () => new Response(null, { status: 502 });
  await assert.rejects(http.apiFetch("/tickets"), { status: 502 });
});
