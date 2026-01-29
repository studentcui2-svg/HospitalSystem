require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function checkPharmacyUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const pharmacyUser = await User.findOne({ email: "Pharmacy@zeecare.com" });

    if (pharmacyUser) {
      console.log("✅ Pharmacy user EXISTS in database");
      console.log("📋 User details:");
      console.log("   Name:", pharmacyUser.name);
      console.log("   Email:", pharmacyUser.email);
      console.log("   Role:", pharmacyUser.role);
      console.log("   Has Password:", pharmacyUser.password ? "Yes" : "No");
      console.log("   Created:", pharmacyUser.createdAt);
    } else {
      console.log("❌ Pharmacy user NOT FOUND in database");
      console.log("Need to create the pharmacy user...");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkPharmacyUser();
