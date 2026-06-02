export function verificationEmailTemplate({ name, email, otp }) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f4ef;padding:32px 0;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e1d8;border-radius:24px;overflow:hidden;">
        <div style="padding:32px 36px;background:linear-gradient(135deg,#1f1a17,#4a3428);color:#fff;">
          <div style="font-size:12px;letter-spacing:.28em;text-transform:uppercase;opacity:.75;">Nova Furniture</div>
          <h1 style="margin:14px 0 0;font-size:32px;line-height:1.1;font-weight:300;">Verify your email</h1>
        </div>
        <div style="padding:36px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#2b2724;">Hi ${name},</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#5b534b;">Use the one-time code below to verify <strong>${email}</strong> and activate your Nova account.</p>
          <div style="margin:28px 0;padding:22px;border:1px solid #ded6ca;border-radius:20px;text-align:center;background:#faf7f2;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#8a7e73;margin-bottom:10px;">One-time code</div>
            <div style="font-size:36px;letter-spacing:.28em;font-weight:700;color:#1f1a17;">${otp}</div>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#6a6056;">If you did not request this code, you can ignore this email.</p>
        </div>
      </div>
    </div>
  `;
}
