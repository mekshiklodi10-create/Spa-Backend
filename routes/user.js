import express from "express";
import supabase from "../config/db.js";

const router = express.Router();

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, phone, address, role");

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Gabim gjatë marrjes së përdoruesve:", error);
    res.status(500).json({ message: "Gabim gjatë marrjes së përdoruesve" });
  }
});

/* ================= GET BY EMAIL ================= */
router.get("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({ message: "Përdoruesi nuk u gjet" });
    }

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Gabim gjatë marrjes së përdoruesit:", error);
    res.status(500).json({ message: "Gabim gjatë marrjes së përdoruesit" });
  }
});

/* ================= UPDATE ================= */
router.put("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const { name, phone, address, photoUrl } = req.body;

  try {
    const { error } = await supabase
      .from("users")
      .update({ name, phone, address, photoUrl })
      .eq("email", email);

    if (error) throw error;

    res.json({ message: "Profili u përditësua me sukses" });
  } catch (error) {
    console.error("Gabim gjatë përditësimit të profilit:", error);
    res.status(500).json({ message: "Gabim gjatë përditësimit të profilit" });
  }
});

export default router;