import * as gameService from "../services/gameService.js";

export async function play(req, res, next) {
  try {
    const result = await gameService.playTicket(req.user.id, Number(req.body.ticketId));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function history(req, res, next) {
  try {
    const games = await gameService.getHistory(req.user.id, {
      ticketId: req.query.ticketId ? Number(req.query.ticketId) : null,
      result: req.query.result || null,
    });

    res.json({ games });
  } catch (error) {
    next(error);
  }
}

