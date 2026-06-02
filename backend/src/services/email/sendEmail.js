import nodemailer from "nodemailer";
import { verificationEmailTemplate } from "./verificationEmailTemplate.js";

const senderEmail = "Abdelhalim1143@gmail.com";

export const sendVerificationEmail = async ({ email, name, otp }) => {
  console.log("📧 EMAIL START");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_NAME || senderEmail,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("📧 TRANSPORT CREATED");

  const info = await transporter.sendMail({
    from: `"Nova Furniture" <${senderEmail}>`,
    to: email,
    subject: "Verify your Nova account",
    html: verificationEmailTemplate({ name, email, otp }),
  });

  console.log("📧 EMAIL SENT:", info.messageId);

  return info;
};