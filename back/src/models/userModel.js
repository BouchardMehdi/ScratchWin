import { pool } from "../config/database.js";

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    credits: Number(row.credits),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    passwordHash: row.password_hash,
  };
}

export async function findByEmail(email, connection = pool) {
  const [rows] = await connection.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return mapUser(rows[0]);
}

export async function findByUsername(username, connection = pool) {
  const [rows] = await connection.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
  return mapUser(rows[0]);
}

export async function findByEmailOrUsername(value, connection = pool) {
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
    [value, value],
  );

  return mapUser(rows[0]);
}

export async function findById(id, connection = pool) {
  const [rows] = await connection.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return mapUser(rows[0]);
}

export async function findByIdForUpdate(id, connection) {
  const [rows] = await connection.query("SELECT * FROM users WHERE id = ? FOR UPDATE", [id]);
  return mapUser(rows[0]);
}

export async function createUser({ username, email, passwordHash }, connection = pool) {
  const [result] = await connection.query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash],
  );

  return findById(result.insertId, connection);
}

export async function updateCredits(userId, credits, connection) {
  await connection.query("UPDATE users SET credits = ? WHERE id = ?", [credits, userId]);
  return findById(userId, connection);
}

