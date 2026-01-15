require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node createDoctorUser.js <email> <password>");
  process.exit(1);
}

(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    // Find the doctor
    const doctor = await Doctor.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    if (!doctor) {
      console.error("✗ Doctor not found with email:", email);
      process.exit(1);
    }

    console.log("✓ Found doctor:", doctor.name);

    // Check if user exists
    let user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (user) {
      console.log("✓ User already exists, updating password...");
      user.password = password;
      user.role = "doctor";
      user.isVerified = true;
      await user.save();
      console.log("✓ Password updated for:", user.email);
    } else {
      console.log("Creating new user...");
      user = new User({
        name: doctor.name,
        email: doctor.email,
        password: password,
        role: "doctor",
        isVerified: true,
      });
      await user.save();
      console.log("✓ User created:", user.email);
    }

    console.log("\nDoctor can now login with:");
    console.log("  Email:", user.email);
    console.log("  Password:", password);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
