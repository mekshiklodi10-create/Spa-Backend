import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, phone, address, role FROM users");
    res.json(users);
  } catch (err) {
    console.error("Gabim gjatë marrjes së përdoruesve:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së përdoruesve" });
  }
});

router.get("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email); 
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "Përdoruesi nuk u gjet" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Gabim gjatë marrjes së përdoruesit:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së përdoruesit" });
  }
});


router.put("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email); 
  const { name, phone, address, photoUrl } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE users SET name = ?, phone = ?, address = ?, photoUrl = ? WHERE email = ?",
      [name, phone, address, photoUrl, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Përdoruesi nuk u gjet për përditësim" });
    }

    res.json({ message: "Profili u përditësua me sukses" });
  } catch (err) {
    console.error("Gabim gjatë përditësimit të profilit:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit të profilit" });
  }
});

export default router;