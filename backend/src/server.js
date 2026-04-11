import app from "./app.js";
import env from "./config/env.js";
import { pool } from "./config/database.js";

async function startServer() {
  try {
    await pool.query("SELECT 1");
    app.listen(env.port, () => {
      console.log(`ScratchWin backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Impossible de demarrer le serveur:", error.message);
    process.exit(1);
  }
}

startServer();

