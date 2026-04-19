import { Router } from "express";
import * as ticketController from "../controllers/ticketController.js";

const router = Router();

router.get("/", ticketController.listTickets);

export default router;

