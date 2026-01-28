const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management",
  )
  .then(async () => {
    const User = require("./models/User");

    console.log("=== ALL USERS (DOCTORS) ===\n");
    const users = await User.find({ role: "doctor" }).select("name email role");
    console.log(`Total doctor users: ${users.length}\n`);

    users.forEach((u, i) => {
      console.log(`${i + 1}. Name: "${u.name}"`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   ID: ${u._id}`);
      console.log("");
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
