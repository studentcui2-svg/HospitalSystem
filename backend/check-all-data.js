const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management",
  )
  .then(async () => {
    const LabTest = require("./models/LabTest");
    const PatientRecord = require("./models/PatientRecord");

    console.log("=== ALL LAB TESTS ===");
    const tests = await LabTest.find();
    console.log(`Total: ${tests.length}\n`);

    tests.forEach((t, i) => {
      console.log(`${i + 1}. ${t.testName}`);
      console.log(`   Patient: ${t.patientEmail}`);
      console.log(`   Doctor: ${t.doctorName}`);
      console.log(`   Status: ${t.status}`);
      console.log(`   Has Report: ${t.report ? "YES" : "NO"}`);
      if (t.report) {
        console.log(`   Report URL: ${t.report.url}`);
      }
      console.log("");
    });

    console.log("\n=== ALL PATIENT RECORDS ===");
    const records = await PatientRecord.find();
    console.log(`Total: ${records.length}\n`);

    records.forEach((r, i) => {
      console.log(`${i + 1}. ${r.patientName} (${r.patientEmail})`);
      console.log(`   Doctor: ${r.doctorName}`);
      console.log(
        `   Uploads: ${r.patientUploads ? r.patientUploads.length : 0}`,
      );
      console.log("");
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
