const User = require("../models/User");
const { generateOTP } = require("../utils/otp");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "devsecret",
    {
      expiresIn: "7d",
    }
  );
};

exports.signup = async (req, res) => {
  try {
    console.log("[SIGNUP] Request body:", req.body);
    const { name, email, password, nic, gender, dateOfBirth } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: "Name and email required" });
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const normalizedName = name.trim();
    const normalizedGender = gender ? String(gender).toLowerCase() : undefined;

    const parseDate = (value) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === "number") {
        const fromNumber = new Date(value);
        return Number.isNaN(fromNumber.getTime()) ? undefined : fromNumber;
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        const direct = new Date(trimmed);
        if (!Number.isNaN(direct.getTime())) return direct;

        const match = trimmed.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
        if (match) {
          const [, day, month, year] = match;
          const isoLike = `${year}-${month}-${day}T00:00:00Z`;
          const parsed = new Date(isoLike);
          if (!Number.isNaN(parsed.getTime())) return parsed;
        }
      }
      return undefined;
    };

    const parsedDob = parseDate(dateOfBirth);

    let user = await User.findOne({ email });
    if (user) {
      console.log("[SIGNUP] Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    user = new User({
      name: normalizedName,
      email,
      password,
      nic,
      gender: normalizedGender,
      dateOfBirth: parsedDob,
    });

    // create OTP
    const otp = generateOTP();
    console.log("[SIGNUP] Generated OTP:", otp, "for email:", email);
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();
    console.log("[SIGNUP] User saved to database");

    // send email
    const html = require("../utils/emailTemplate")(user.name, otp);
    console.log("[SIGNUP] Attempting to send email to:", user.email);
    console.log(
      "[SIGNUP] SMTP Config - Host:",
      process.env.SMTP_HOST,
      "User:",
      process.env.SMTP_USER
    );

    let emailSent = false;
    try {
      const noReplyFrom =
        process.env.SMTP_NO_REPLY ||
        `No Reply <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Your OTP code",
        html,
        from: noReplyFrom,
      });
      emailSent = true;
      console.log("[SIGNUP] Email sent successfully! Result:", emailResult);
    } catch (emailErr) {
      console.error("[SIGNUP] Failed to send OTP email", emailErr);
    }

    return res.json({
      ok: true,
      message: emailSent
        ? "OTP sent to email"
        : "Account created but OTP email could not be delivered",
      emailSent,
    });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });
    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = createToken(user);
    res.json({
      ok: true,
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // admin shortcut only when ADMIN_EMAIL and ADMIN_PASSWORD are set in env
    if (
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      String(email || "")
        .trim()
        .toLowerCase() ===
        String(process.env.ADMIN_EMAIL || "")
          .trim()
          .toLowerCase() &&
      String(password || "").trim() ===
        String(process.env.ADMIN_PASSWORD || "").trim()
    ) {
      let admin = await User.findOne({ email });
      if (!admin) {
        admin = new User({
          name: "Admin",
          email,
          role: "admin",
          isVerified: true,
          password,
        });
        await admin.save();
      }
      const token = createToken(admin);
      return res.json({
        ok: true,
        token,
        user: { name: admin.name, email: admin.email, role: admin.role },
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "User not verified" });

    const token = createToken(user);
    res.json({
      ok: true,
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    console.log("[RESEND OTP] Request body:", req.body);
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[RESEND OTP] User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    console.log("[RESEND OTP] Generated new OTP:", otp, "for email:", email);
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log("[RESEND OTP] User updated in database");

    const html = require("../utils/emailTemplate")(user.name, otp);
    console.log("[RESEND OTP] Attempting to send email to:", user.email);

    const noReplyFrom =
      process.env.SMTP_NO_REPLY ||
      `No Reply <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Your OTP code",
      html,
      from: noReplyFrom,
    });
    console.log("[RESEND OTP] Email sent successfully! Result:", emailResult);

    res.json({ ok: true, message: "OTP resent" });
  } catch (err) {
    console.error("[RESEND OTP ERROR]", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
