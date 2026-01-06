import express from "express";
import supabase from "../config/db.js";

const router = express.Router();

// GET reservations by user email
router.get("/user/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select("*, services(title), packages(title)")
      .eq("email", email)
      .neq("status", "canceled")
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) throw error;

    const formatted = data.map(r => ({
      ...r,
      serviceTitle: r.services?.title || null,
      packageTitle: r.packages?.title || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// CANCEL reservation
router.put("/cancel/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "canceled" })
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Rezervimi u anulua me sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
