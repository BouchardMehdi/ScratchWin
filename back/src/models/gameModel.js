import { pool } from "../config/database.js";

function parseResultData(resultData) {
  if (!resultData) {
    return null;
  }

  if (typeof resultData === "object") {
    return resultData;
  }

  try {
    return JSON.parse(resultData);
  } catch (error) {
    return null;
  }
}

function mapGame(row) {
  return {
    id: row.id,
    userId: row.user_id,
    ticketId: row.ticket_id,
    ticketName: row.ticket_name,
    ticketSlug: row.ticket_slug,
    cost: Number(row.cost),
    isWin: Boolean(row.is_win),
    reward: Number(row.reward),
    resultData: parseResultData(row.result_data),
    playedAt: row.played_at,
  };
}

export async function createGame(
  { userId, ticketId, cost, isWin, reward, resultData },
  connection,
) {
  const [result] = await connection.query(
    `INSERT INTO games (user_id, ticket_id, cost, is_win, reward, result_data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, ticketId, cost, isWin ? 1 : 0, reward, JSON.stringify(resultData)],
  );

  const [rows] = await connection.query(
    `SELECT g.*, t.name AS ticket_name, t.slug AS ticket_slug
     FROM games g
     INNER JOIN tickets t ON t.id = g.ticket_id
     WHERE g.id = ? LIMIT 1`,
    [result.insertId],
  );

  return mapGame(rows[0]);
}

export async function findHistoryByUserId(userId, filters = {}, connection = pool) {
  const conditions = ["g.user_id = ?"];
  const params = [userId];
  const page = Math.max(1, Math.min(100000, Number(filters.page) || 1));
  const pageSize = Math.max(1, Math.min(50, Number(filters.pageSize) || 20));

  if (filters.ticketId) {
    conditions.push("g.ticket_id = ?");
    params.push(filters.ticketId);
  }

  if (filters.result === "win") {
    conditions.push("g.is_win = 1");
  }

  if (filters.result === "loss") {
    conditions.push("g.is_win = 0");
  }

  const [rows] = await connection.query(
    `SELECT g.*, t.name AS ticket_name, t.slug AS ticket_slug
     FROM games g
     INNER JOIN tickets t ON t.id = g.ticket_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY g.played_at DESC, g.id DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize + 1, (page - 1) * pageSize],
  );

  return { games: rows.slice(0, pageSize).map(mapGame), pagination: { page, pageSize, hasMore: rows.length > pageSize } };
}

