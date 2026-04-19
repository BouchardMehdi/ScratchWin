import * as gameService from "../services/gameService.js";

export async function listTickets(req, res, next) {
  try {
    const tickets = await gameService.listTickets();
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
}

