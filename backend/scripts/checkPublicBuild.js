import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicIndexPath = path.resolve(__dirname, "../public/index.html");

if (!existsSync(publicIndexPath)) {
  console.error(
    "Le frontend buildé est introuvable dans backend/public. Lance `npm run deploy:front` dans frontend/ puis commit `backend/public` avant le deploiement.",
  );
  process.exit(1);
}

console.log("Backend prêt: frontend détecté dans backend/public.");
