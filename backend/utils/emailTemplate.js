module.exports = (name = "User", otp = "------") => {
  console.log("[EMAIL TEMPLATE] Generating template for:", name, "OTP:", otp);
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { background: #f3f6fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        .card { max-width: 600px; margin: 40px auto; background: linear-gradient(180deg,#fff,#fbfdff); border-radius: 12px; box-shadow: 0 8px 30px rgba(2,6,23,0.08); padding: 28px; }
        .logo { font-weight: 800; color: #4f46e5; font-size: 20px; }
        .title { font-size: 20px; margin-top: 6px; color: #0b1220; }
        .lead { color: #6b7280; margin-top: 8px; }
        .otp { display: block; margin: 24px auto; background: #0b1220; color: #fff; padding: 14px 20px; border-radius: 10px; font-size: 28px; letter-spacing: 6px; text-align: center; width: fit-content; }
        .note { color: #9ca3af; font-size: 13px; margin-top: 14px; }
        .footer { margin-top: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">ZeeCare</div>
        <div class="title">One-time verification code</div>
        <div class="lead">Hello ${name}, use the code below to complete your sign-up. This code expires in 10 minutes.</div>
        <div class="otp">${otp}</div>
        <div class="note">If you did not request this, you can safely ignore this email.</div>
        <div class="footer">© ${new Date().getFullYear()} ZeeCare</div>
      </div>
    </body>
  </html>
  `;
};
