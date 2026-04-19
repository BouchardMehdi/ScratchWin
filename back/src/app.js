import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.set("trust proxy", env.trustProxy);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin non autorisee par la configuration CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    project: env.projectSlug,
    environment: env.nodeEnv,
  });
});

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API ScratchWin.",
    apiPrefix: "/api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/games", gameRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

app.use(errorHandler);

export default app;
