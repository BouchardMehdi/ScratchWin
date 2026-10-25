import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../../src/config/database.js";
import { migrate } from "../../src/db/migrate.js";
import app from "../../src/app.js";
import * as auth from "../../src/services/authService.js";
import * as games from "../../src/services/gameService.js";

if (process.env.DB_NAME !== "scratchwin_test") {
  throw new Error("Les tests d'integration exigent la base isolee scratchwin_test.");
}

let server;
let baseUrl;
const accounts = [];
async function account() {
  const name = `test_${randomUUID().replaceAll("-", "").slice(0, 20)}`;
  const session = await auth.register({ username: name, email: `${name}@example.com`, password: "Integration!12345" });
  accounts.push(session.user.id);
  return session;
}

before(async () => {
  await migrate();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test("les migrations repetables conservent comptes, soldes et parties", async () => {
  const session = await account();
  await pool.query("UPDATE users SET credits = 12.34 WHERE id = ?", [session.user.id]);
  await pool.query("INSERT INTO games (user_id, ticket_id, cost, reward) VALUES (?, 1, 2, 0)", [session.user.id]);
  // Simulate an existing database created before migration tracking was added.
  await pool.query("DELETE FROM schema_migrations WHERE id = '001-initial-schema'");
  await migrate();
  const [[user]] = await pool.query("SELECT credits FROM users WHERE id = ?", [session.user.id]);
  assert.equal(Number(user.credits), 12.34);
  const history = await games.getHistory(session.user.id, {});
  assert.equal(history.games.length, 1);
  const [[count]] = await pool.query("SELECT COUNT(*) AS total FROM ticket_rewards");
  assert.equal(Number(count.total), 20);
});

test("les probabilites migrent vers un retour theorique de 80 a 90 pour cent", async () => {
  for (const ticket of await games.listTickets()) {
    const average = ticket.rewards.reduce((sum, reward) => sum + reward.amount * reward.weight, 0) /
      ticket.rewards.reduce((sum, reward) => sum + reward.weight, 0);
    const rtp = average * ticket.winProbability / 100 / ticket.price;
    assert.ok(rtp >= 0.8 && rtp <= 0.9, `${ticket.slug}: ${rtp}`);
  }
});

test("vingt achats simultanes ne peuvent depenser qu'un seul ticket disponible", async () => {
  const session = await account();
  await pool.query("UPDATE users SET credits = 2 WHERE id = ?", [session.user.id]);
  await pool.query("UPDATE tickets SET win_probability = 0 WHERE id = 1");
  try {
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => games.playTicket(session.user.id, 1)));
    assert.equal(results.filter((item) => item.status === "fulfilled").length, 1);
    for (const result of results.filter((item) => item.status === "rejected")) {
      assert.equal(result.reason.statusCode, 400);
    }
    const [[user]] = await pool.query("SELECT credits FROM users WHERE id = ?", [session.user.id]);
    assert.equal(Number(user.credits), 0);
    assert.equal((await games.getHistory(session.user.id, {})).games.length, 1);
  } finally {
    await pool.query("UPDATE tickets SET win_probability = 35 WHERE id = 1");
  }
});

test("le gain et le cout sont appliques une seule fois au solde", async () => {
  const session = await account();
  await pool.query("UPDATE tickets SET win_probability = 100 WHERE id = 1");
  try {
    const result = await games.playTicket(session.user.id, 1);
    assert.equal(result.user.credits, 50 - result.game.cost + result.game.reward);
    assert.ok(result.game.reward > 0);
  } finally {
    await pool.query("UPDATE tickets SET win_probability = 35 WHERE id = 1");
  }
});

test("une erreur d'ecriture annule aussi le debit du solde", async () => {
  const session = await account();
  await pool.query(`ALTER TABLE games ADD CONSTRAINT test_reject_game CHECK (user_id <> ${Number(session.user.id)})`);
  try {
    await assert.rejects(games.playTicket(session.user.id, 1));
    const [[user]] = await pool.query("SELECT credits FROM users WHERE id = ?", [session.user.id]);
    assert.equal(Number(user.credits), 50);
    assert.equal((await games.getHistory(session.user.id, {})).games.length, 0);
  } finally {
    await pool.query("ALTER TABLE games DROP CHECK test_reject_game");
  }
});

