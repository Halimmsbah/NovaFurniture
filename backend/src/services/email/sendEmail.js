import { Resend } from "resend";
import { verificationEmailTemplate } from "./verificationEmailTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  name,
  otp,
}) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your Nova account",
    html: verificationEmailTemplate({
      name,
      email,
      otp,
    }),
  });

  if (error) {
    console.error("❌ Resend Error:", error);
    throw new Error(error.message);
  }

  console.log("✅ Verification email sent:", data?.id);
};