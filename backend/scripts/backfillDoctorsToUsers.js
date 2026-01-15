require("dotenv").config();
const connectDB = require("../config/db");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

(async function () {
  try {
    await connectDB();
    console.log("Connected to DB, scanning doctors...");

    const doctors = await Doctor.find({ email: { $exists: true, $ne: null } });
    console.log(`Found ${doctors.length} doctors with emails`);

    for (const d of doctors) {
      const email = (d.email || "").trim();
      if (!email) continue;
      const existing = await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
      });
      if (existing) {
        console.log(`Skipping ${email} (user exists: ${existing._id})`);
        continue;
      }

      // generate a temporary password
      const tempPass = Math.random().toString(36).slice(-10) + "A1!";

      const user = new User({
        name: d.name || "Doctor",
        email: d.email,
        password: tempPass,
        role: "doctor",
        isVerified: true,
      });

      await user.save();
      console.log(
        `Created user for ${email} -> id=${user._id} tempPass=${tempPass}`
      );
    }

    console.log("Backfill complete");
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err && err.message);
    process.exit(1);
  }
})();
