import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ message: "ScratchWin API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/games", gameRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

app.use(errorHandler);

export default app;

