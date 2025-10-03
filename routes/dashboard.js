import express from "express";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json({ message: "Mirë se vini në dashboard, admin!" });
});

export default router;