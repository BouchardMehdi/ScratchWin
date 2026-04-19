import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import * as userModel from "../models/userModel.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentification requise.");
    }

    const token = header.replace("Bearer ", "");
    const payload = verifyAccessToken(token);
    const user = await userModel.findById(payload.userId);

    if (!user) {
      throw new ApiError(401, "Utilisateur introuvable.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Token invalide ou expire."));
  }
}
