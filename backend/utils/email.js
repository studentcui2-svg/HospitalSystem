const nodemailer = require("nodemailer");

console.log("[EMAIL CONFIG] Initializing SMTP transporter...");
console.log("[EMAIL CONFIG] Host:", process.env.SMTP_HOST);
console.log("[EMAIL CONFIG] Port:", process.env.SMTP_PORT);
console.log("[EMAIL CONFIG] Secure:", process.env.SMTP_SECURE);
console.log("[EMAIL CONFIG] User:", process.env.SMTP_USER);
console.log("[EMAIL CONFIG] Pass exists:", !!process.env.SMTP_PASS);

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn(
    "[EMAIL CONFIG] ⚠️  SMTP_USER or SMTP_PASS missing. OTP emails cannot be sent until these are set."
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log("[EMAIL CONFIG] Transporter created successfully");

transporter
  .verify()
  .then(() => {
    console.log("[EMAIL CONFIG] SMTP connection verified successfully");
  })
  .catch((error) => {
    console.error("[EMAIL CONFIG] SMTP verification failed:");
    console.error("  Code:", error.code);
    console.error("  Message:", error.message);
    console.error(
      "  Hint: Double-check SMTP_HOST/PORT/USER/PASS and that the provider allows programmatic sign-in (for Gmail, use a 16-character app password)."
    );
  });

module.exports = async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}) {
  console.log("[SEND EMAIL] Called with params:");
  console.log("  To:", to);
  console.log("  Subject:", subject);
  console.log("  HTML length:", html?.length || 0);

  // Determine the From address priority:
  // 1. explicit `from` param
  // 2. SMTP_FROM env
  // 3. SMTP_USER env
  const defaultFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const finalFrom = from || defaultFrom;
  console.log("[SEND EMAIL] From:", finalFrom);

  const mailOptions = {
    from: finalFrom,
    to,
    subject,
    text: text || "",
    html,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
    console.log("[SEND EMAIL] replyTo:", replyTo);
  }

  try {
    console.log("[SEND EMAIL] Calling transporter.sendMail...");
    const info = await transporter.sendMail(mailOptions);
    console.log("[SEND EMAIL] ✓ Email sentgit add .git add . successfully!");
    console.log("[SEND EMAIL] Message ID:", info.messageId);
    console.log("[SEND EMAIL] Response:", info.response);
    return info;
  } catch (error) {
    console.error("[SEND EMAIL ERROR] ✗ Failed to send email");
    console.error("[SEND EMAIL ERROR] Error code:", error.code);
    console.error("[SEND EMAIL ERROR] Error message:", error.message);
    console.error("[SEND EMAIL ERROR] Full error:", error);
    throw error;
  }
};
