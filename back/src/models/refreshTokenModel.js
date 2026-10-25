import { pool } from "../config/database.js";

function mapRefreshToken(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

export async function createRefreshToken({ userId, tokenHash, expiresAt }, connection = pool) {
  const [result] = await connection.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt],
  );

  const [rows] = await connection.query("SELECT * FROM refresh_tokens WHERE id = ? LIMIT 1", [
    result.insertId,
  ]);

  return mapRefreshToken(rows[0]);
}

export async function findValidByTokenHash(tokenHash, connection = pool, forUpdate = false) {
  const [rows] = await connection.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = ?
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1${forUpdate ? " FOR UPDATE" : ""}`,
    [tokenHash],
  );

  return mapRefreshToken(rows[0]);
}

export async function revokeByTokenHash(tokenHash, connection = pool) {
  await connection.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = ? AND revoked_at IS NULL`,
    [tokenHash],
  );
}
