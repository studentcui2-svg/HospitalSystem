const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management",
  )
  .then(async () => {
    const Doctor = require("./models/Doctor");

    console.log("=== ALL DOCTORS ===\n");
    const doctors = await Doctor.find().select("name email");
    console.log(`Total: ${doctors.length}\n`);

    doctors.forEach((d, i) => {
      console.log(`${i + 1}. Name: "${d.name}"`);
      console.log(`   Email: ${d.email}`);
      console.log(`   ID: ${d._id}`);
      console.log("");
    });

    // Check for the specific doctor
    const targetName = "Shoail  Afridi";
    console.log(`\nSearching for doctor: "${targetName}"`);
    const found = await Doctor.findOne({ name: targetName });
    if (found) {
      console.log("✅ Found!");
      console.log(`   Email: ${found.email}`);
    } else {
      console.log("❌ Not found with exact match");
      console.log("Trying partial match...");
      const partial = await Doctor.findOne({ name: /Shoail.*Afridi/i });
      if (partial) {
        console.log("✅ Found with partial match!");
        console.log(`   Name: "${partial.name}"`);
        console.log(`   Email: ${partial.email}`);
      }
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
