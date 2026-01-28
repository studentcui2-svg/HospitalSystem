#!/usr/bin/env node
/**
 * Quick Diagnostic Script for Lab Upload Issues
 * Run this after uploading a lab report to check if data is properly saved
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function diagnose() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const LabTest = require("./models/LabTest");
    const PatientRecord = require("./models/PatientRecord");

    // Check recent lab tests
    console.log("📋 RECENT LAB TESTS (Last 5):");
    console.log("=".repeat(60));
    const tests = await LabTest.find().sort({ createdAt: -1 }).limit(5);

    if (tests.length === 0) {
      console.log("❌ NO LAB TESTS FOUND!");
      console.log("   Please order a test from doctor panel first.\n");
    } else {
      tests.forEach((t, i) => {
        console.log(`\n${i + 1}. ${t.testName}`);
        console.log(`   Patient: ${t.patientName} (${t.patientEmail})`);
        console.log(`   Doctor: ${t.doctorName}`);
        console.log(`   Status: ${t.status}`);
        console.log(
          `   Has Report: ${t.report && t.report.url ? "✅ YES" : "❌ NO"}`,
        );
        if (t.report && t.report.url) {
          console.log(`   Report URL: ${t.report.url}`);
        }
      });
    }

    // Check patient records with uploads
    console.log("\n\n📋 PATIENT RECORDS WITH LAB UPLOADS:");
    console.log("=".repeat(60));
    const records = await PatientRecord.find({
      "patientUploads.uploadedBy": "lab",
    }).sort({ createdAt: -1 });

    if (records.length === 0) {
      console.log("❌ NO PATIENT RECORDS WITH LAB UPLOADS FOUND!");
      console.log("\n🔍 Possible Issues:");
      console.log("   1. Lab report not uploaded yet");
      console.log("   2. Patient record not created/found");
      console.log("   3. Backend error during upload\n");

      // Check if any patient records exist
      const totalRecords = await PatientRecord.countDocuments();
      console.log(`   Total patient records in DB: ${totalRecords}`);

      if (totalRecords > 0) {
        console.log("\n   Sample patient records:");
        const samples = await PatientRecord.find()
          .limit(3)
          .select("patientName patientEmail doctorName patientUploads");
        samples.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.patientName} (${r.patientEmail})`);
          console.log(`      Doctor: ${r.doctorName}`);
          console.log(
            `      Patient Uploads: ${r.patientUploads ? r.patientUploads.length : 0}`,
          );
        });
      }
    } else {
      console.log(
        `✅ Found ${records.length} patient record(s) with lab uploads:\n`,
      );
      records.forEach((r, i) => {
        console.log(`${i + 1}. Patient: ${r.patientName} (${r.patientEmail})`);
        console.log(`   Doctor: ${r.doctorName}`);
        console.log(`   Total Uploads: ${r.patientUploads.length}`);

        const labUploads = r.patientUploads.filter(
          (u) => u.uploadedBy === "lab",
        );
        console.log(`   Lab Uploads: ${labUploads.length}`);

        labUploads.forEach((upload, idx) => {
          console.log(`\n   Lab Upload ${idx + 1}:`);
          console.log(`      Title: ${upload.title}`);
          console.log(`      File: ${upload.fileUrl}`);
          console.log(
            `      Uploaded: ${new Date(upload.uploadedAt).toLocaleString()}`,
          );
        });
        console.log("");
      });
    }

    // Summary and recommendations
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY & RECOMMENDATIONS:");
    console.log("=".repeat(60));

    const completedTests = await LabTest.countDocuments({
      status: "Completed",
    });
    const testsWithReports = await LabTest.countDocuments({
      "report.url": { $exists: true },
    });
    const recordsWithLabUploads = await PatientRecord.countDocuments({
      "patientUploads.uploadedBy": "lab",
    });

    console.log(`\n✓ Lab Tests: ${tests.length} total`);
    console.log(`✓ Completed Tests: ${completedTests}`);
    console.log(`✓ Tests with Reports: ${testsWithReports}`);
    console.log(
      `✓ Patient Records with Lab Uploads: ${recordsWithLabUploads}\n`,
    );

    if (testsWithReports > recordsWithLabUploads) {
      console.log(
        "⚠️  WARNING: Some lab reports are not showing in patient records!",
      );
      console.log(
        "   This means uploads are saved to LabTest but not PatientRecord.\n",
      );
      console.log(
        "   💡 Solution: Check backend console logs during upload for errors.\n",
      );
    } else if (testsWithReports === 0) {
      console.log("📝 Next Steps:");
      console.log("   1. Login to lab portal");
      console.log('   2. Find a test with status "Ordered" or "InProgress"');
      console.log('   3. Click "Result" button and upload a file');
      console.log("   4. Run this script again to verify\n");
    } else {
      console.log("✅ Everything looks good!");
      console.log("   Lab uploads are properly saved to patient records.\n");
      console.log("📝 To view in portal:");
      console.log("   1. Login as doctor");
      console.log("   2. Go to patient records");
      console.log('   3. Look for "📋 Patient & Lab Reports" section');
      console.log("   4. Lab uploads will have green border and 🧪 icon\n");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

diagnose();
