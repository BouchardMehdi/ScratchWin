import { Router } from "express";
import { body, query } from "express-validator";
import * as gameController from "../controllers/gameController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/play",
  requireAuth,
  [body("ticketId").isInt({ min: 1 }).withMessage("Ticket invalide.")],
  validateRequest,
  gameController.play,
);

router.get(
  "/history",
  requireAuth,
  [
    query("page").optional().isInt({ min: 1, max: 100000 }).withMessage("Page invalide."),
    query("pageSize").optional().isInt({ min: 1, max: 50 }).withMessage("Taille de page invalide."),
    query("ticketId").optional().isInt({ min: 1 }).withMessage("Filtre ticket invalide."),
    query("result")
      .optional()
      .isIn(["win", "loss", "all"])
      .withMessage("Le filtre resultat doit etre win, loss ou all."),
  ],
  validateRequest,
  gameController.history,
);

export default router;

