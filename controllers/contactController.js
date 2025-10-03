import nodemailer from "nodemailer";

export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      secure: false, 
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SPA Website" <${email}>`,
      to: "mekshiklodi10@gmail.com", 
      subject: `Mesazh nga ${name}`,
      html: `
        <p><strong>Emër:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesazh:</strong><br/>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Emaili u dërgua me sukses!" });
  } catch (error) {
    console.error("Gabim gjatë dërgimit të emailit:", error);
    res.status(500).json({ success: false, message: "Dështoi dërgimi i emailit." });
  }
};
