import express from "express";
import supabase from "../config/db.js";

const router = express.Router();

/* ================= CREATE ================= */
router.post("/", async (req, res) => {
  const { name, email, date, time, serviceId, packageId } = req.body;

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
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          name,
          email,
          date,
          time,
          serviceId: serviceId || null,
          packageId: packageId || null,
          status: "confirmed",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ reservationId: data.id });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        services ( title ),
        packages ( title )
      `)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) throw error;

    const formatted = data.map(r => ({
      ...r,
      serviceTitle: r.services?.title || null,
      packageTitle: r.packages?.title || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET BY USER ================= */
router.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        services ( title ),
        packages ( title )
      `)
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
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= CANCEL ================= */
router.put("/cancel/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "canceled" })
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Rezervimi u anulua me sukses" });
  } catch (error) {
    console.error("Error canceling reservation:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;