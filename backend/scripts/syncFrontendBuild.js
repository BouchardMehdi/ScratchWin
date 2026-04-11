import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const frontendDistDirectory = path.resolve(backendRoot, "../frontend/dist");
const backendPublicDirectory = path.resolve(backendRoot, "public");

if (!existsSync(frontendDistDirectory)) {
  console.error(
    "Le build frontend est introuvable. Lance d'abord `npm run build` dans `frontend/` ou `npm run build:frontend` dans `backend/`.",
  );
  process.exit(1);
}

rmSync(backendPublicDirectory, { recursive: true, force: true });
mkdirSync(backendPublicDirectory, { recursive: true });
cpSync(frontendDistDirectory, backendPublicDirectory, { recursive: true });

console.log(`Frontend copie dans ${backendPublicDirectory}`);
