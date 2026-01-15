require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2] || "Drimarn@zeecare.com";

(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (user) {
      console.log("✓ User found:");
      console.log("  ID:", user._id);
      console.log("  Email:", user.email);
      console.log("  Role:", user.role);
      console.log("  Has Password:", !!user.password);
      console.log("  Is Verified:", user.isVerified);
    } else {
      console.log("✗ User NOT FOUND for email:", email);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
