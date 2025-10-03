import express from "express";
import pool from "../config/db.js";
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


router.get("/packages", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM packages");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim në marrjen e paketimeve" });
  }
});


router.post("/packages", upload.single("image"), async (req, res) => {
  const { title, description, price } = req.body;

  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      "INSERT INTO packages (title, description, price, image) VALUES (?, ?, ?, ?)",
      [title, description, price, imagePath]
    );

    res.status(201).json({ id: result.insertId, title, description, price, image: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë shtimit të paketës" });
  }
});


router.put("/packages/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;

  try {
    if (req.file) {
      const [rows] = await pool.query("SELECT image FROM packages WHERE id = ?", [id]);
      const oldImage = rows[0]?.image;
      if (oldImage && fs.existsSync("." + oldImage)) {
        fs.unlinkSync("." + oldImage);
      }

      const imagePath = `/uploads/${req.file.filename}`;
      await pool.query(
        "UPDATE packages SET title = ?, description = ?, price = ?, image = ? WHERE id = ?",
        [title, description, price, imagePath, id]
      );
    } else {
      await pool.query(
        "UPDATE packages SET title = ?, description = ?, price = ? WHERE id = ?",
        [title, description, price, id]
      );
    }

    res.json({ message: "Paketa u përditësua me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë përditësimit të paketës" });
  }
});


router.delete("/packages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT image FROM packages WHERE id = ?", [id]);
    const image = rows[0]?.image;

    if (image && fs.existsSync("." + image)) {
      fs.unlinkSync("." + image);
    }

    await pool.query("DELETE FROM packages WHERE id = ?", [id]);
    res.json({ message: "Paketa u fshi me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë fshirjes së paketës" });
  }
});

export default router;