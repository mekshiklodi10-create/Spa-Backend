import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ✅ Krijo rezervim
router.post("/", async (req, res) => {
  const { name, email, date, time, serviceId, packageId } = req.body;

  if (!name || !email || !date || !time) {
    return res.status(400).json({ message: "Të dhënat e rezervimit janë të detyrueshme" });
  }

  if (!serviceId && !packageId) {
    return res.status(400).json({ message: "Duhet të zgjidhet një shërbim ose paketë" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO reservations (name, email, date, time, serviceId, packageId, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [name, email, date, time, serviceId || null, packageId || null]
    );

    res.status(201).json({ reservationId: result.insertId });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Merr të gjitha rezervimet (për admin ose dashboard)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, 
              s.title AS serviceTitle, 
              p.title AS packageTitle
       FROM reservations r
       LEFT JOIN services s ON r.serviceId = s.id
       LEFT JOIN packages p ON r.packageId = p.id
       ORDER BY r.date DESC, r.time DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Merr rezervimet e një përdoruesi sipas email-it
router.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.*, 
              s.title AS serviceTitle, 
              p.title AS packageTitle
       FROM reservations r
       LEFT JOIN services s ON r.serviceId = s.id
       LEFT JOIN packages p ON r.packageId = p.id
       WHERE r.email = ? AND r.status != 'canceled'
       ORDER BY r.date DESC, r.time DESC`,
      [email]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching user reservations:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Anulo rezervim (ndrysho status në 'canceled')
router.put("/cancel/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE reservations SET status = 'canceled' WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rezervimi nuk u gjet" });
    }

    res.json({ message: "Rezervimi u anulua me sukses" });
  } catch (err) {
    console.error("Error canceling reservation:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;