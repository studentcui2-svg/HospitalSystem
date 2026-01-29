const mongoose = require("mongoose");
require("dotenv").config();

const Referral = require("./models/Referral");
const User = require("./models/User");
const Doctor = require("./models/Doctor");

const testReferralEmails = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/hospital-management",
    );
    console.log("✅ Connected to MongoDB");

    // Find all doctors
    const doctors = await User.find({ role: "doctor" });
    const doctorProfiles = await Doctor.find({});

    console.log("\n📋 Available Doctors:");
    console.log("=".repeat(80));

    for (const doc of doctors) {
      const profile = doctorProfiles.find((p) => p.email === doc.email);
      console.log(`\n👨‍⚕️ ${doc.name}`);
      console.log(`   Email: ${doc.email}`);
      console.log(`   ID: ${doc._id}`);
      if (profile) {
        console.log(`   Department: ${profile.department || "N/A"}`);
      }
    }

    // Find all referrals
    const referrals = await Referral.find({}).sort({ createdAt: -1 }).limit(5);

    console.log("\n\n🔗 Recent Referrals:");
    console.log("=".repeat(80));

    if (referrals.length === 0) {
      console.log("\n📭 No referrals found in database");
    } else {
      for (const ref of referrals) {
        console.log(`\n📄 Referral ID: ${ref._id}`);
        console.log(`   Patient: ${ref.patientName} (${ref.patientEmail})`);
        console.log(`   From: Dr. ${ref.referringDoctorName}`);
        console.log(
          `   To: Dr. ${ref.referredDoctorName} (${ref.referredDoctorEmail})`,
        );
        console.log(`   Reason: ${ref.reason.substring(0, 100)}...`);
        console.log(`   Status: ${ref.status}`);
        console.log(`   Urgency: ${ref.urgency}`);
        console.log(`   Created: ${ref.createdAt}`);
      }
    }

    console.log("\n\n💡 To test referral system:");
    console.log("1. Login as a doctor");
    console.log("2. Go to a patient's detail page");
    console.log("3. Click 'Refer to Specialist' button");
    console.log("4. Select another doctor and fill in the referral form");
    console.log("5. Check emails for both patient and referred doctor");
    console.log(
      "6. Login as the referred doctor to see the referral in their portal",
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
};

testReferralEmails();
