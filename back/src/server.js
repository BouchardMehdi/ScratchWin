import app from "./app.js";
import env from "./config/env.js";
import { migrate } from "./db/migrate.js";
import { pool } from "./config/database.js";

async function startServer() {
  try {
    await migrate();
    const server = app.listen(env.port, () => {
      console.log(`ScratchWin backend running on port ${env.port}`);
    });
    server.on("error", (error) => {
      console.error("Impossible de demarrer le serveur:", error.message);
      pool.end().finally(() => process.exit(1));
    });
    for (const signal of ["SIGTERM", "SIGINT"]) {
      process.once(signal, () => {
        server.close(() => pool.end().finally(() => process.exit(0)));
        setTimeout(() => process.exit(1), 10_000).unref();
      });
    }
  } catch (error) {
    console.error("Impossible de demarrer le serveur:", error.message);
    process.exit(1);
  }
}

startServer();
