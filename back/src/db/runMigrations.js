import { migrate } from "./migrate.js";
import { pool } from "../config/database.js";

try {
  await migrate();
  console.log("Migrations appliquees.");
} catch (error) {
  console.error("Echec des migrations:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
