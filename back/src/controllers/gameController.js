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
    const response = await gameService.getHistory(req.user.id, {
      ticketId: req.query.ticketId ? Number(req.query.ticketId) : null,
      result: req.query.result || null,
      page: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 20),
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
}

