import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";


import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import services from "./routes/services.js";
import packages from "./routes/packages.js";
import reservations from "./routes/reservations.js";
import user from "./routes/user.js";

dotenv.config();

const app = express();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: [
      "https://spa-managment-orpin.vercel.app", // frontend-i yt nga Vercel
      "http://localhost:3000" // për testime lokale
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", contactRoutes);
app.use("/api", services);
app.use("/api", packages);
app.use("/api/reservations", reservations);
app.use("/api/users", user);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});