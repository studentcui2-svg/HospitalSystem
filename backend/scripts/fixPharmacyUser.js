require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function fixPharmacyUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const pharmacyUser = await User.findOne({ email: "Pharmacy@zeecare.com" });

    if (!pharmacyUser) {
      console.log("❌ Pharmacy user not found. Creating...");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Pharmacy12", salt);

      const newUser = new User({
        name: "Pharmacy Department",
        email: "Pharmacy@zeecare.com",
        password: hashedPassword,
        role: "pharmacy",
        isVerified: true,
      });

      await newUser.save();
      console.log("✅ Pharmacy user created with isVerified: true");
    } else {
      console.log("📋 Current pharmacy user status:");
      console.log("   Name:", pharmacyUser.name);
      console.log("   Email:", pharmacyUser.email);
      console.log("   Role:", pharmacyUser.role);
      console.log("   isVerified:", pharmacyUser.isVerified);

      if (!pharmacyUser.isVerified) {
        pharmacyUser.isVerified = true;
        await pharmacyUser.save();
        console.log("✅ Updated isVerified to true");
      }

      // Test password comparison
      const testPassword = "Pharmacy12";
      const isMatch = await pharmacyUser.comparePassword(testPassword);
      console.log(
        "   Password test (Pharmacy12):",
        isMatch ? "✅ MATCH" : "❌ NO MATCH",
      );

      if (!isMatch) {
        console.log("\n⚠️  Password mismatch detected. Resetting password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Pharmacy12", salt);
        pharmacyUser.password = hashedPassword;
        await pharmacyUser.save();
        console.log("✅ Password reset successfully");
      }
    }

    console.log("\n✅ Pharmacy user is ready for login!");
    console.log("📧 Email: Pharmacy@zeecare.com");
    console.log("🔑 Password: Pharmacy12");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixPharmacyUser();
