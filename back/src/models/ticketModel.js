import { pool } from "../config/database.js";

function mapTicket(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    maxReward: Number(row.max_reward),
    winProbability: Number(row.win_probability),
    ticketType: row.ticket_type,
    description: row.description,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReward(row) {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    label: row.label,
    amount: Number(row.amount),
    weight: Number(row.weight),
  };
}

export async function findAllActive(connection = pool) {
  const [rows] = await connection.query(
    "SELECT * FROM tickets WHERE is_active = 1 ORDER BY price ASC, id ASC",
  );

  return rows.map(mapTicket);
}

export async function findById(id, connection = pool) {
  const [rows] = await connection.query("SELECT * FROM tickets WHERE id = ? LIMIT 1", [id]);
  return mapTicket(rows[0]);
}

export async function findRewardsByTicketId(ticketId, connection = pool) {
  const [rows] = await connection.query(
    "SELECT * FROM ticket_rewards WHERE ticket_id = ? ORDER BY amount ASC",
    [ticketId],
  );

  return rows.map(mapReward);
}

