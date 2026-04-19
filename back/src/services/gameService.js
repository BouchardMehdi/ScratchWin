import { getConnection } from "../config/database.js";
import * as userModel from "../models/userModel.js";
import * as ticketModel from "../models/ticketModel.js";
import * as gameModel from "../models/gameModel.js";
import { ApiError } from "../utils/apiError.js";
import { generateGameOutcome } from "./gameEngineService.js";

export async function listTickets() {
  const tickets = await ticketModel.findAllActive();

  const ticketsWithRewards = await Promise.all(
    tickets.map(async (ticket) => ({
      ...ticket,
      rewards: await ticketModel.findRewardsByTicketId(ticket.id),
    })),
  );

  return ticketsWithRewards;
}

export async function playTicket(userId, ticketId) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const user = await userModel.findByIdForUpdate(userId, connection);
    if (!user) {
      throw new ApiError(404, "Utilisateur introuvable.");
    }

    const ticket = await ticketModel.findById(ticketId, connection);
    if (!ticket || !ticket.isActive) {
      throw new ApiError(404, "Ticket introuvable.");
    }

    if (user.credits < ticket.price) {
      throw new ApiError(400, "Credits insuffisants pour acheter ce ticket.");
    }

    const rewards = await ticketModel.findRewardsByTicketId(ticket.id, connection);
    const outcome = generateGameOutcome(ticket, rewards);
    const newCredits = Number((user.credits - ticket.price + outcome.reward).toFixed(2));

    const updatedUser = await userModel.updateCredits(user.id, newCredits, connection);
    const game = await gameModel.createGame(
      {
        userId: user.id,
        ticketId: ticket.id,
        cost: ticket.price,
        isWin: outcome.isWin,
        reward: outcome.reward,
        resultData: outcome.resultData,
      },
      connection,
    );

    await connection.commit();

    return {
      game,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        credits: updatedUser.credits,
      },
      ticket,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getHistory(userId, filters) {
  return gameModel.findHistoryByUserId(userId, filters);
}

