import dotenv from "dotenv";

dotenv.config();

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  projectSlug: process.env.PROJECT_SLUG || "scratchwin",
  corsOrigins,
  trustProxy: Number(process.env.TRUST_PROXY || 0),
  jwtSecret: process.env.JWT_SECRET || "development_only_change_this_secret",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "2h",
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30),
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "scratchwin",
  },
};

if (env.nodeEnv === "production" && (
  !process.env.JWT_SECRET ||
  Buffer.byteLength(env.jwtSecret) < 32 ||
  /change[_ -]?(this|me)|development_only/i.test(env.jwtSecret)
)) {
  throw new Error("JWT_SECRET doit etre un secret aleatoire d'au moins 32 octets en production.");
}
if (!Number.isInteger(env.refreshTokenExpiresDays) || env.refreshTokenExpiresDays < 1) {
  throw new Error("REFRESH_TOKEN_EXPIRES_DAYS doit etre un entier positif.");
}

export default env;
