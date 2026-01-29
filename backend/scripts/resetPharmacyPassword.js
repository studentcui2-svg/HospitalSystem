require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function resetPharmacyPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    let pharmacyUser = await User.findOne({ email: "Pharmacy@zeecare.com" });

    if (!pharmacyUser) {
      console.log("❌ Pharmacy user not found. Creating new user...");

      // Create new user - password will be auto-hashed by pre-save hook
      pharmacyUser = new User({
        name: "Pharmacy Department",
        email: "Pharmacy@zeecare.com",
        password: "Pharmacy12", // Plain text - will be hashed by pre-save hook
        role: "pharmacy",
        isVerified: true,
      });

      await pharmacyUser.save();
      console.log("✅ Pharmacy user created successfully");
    } else {
      console.log("📋 Found existing pharmacy user");

      // Update password and verification status
      pharmacyUser.password = "Pharmacy12"; // Plain text - will be hashed by pre-save hook
      pharmacyUser.isVerified = true;
      pharmacyUser.role = "pharmacy";

      await pharmacyUser.save();
      console.log("✅ Password and verification updated");
    }

    // Test the password
    const isMatch = await pharmacyUser.comparePassword("Pharmacy12");
    console.log(
      "\n🔐 Password Test Result:",
      isMatch ? "✅ SUCCESS" : "❌ FAILED",
    );

    if (isMatch) {
      console.log("\n✅ Login should work now!");
      console.log("📧 Email: Pharmacy@zeecare.com");
      console.log("🔑 Password: Pharmacy12");
      console.log("🌐 Portal: http://localhost:5173/#/pharmacy");
    } else {
      console.log(
        "\n❌ Password test failed. There may be an issue with the User model.",
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetPharmacyPassword();
