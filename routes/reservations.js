import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, date, time, serviceId, packageId } = req.body;

  console.log("POST /reservations body:", req.body); 

  
  if (!name || !email || !date || !time) {
    return res
      .status(400)
      .json({ message: "Të dhënat e rezervimit janë të detyrueshme" });
  }

  if (!serviceId && !packageId) {
    return res
      .status(400)
      .json({ message: "Duhet të zgjidhet një shërbim ose paketë" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO reservations (name, email, date, time, serviceId, packageId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, date, time, serviceId || null, packageId || null]
    );

    res.status(201).json({ reservationId: result.insertId });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, 
             s.title AS serviceTitle, 
             p.title AS packageTitle
      FROM reservations r
      LEFT JOIN services s ON r.serviceId = s.id
      LEFT JOIN packages p ON r.packageId = p.id
      ORDER BY r.date DESC, r.time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;