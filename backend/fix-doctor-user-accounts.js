const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Doctor = require("./models/Doctor");

const checkDoctorUserRelation = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/hospital-management",
    );
    console.log("✅ Connected to MongoDB\n");

    // Get all doctors from User collection
    const doctorUsers = await User.find({ role: "doctor" });
    console.log(`👥 Found ${doctorUsers.length} doctors in User collection:`);
    doctorUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    // Get all doctors from Doctor collection
    const doctorProfiles = await Doctor.find({});
    console.log(
      `\n👨‍⚕️ Found ${doctorProfiles.length} doctors in Doctor collection:`,
    );
    doctorProfiles.forEach((doc) => {
      console.log(`  - ${doc.name} (${doc.email}) - ID: ${doc._id}`);
    });

    // Check for mismatches
    console.log("\n🔍 Checking for missing User entries for Doctor profiles:");
    for (const docProfile of doctorProfiles) {
      const userMatch = doctorUsers.find((u) => u.email === docProfile.email);
      if (!userMatch) {
        console.log(
          `  ⚠️  Doctor "${docProfile.name}" (${docProfile.email}) has NO User account`,
        );
        console.log(`      Creating User account...`);

        const newUser = new User({
          name: docProfile.name,
          email: docProfile.email,
          phone: docProfile.phone,
          role: "doctor",
          isVerified: true,
          gender: docProfile.gender,
          dateOfBirth: docProfile.dateOfBirth,
        });
        await newUser.save();
        console.log(`      ✅ Created User account with ID: ${newUser._id}`);
      } else {
        console.log(
          `  ✅ Doctor "${docProfile.name}" has User account (ID: ${userMatch._id})`,
        );
      }
    }

    console.log("\n✨ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkDoctorUserRelation();
