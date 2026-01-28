const mongoose = require("mongoose");
require("dotenv").config();

async function checkAllLabTests() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    console.log("🔌 Connecting to MongoDB...");
    console.log("📍 URI:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const LabTest = require("./models/LabTest");

    // Get all lab tests
    const allTests = await LabTest.find({});
    console.log(`📊 Total lab tests in database: ${allTests.length}\n`);

    if (allTests.length > 0) {
      console.log("=".repeat(80));
      allTests.forEach((test, index) => {
        console.log(`\n${index + 1}. ID: ${test._id}`);
        console.log(`   Patient: ${test.patientName}`);
        console.log(`   Test: ${test.testName}`);
        console.log(`   Status: ${test.status}`);
        console.log(`   Doctor: ${test.doctorName}`);
        console.log(`   Report URL: ${test.report?.url || "No report"}`);
        console.log(`   Created: ${test.createdAt}`);
        console.log(`   Updated: ${test.updatedAt}`);
      });
      console.log("\n" + "=".repeat(80));
    } else {
      console.log("⚠️ No lab tests found in database.");
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkAllLabTests();
