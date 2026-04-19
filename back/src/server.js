import app from "./app.js";
import env from "./config/env.js";

async function startServer() {
  try {
    app.listen(env.port, () => {
      console.log(`ScratchWin backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Impossible de demarrer le serveur:", error.message);
    process.exit(1);
  }
}

startServer();
