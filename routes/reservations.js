import express from "express";
import supabase from "../config/db.js";

const router = express.Router();

/* ================= CREATE RESERVATION ================= */
router.post("/", async (req, res) => {
  const { name, email, date, time, serviceid, packageid } = req.body;

  if (!name || !email || !date || !time) {
    return res
      .status(400)
      .json({ message: "Të dhënat e rezervimit janë të detyrueshme" });
  }

  if (!serviceid && !packageid) {
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
          serviceid: serviceid || null, // snake_case për Supabase
          packageid: packageid || null,
          status: "confirmed",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("Rezervimi u krijua me ID:", data.id);
    res.status(201).json({ reservationid: data.id });
  } catch (error) {
    console.error("Gabim gjatë krijimit të rezervimit:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET ALL RESERVATIONS ================= */
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

    const formatted = data.map((r) => ({
      ...r,
      serviceTitle: r.services?.title || null,
      packageTitle: r.packages?.title || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Gabim gjatë marrjes së rezervimeve:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET RESERVATIONS BY USER ================= */
router.get("/user/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);

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

    const formatted = data.map((r) => ({
      ...r,
      serviceTitle: r.services?.title || null,
      packageTitle: r.packages?.title || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Gabim gjatë marrjes së rezervimeve të përdoruesit:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= CANCEL RESERVATION ================= */
router.put("/cancel/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "canceled" })
      .eq("id", id);

    if (error) throw error;

    console.log("Rezervimi u anulua me ID:", id);
    res.json({ message: "Rezervimi u anulua me sukses" });
  } catch (error) {
    console.error("Gabim gjatë anulimit të rezervimit:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;