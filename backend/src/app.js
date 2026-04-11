import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import env from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.resolve(__dirname, "../public");
const indexFilePath = path.join(publicDirectory, "index.html");

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

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

app.use(express.static(publicDirectory));

app.get("*", (req, res) => {
  res.sendFile(indexFilePath);
});

app.use(errorHandler);

export default app;