test("un refresh token ne peut etre consomme qu'une fois en concurrence", async () => {
  const session = await account();
  const results = await Promise.allSettled(Array.from({ length: 5 }, () => auth.refreshSession(session.refreshToken)));
  const successful = results.filter((item) => item.status === "fulfilled");
  assert.equal(successful.length, 1);
  for (const result of results.filter((item) => item.status === "rejected")) assert.equal(result.reason.statusCode, 401);
  await assert.rejects(auth.refreshSession(session.refreshToken), { statusCode: 401 });
  const rotated = successful[0].value;
  assert.notEqual(rotated.refreshToken, session.refreshToken);
  await auth.logout(rotated.refreshToken);
  await assert.rejects(auth.refreshSession(rotated.refreshToken), { statusCode: 401 });
});

test("un refresh token expire est refuse", async () => {
  const session = await account();
  await pool.query("UPDATE refresh_tokens SET expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE user_id = ?", [session.user.id]);
  await assert.rejects(auth.refreshSession(session.refreshToken), { statusCode: 401 });
});

test("l'historique parcourt plus de 50 parties et isole chaque compte", async () => {
  const session = await account();
  const other = await account();
  for (let index = 0; index < 55; index++) {
    await pool.query("INSERT INTO games (user_id, ticket_id, cost, reward, is_win) VALUES (?, 1, 2, ?, ?)",
      [session.user.id, index % 2 ? 0 : 2, index % 2 ? 0 : 1]);
  }
  const first = await games.getHistory(session.user.id, { page: 1, pageSize: 20 });
  const second = await games.getHistory(session.user.id, { page: 2, pageSize: 20 });
  const third = await games.getHistory(session.user.id, { page: 3, pageSize: 20 });
  assert.equal(first.games.length, 20);
  assert.equal(third.games.length, 15);
  assert.equal(first.pagination.hasMore, true);
  assert.equal(third.pagination.hasMore, false);
  assert.equal(new Set([...first.games, ...second.games, ...third.games].map((game) => game.id)).size, 55);
  assert.equal((await games.getHistory(other.user.id, {})).games.length, 0);
  assert.ok((await games.getHistory(session.user.id, { result: "win" })).games.every((game) => game.isWin));
});

test("l'API valide la pagination, masque les erreurs SQL et limite les connexions", async () => {
  const session = await account();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` };
  const invalid = await fetch(`${baseUrl}/games/history?pageSize=999`, { headers });
  assert.equal(invalid.status, 422);
  const malformed = await fetch(`${baseUrl}/auth/login`, { method: "POST", headers, body: "{" });
  assert.equal(malformed.status, 400);
  const [[before]] = await pool.query("SELECT COUNT(*) AS total FROM games WHERE user_id = ?", [session.user.id]);
  const [[ticket]] = await pool.query("SELECT slug FROM tickets WHERE id = 1");
  await pool.query("UPDATE tickets SET slug = 'invalid-config' WHERE id = 1");
  try {
    const failed = await fetch(`${baseUrl}/games/play`, { method: "POST", headers, body: JSON.stringify({ ticketId: 1 }) });
    assert.equal(failed.status, 500);
    assert.match((await failed.json()).message, /erreur interne/);
  } finally {
    await pool.query("UPDATE tickets SET slug = ? WHERE id = 1", [ticket.slug]);
  }
  const [[after]] = await pool.query("SELECT COUNT(*) AS total FROM games WHERE user_id = ?", [session.user.id]);
  assert.equal(before.total, after.total);
  for (let attempt = 0; attempt < 11; attempt++) {
    const response = await fetch(`${baseUrl}/auth/login`, { method: "POST", headers, body: JSON.stringify({ emailOrUsername: "missing_account", password: "incorrect" }) });
    assert.equal(response.status, attempt < 10 ? 401 : 429);
  }
});
