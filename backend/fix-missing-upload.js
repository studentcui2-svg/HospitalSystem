const mongoose = require("mongoose");
require("dotenv").config();

async function checkPatient() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const PatientRecord = require("./models/PatientRecord");
    const LabTest = require("./models/LabTest");

    const patientEmail = "studentcui2@gmail.com";
    const doctorName = "Shoail  Afridi";

    console.log("🔍 Searching for patient records...");
    console.log(`Patient Email: ${patientEmail}`);
    console.log(`Doctor Name: "${doctorName}"`);
    console.log("");

    // Check lab test
    const labTest = await LabTest.findOne({
      patientEmail,
      testName: "Blood Suger",
    });

    if (labTest) {
      console.log("✅ Lab Test Found:");
      console.log(`   Test: ${labTest.testName}`);
      console.log(`   Status: ${labTest.status}`);
      console.log(`   Doctor: "${labTest.doctorName}"`);
      console.log(`   Has Report: ${labTest.report ? "YES" : "NO"}`);
      if (labTest.report) {
        console.log(`   Report URL: ${labTest.report.url}`);
      }
      console.log("");
    } else {
      console.log("❌ Lab test not found!\n");
    }

    // Check patient records with exact doctor name
    const exactRecords = await PatientRecord.find({
      patientEmail,
      doctorName,
    });

    console.log(
      `Patient Records with exact doctor name: ${exactRecords.length}`,
    );
    if (exactRecords.length > 0) {
      exactRecords.forEach((r, i) => {
        console.log(
          `  ${i + 1}. Visit: ${new Date(r.visitDate).toLocaleDateString()}`,
        );
        console.log(`     Doctor: "${r.doctorName}"`);
        console.log(
          `     Patient Uploads: ${r.patientUploads ? r.patientUploads.length : 0}`,
        );
      });
    }
    console.log("");

    // Check all patient records for this email
    const allRecords = await PatientRecord.find({ patientEmail });
    console.log(
      `All Patient Records for ${patientEmail}: ${allRecords.length}`,
    );
    if (allRecords.length > 0) {
      allRecords.forEach((r, i) => {
        console.log(`  ${i + 1}. Doctor: "${r.doctorName}"`);
        console.log(
          `     Visit: ${new Date(r.visitDate).toLocaleDateString()}`,
        );
        console.log(
          `     Patient Uploads: ${r.patientUploads ? r.patientUploads.length : 0}`,
        );
        if (r.patientUploads && r.patientUploads.length > 0) {
          r.patientUploads.forEach((u, idx) => {
            console.log(`       ${idx + 1}. ${u.title} (by ${u.uploadedBy})`);
          });
        }
      });
    }
    console.log("");

    // Check for records with lab uploads
    const withLabUploads = await PatientRecord.find({
      patientEmail,
      "patientUploads.uploadedBy": "lab",
    });

    console.log(`Records with Lab Uploads: ${withLabUploads.length}`);
    console.log("");

    // Now manually add the upload if it doesn't exist
    if (labTest && labTest.report && exactRecords.length === 0) {
      console.log("⚠️  Lab test has report but NO patient record found!");
      console.log("   Creating new patient record with lab upload...\n");

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

      const newRecord = new PatientRecord({
        patientName: labTest.patientName,
        patientEmail: labTest.patientEmail,
        phone: labTest.phone,
        visitDate: new Date(),
        doctorName: labTest.doctorName,
        createdBy: null,
        patientUploads: [uploadData],
      });

      await newRecord.save();
      console.log("✅ Created new patient record:", newRecord._id);
      console.log("   Now the upload should be visible in patient records!\n");
    } else if (labTest && labTest.report && exactRecords.length > 0) {
      // Check if upload already exists
      const record = exactRecords[0];
      const hasThisUpload = record.patientUploads.some(
        (u) => u.filename === labTest.report.filename,
      );

      if (!hasThisUpload) {
        console.log("⚠️  Patient record exists but lab upload is missing!");
        console.log("   Adding lab upload to existing record...\n");

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

        record.patientUploads.push(uploadData);
        await record.save();
        console.log("✅ Added lab upload to patient record!");
        console.log("   Now the upload should be visible!\n");
      } else {
        console.log("✅ Upload already exists in patient record!");
        console.log("   It should be visible in the frontend.\n");
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkPatient();
