import express from "express";
import { sendContactEmail } from "../api/config/controllers/contactController.js";

const router = express.Router();

router.post("/contact", sendContactEmail);

export default router;
