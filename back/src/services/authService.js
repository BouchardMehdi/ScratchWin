import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as userModel from "../models/userModel.js";
import * as refreshTokenModel from "../models/refreshTokenModel.js";
import { createAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import env from "../config/env.js";
import { getConnection } from "../config/database.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    credits: user.credits,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildRefreshTokenExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresDays);
  return expiresAt;
}

async function buildAuthResponse(user, connection) {
  const refreshToken = crypto.randomBytes(48).toString("hex");
  await refreshTokenModel.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: buildRefreshTokenExpiry(),
  }, connection);

  return {
    token: createAccessToken({ userId: user.id }),
    refreshToken,
    user: sanitizeUser(user),
  };
}

export async function register({ username, email, password }) {
  const existingEmail = await userModel.findByEmail(email);
  if (existingEmail) {
    throw new ApiError(409, "Cet email est deja utilise.");
  }

  const existingUsername = await userModel.findByUsername(username);
  if (existingUsername) {
    throw new ApiError(409, "Ce nom d'utilisateur est deja pris.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({ username, email, passwordHash });

  return buildAuthResponse(user);
}

export async function login({ emailOrUsername, password }) {
  const user = await userModel.findByEmailOrUsername(emailOrUsername);
  if (!user) {
    throw new ApiError(401, "Identifiants invalides.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Identifiants invalides.");
  }

  return buildAuthResponse(user);
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token requis.");
  }

  const tokenHash = hashToken(refreshToken);
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const storedToken = await refreshTokenModel.findValidByTokenHash(tokenHash, connection, true);
    if (!storedToken) {
      throw new ApiError(401, "Refresh token invalide ou expire.");
    }
    const user = await userModel.findById(storedToken.userId, connection);
    if (!user) {
      throw new ApiError(401, "Utilisateur introuvable.");
    }
    await refreshTokenModel.revokeByTokenHash(tokenHash, connection);
    const response = await buildAuthResponse(user, connection);
    await connection.commit();
    return response;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function logout(refreshToken) {
  if (refreshToken) {
    await refreshTokenModel.revokeByTokenHash(hashToken(refreshToken));
  }

  return { success: true };
}

export function getProfile(user) {
  return sanitizeUser(user);
}
