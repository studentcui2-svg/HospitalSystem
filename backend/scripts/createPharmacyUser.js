/* eslint-env node */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createPharmacyUser = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hospital",
    );
    console.log("✅ Connected to MongoDB");

    // Check if pharmacy user already exists
    const existingUser = await User.findOne({ email: "Pharmacy@zeecare.com" });

    if (existingUser) {
      console.log("📋 Pharmacy user already exists. Updating password...");

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Pharmacy12", salt);

      existingUser.password = hashedPassword;
      existingUser.role = "pharmacy";
      existingUser.name = "Pharmacy Department";

      await existingUser.save();
      console.log("✅ Pharmacy user updated successfully!");
    } else {
      console.log("🆕 Creating new pharmacy user...");

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Pharmacy12", salt);

      // Create pharmacy user
      const pharmacyUser = new User({
        name: "Pharmacy Department",
        email: "Pharmacy@zeecare.com",
        password: hashedPassword,
        role: "pharmacy",
      });

      await pharmacyUser.save();
      console.log("✅ Pharmacy user created successfully!");
    }

    console.log("\n📋 Pharmacy Login Credentials:");
    console.log("Email: Pharmacy@zeecare.com");
    console.log("Password: Pharmacy12");
    console.log(
      "\nAccess Pharmacy Portal at: http://localhost:5173/#/pharmacy",
    );

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating pharmacy user:", err);
    process.exit(1);
  }
};

createPharmacyUser();
