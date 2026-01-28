const mongoose = require("mongoose");
require("dotenv").config();

const PatientRecord = require("./models/PatientRecord");
const LabTest = require("./models/LabTest");

async function checkUploads() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Check lab tests
    console.log("=== LAB TESTS ===");
    const labTests = await LabTest.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Total lab tests: ${labTests.length}\n`);

    labTests.forEach((test) => {
      console.log(`Test: ${test.testName}`);
      console.log(`  Patient: ${test.patientName} (${test.patientEmail})`);
      console.log(`  Doctor: ${test.doctorName}`);
      console.log(`  Status: ${test.status}`);
      console.log(`  Report: ${test.report ? test.report.url : "No report"}`);
      console.log("");
    });

    // Check patient records with uploads
    console.log("\n=== PATIENT RECORDS WITH UPLOADS ===");
    const recordsWithUploads = await PatientRecord.find({
      "patientUploads.0": { $exists: true },
    }).select("patientName patientEmail doctorName patientUploads visitDate");

    console.log(`Total records with uploads: ${recordsWithUploads.length}\n`);

    if (recordsWithUploads.length === 0) {
      console.log("⚠️ NO RECORDS WITH UPLOADS FOUND!");
      console.log(
        "This means lab uploads are not being saved to patient records.\n",
      );
    } else {
      recordsWithUploads.forEach((record) => {
        console.log(`Patient: ${record.patientName} (${record.patientEmail})`);
        console.log(`  Doctor: ${record.doctorName}`);
        console.log(`  Visit Date: ${record.visitDate}`);
        console.log(`  Uploads: ${record.patientUploads.length}`);
        record.patientUploads.forEach((upload) => {
          console.log(`    - ${upload.title}`);
          console.log(`      Uploaded by: ${upload.uploadedBy}`);
          console.log(`      File: ${upload.fileUrl}`);
        });
        console.log("");
      });
    }

    // Check all patient records for a specific patient
    console.log("\n=== ALL PATIENT RECORDS (Sample) ===");
    const allRecords = await PatientRecord.find()
      .sort({ createdAt: -1 })
      .limit(3);
    console.log(
      `Total patient records in DB: ${await PatientRecord.countDocuments()}\n`,
    );

    allRecords.forEach((record) => {
      console.log(`Patient: ${record.patientName} (${record.patientEmail})`);
      console.log(`  Doctor: ${record.doctorName}`);
      console.log(
        `  Has patient uploads: ${record.patientUploads && record.patientUploads.length > 0 ? "YES (" + record.patientUploads.length + ")" : "NO"}`,
      );
      console.log("");
    });

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUploads();
