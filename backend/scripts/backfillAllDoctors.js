require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to DB\n");

    const doctors = await Doctor.find({ email: { $exists: true, $ne: null } });
    console.log(`Found ${doctors.length} doctors with emails\n`);

    const results = [];

    for (const doctor of doctors) {
      const email = (doctor.email || "").trim();
      if (!email) continue;

      const existing = await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });

      if (existing) {
        console.log(`✓ ${doctor.name} (${email}) - User already exists`);
        results.push({
          name: doctor.name,
          email,
          status: "exists",
          userId: existing._id,
        });
        continue;
      }

      // Generate a temporary password
      const tempPass = Math.random().toString(36).slice(-10) + "A1!";

      const user = new User({
        name: doctor.name,
        email: doctor.email,
        password: tempPass,
        role: "doctor",
        isVerified: true,
      });

      await user.save();
      console.log(
        `✓ ${doctor.name} (${email}) - Created with password: ${tempPass}`
      );
      results.push({
        name: doctor.name,
        email,
        status: "created",
        tempPassword: tempPass,
        userId: user._id,
      });
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Total doctors processed: ${results.length}`);
    console.log(
      `Already had accounts: ${
        results.filter((r) => r.status === "exists").length
      }`
    );
    console.log(
      `New accounts created: ${
        results.filter((r) => r.status === "created").length
      }`
    );

    const newAccounts = results.filter((r) => r.status === "created");
    if (newAccounts.length > 0) {
      console.log("\n=== NEW LOGIN CREDENTIALS ===");
      newAccounts.forEach((acc) => {
        console.log(`\nDoctor: ${acc.name}`);
        console.log(`Email: ${acc.email}`);
        console.log(`Password: ${acc.tempPassword}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
