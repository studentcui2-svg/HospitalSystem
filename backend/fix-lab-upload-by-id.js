const mongoose = require("mongoose");
require("dotenv").config();

async function findAndFix() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const PatientRecord = require("./models/PatientRecord");
    const LabTest = require("./models/LabTest");

    // Find the lab test by ID
    const labTestId = "6979fb2895e2c965e1771cac";
    console.log(`🔍 Looking for lab test: ${labTestId}\n`);

    const labTest = await LabTest.findById(labTestId);

    if (!labTest) {
      console.log("❌ Lab test not found with that ID!");
      console.log("Searching for all completed lab tests...\n");

      const allTests = await LabTest.find({ status: "Completed" });
      console.log(`Found ${allTests.length} completed tests:`);
      allTests.forEach((t) => {
        console.log(`  - ${t.testName} for ${t.patientEmail}`);
        console.log(`    Doctor: ${t.doctorName}`);
        console.log(`    Has report: ${t.report ? "YES" : "NO"}`);
      });
      process.exit(1);
    }

    console.log("✅ Lab Test Found:");
    console.log(`   ID: ${labTest._id}`);
    console.log(`   Patient: ${labTest.patientName} (${labTest.patientEmail})`);
    console.log(`   Doctor: "${labTest.doctorName}"`);
    console.log(`   Test: ${labTest.testName}`);
    console.log(`   Status: ${labTest.status}`);
    console.log(`   Has Report: ${labTest.report ? "YES ✅" : "NO ❌"}`);

    if (labTest.report) {
      console.log(`   Report File: ${labTest.report.filename}`);
      console.log(`   Report URL: ${labTest.report.url}`);
    }
    console.log("");

    // Check if patient record exists
    console.log("🔍 Checking for patient records...\n");

    const records = await PatientRecord.find({
      patientEmail: labTest.patientEmail,
    });

    console.log(`Patient Records found: ${records.length}`);

    if (records.length > 0) {
      records.forEach((r, i) => {
        console.log(`\n  Record ${i + 1}:`);
        console.log(`    ID: ${r._id}`);
        console.log(`    Doctor: "${r.doctorName}"`);
        console.log(`    Visit Date: ${r.visitDate}`);
        console.log(
          `    Patient Uploads: ${r.patientUploads ? r.patientUploads.length : 0}`,
        );
      });
    } else {
      console.log("  ❌ No patient records found for this patient!");
    }
    console.log("");

    // If lab test has report but no patient record, create it
    if (labTest.report) {
      console.log(
        "📋 Lab test has report. Ensuring it's in patient records...\n",
      );

      let patientRecord = await PatientRecord.findOne({
        patientEmail: labTest.patientEmail,
        doctorName: labTest.doctorName,
      }).sort({ visitDate: -1 });

      const uploadData = {
        title: `Lab Result: ${labTest.testName}`,
        description: `Lab test result for ${labTest.testName} uploaded by lab.`,
        filename: labTest.report.filename,
        originalName: labTest.report.filename,
        path: labTest.report.path,
        fileUrl: labTest.report.url,
        mimetype: "application/pdf",
        size: 0,
        uploadedBy: "lab",
        uploadedAt: labTest.report.uploadedAt || new Date(),
      };

      if (patientRecord) {
        console.log(`✅ Found existing patient record: ${patientRecord._id}`);

        // Check if upload already exists
        const exists = patientRecord.patientUploads.some(
          (u) => u.filename === labTest.report.filename,
        );

        if (exists) {
          console.log("   ✅ Upload already exists in this record!");
        } else {
          console.log("   ➕ Adding lab upload to existing record...");
          patientRecord.patientUploads.push(uploadData);
          await patientRecord.save();
          console.log("   ✅ Lab upload added successfully!");
        }
      } else {
        console.log("   ⚠️  No patient record found, creating new one...");
        patientRecord = new PatientRecord({
          patientName: labTest.patientName,
          patientEmail: labTest.patientEmail,
          phone: labTest.phone,
          visitDate: new Date(),
          doctorName: labTest.doctorName,
          createdBy: null,
          patientUploads: [uploadData],
        });
        await patientRecord.save();
        console.log(`   ✅ Created new patient record: ${patientRecord._id}`);
      }

      console.log(
        "\n✅ Done! The lab upload should now be visible in patient records.",
      );
      console.log("\n📝 To verify in frontend:");
      console.log(`   1. Login as doctor`);
      console.log(`   2. Go to patient records for: ${labTest.patientEmail}`);
      console.log(`   3. Look for "📋 Patient & Lab Reports" section`);
      console.log(`   4. You should see: "${uploadData.title}"`);
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

findAndFix();
