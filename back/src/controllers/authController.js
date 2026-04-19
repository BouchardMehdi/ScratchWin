import * as authService from "../services/authService.js";

export async function register(req, res, next) {
  try {
    const response = await authService.register(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const response = await authService.login(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    res.json({ user: authService.getProfile(req.user) });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const response = await authService.refreshSession(req.body.refreshToken);
    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const response = await authService.logout(req.body.refreshToken);
    res.json(response);
  } catch (error) {
    next(error);
  }
}
