import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Le nom d'utilisateur doit contenir entre 3 et 30 caracteres."),
    body("email").trim().isEmail().withMessage("Email invalide."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caracteres."),
  ],
  validateRequest,
  authController.register,
);

router.post(
  "/login",
  [
    body("emailOrUsername").trim().notEmpty().withMessage("Email ou nom d'utilisateur requis."),
    body("password").notEmpty().withMessage("Mot de passe requis."),
  ],
  validateRequest,
  authController.login,
);

router.get("/me", requireAuth, authController.me);

export default router;

