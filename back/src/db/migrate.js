import { readFile } from "node:fs/promises";
import { pool } from "../config/database.js";

export async function migrate() {
  const connection = await pool.getConnection();
  const lockName = "scratchwin-schema-migrations";
  let locked = false;
  try {
    const [[lock]] = await connection.query("SELECT GET_LOCK(?, 60) AS acquired", [lockName]);
    locked = Number(lock.acquired) === 1;
    if (!locked) throw new Error("Impossible de verrouiller les migrations.");
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(100) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);
    const [applied] = await connection.query("SELECT id FROM schema_migrations");
    const ids = new Set(applied.map((row) => row.id));

    if (!ids.has("001-initial-schema")) {
      const sql = await readFile(new URL("./scratchwin.sql", import.meta.url), "utf8");
      // The bootstrap uses idempotent DDL/seeds: MySQL DDL commits implicitly.
      for (const statement of sql.split(";").map((item) => item.trim()).filter(Boolean)) {
        await connection.query(statement);
      }
      await connection.query("INSERT INTO schema_migrations (id) VALUES (?)", ["001-initial-schema"]);
    }

    if (!ids.has("002-balanced-tickets")) {
      await connection.beginTransaction();
      try {
        const probabilities = { flash: 35, fortune: 24, jackpot: 19, mystere: 12.5, "lucky-7": 15.5 };
        for (const [slug, probability] of Object.entries(probabilities)) {
          await connection.query("UPDATE tickets SET win_probability = ? WHERE slug = ?", [probability, slug]);
        }
        await connection.query("INSERT INTO schema_migrations (id) VALUES (?)", ["002-balanced-tickets"]);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    if (!ids.has("003-history-index")) {
      const [indexes] = await connection.query("SHOW INDEX FROM games WHERE Key_name = 'idx_games_user_played_id'");
      if (!indexes.length) {
        await connection.query("CREATE INDEX idx_games_user_played_id ON games (user_id, played_at, id)");
      }
      await connection.query("INSERT INTO schema_migrations (id) VALUES (?)", ["003-history-index"]);
    }
  } finally {
    try {
      if (locked) await connection.query("SELECT RELEASE_LOCK(?)", [lockName]);
    } finally {
      connection.release();
    }
  }
}
