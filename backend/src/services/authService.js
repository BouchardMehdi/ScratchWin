import bcrypt from "bcryptjs";
import * as userModel from "../models/userModel.js";
import { createToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

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

function buildAuthResponse(user) {
  return {
    token: createToken({ userId: user.id }),
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

export function getProfile(user) {
  return sanitizeUser(user);
}

