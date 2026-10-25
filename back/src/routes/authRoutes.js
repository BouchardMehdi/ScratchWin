import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Le nom d'utilisateur doit contenir entre 3 et 30 caracteres."),
    body("email").trim().isEmail().isLength({ max: 120 }).withMessage("Email invalide."),
    body("password")
      .isString().bail().isLength({ min: 10 })
      .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
      .withMessage("Le mot de passe doit contenir au moins 10 caracteres et au plus 72 octets."),
  ],
  validateRequest,
  authController.register,
);

router.post(
  "/login",
  loginLimiter,
  [
    body("emailOrUsername").trim().notEmpty().withMessage("Email ou nom d'utilisateur requis."),
    body("password").isString().bail().notEmpty().withMessage("Mot de passe requis."),
  ],
  validateRequest,
  authController.login,
);

router.post(
  "/refresh",
  [body("refreshToken").isString().bail().matches(/^[a-f0-9]{96}$/).withMessage("Refresh token invalide.")],
  validateRequest,
  authController.refresh,
);

router.post(
  "/logout",
  [body("refreshToken").optional().isString().withMessage("Refresh token invalide.")],
  validateRequest,
  authController.logout,
);

router.get("/me", requireAuth, authController.me);

export default router;
