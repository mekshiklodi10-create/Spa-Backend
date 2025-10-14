import express from "express";
import pool from "../api/config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });


router.get("/services", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM services");
    res.json(rows); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim në marrjen e shërbimeve" });
  }
});



router.post("/services", upload.single("image"), async (req, res) => {
  const { title, description, price } = req.body;

  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      "INSERT INTO services (title, description, price, image) VALUES (?, ?, ?, ?)",
      [title, description, price, imagePath]
    );

    res.status(201).json({ id: result.insertId, title, description, price, image: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë shtimit të shërbimit" });
  }
});



router.put("/services/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;

  try {
    let query;
    let params;

    if (req.file) {
      const [rows] = await pool.query("SELECT image FROM services WHERE id = ?", [id]);
      const oldImage = rows[0]?.image;
      if (oldImage && fs.existsSync("." + oldImage)) {
        fs.unlinkSync("." + oldImage);
      }

      const imagePath = `/uploads/${req.file.filename}`;
      query = "UPDATE services SET title = ?, description = ?, price = ?, image = ? WHERE id = ?";
      params = [title, description, price, imagePath, id];
    } else {
      query = "UPDATE services SET title = ?, description = ?, price = ? WHERE id = ?";
      params = [title, description, price, id];
    }

    await pool.query(query, params);
    res.json({ message: "Shërbimi u përditësua me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë përditësimit të shërbimit" });
  }
});



router.delete("/services/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT image FROM services WHERE id = ?", [id]);
    const image = rows[0]?.image;
    if (image && fs.existsSync("." + image)) {
      fs.unlinkSync("." + image);
    }

    await pool.query("DELETE FROM services WHERE id = ?", [id]);
    res.json({ message: "Shërbimi u fshi me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë fshirjes së shërbimit" });
  }
});

export default router;