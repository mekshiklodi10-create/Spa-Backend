import express from "express";
import supabase from "../config/db.js";

const router = express.Router();

// GET ALL users
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, phone, address, role, photo_url");

    if (error) throw error;

    const formatted = data.map(u => ({
      ...u,
      photoUrl: u.photo_url,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë marrjes së përdoruesve" });
  }
});

// GET user by email
router.get("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;

    res.json({ ...data, photoUrl: data.photo_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë marrjes së përdoruesit" });
  }
});

// UPDATE user
router.put("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const { name, phone, address, photoUrl } = req.body;

  try {
    const { error } = await supabase
      .from("users")
      .update({ name, phone, address, photo_url: photoUrl })
      .eq("email", email);

    if (error) throw error;

    res.json({ message: "Profili u përditësua me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gabim gjatë përditësimit të profilit" });
  }
});

export default router;
