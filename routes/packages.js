import express from "express";
import supabase from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ================= GET ================= */
router.get("/packages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("packages")
      .select("*");

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gabim në marrjen e paketimeve" });
  }
});

/* ================= POST ================= */
router.post("/packages", upload.single("image"), async (req, res) => {
  const { title, description, price } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const { data, error } = await supabase
      .from("packages")
      .insert([{ title, description, price, image: imagePath }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gabim gjatë shtimit të paketës" });
  }
});

/* ================= PUT ================= */
router.put("/packages/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;

  try {
    let imagePath = null;

    if (req.file) {
      const { data: old } = await supabase
        .from("packages")
        .select("image")
        .eq("id", id)
        .single();

      if (old?.image && fs.existsSync("." + old.image)) {
        fs.unlinkSync("." + old.image);
      }

      imagePath = `/uploads/${req.file.filename}`;
    }

    const { error } = await supabase
      .from("packages")
      .update({
        title,
        description,
        price,
        ...(imagePath && { image: imagePath }),
      })
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Paketa u përditësua me sukses" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gabim gjatë përditësimit të paketës" });
  }
});

/* ================= DELETE ================= */
router.delete("/packages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data } = await supabase
      .from("packages")
      .select("image")
      .eq("id", id)
      .single();

    if (data?.image && fs.existsSync("." + data.image)) {
      fs.unlinkSync("." + data.image);
    }

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Paketa u fshi me sukses" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gabim gjatë fshirjes së paketës" });
  }
});

export default router;