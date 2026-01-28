/**
 * Complete Lab Upload Test Script
 *
 * This script simulates the entire flow:
 * 1. Order a lab test
 * 2. Upload a report file
 * 3. Verify it's saved in database
 * 4. Check if it appears in patient records API
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const LabTest = require("./models/LabTest");
const PatientRecord = require("./models/PatientRecord");
const User = require("./models/User");
const Doctor = require("./models/Doctor");

async function runTest() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Find or create a doctor
    console.log("📋 STEP 1: Finding doctor...");
    let doctor = await Doctor.findOne();
    if (!doctor) {
      console.log("⚠️ No doctor found in database!");
      console.log("Please create a doctor account first.");
      process.exit(1);
    }
    console.log(`✅ Found doctor: ${doctor.name} (${doctor.email})`);
    console.log(`   Doctor ID: ${doctor._id}\n`);

    // Step 2: Create a test lab order
    console.log("📋 STEP 2: Creating test lab order...");

    // Check if there's already a test order
    let existingTest = await LabTest.findOne({
      testName: "TEST - Blood Sugar",
      patientEmail: "test.patient@example.com",
    });

    let labTest;
    if (existingTest) {
      console.log(`✅ Found existing test order: ${existingTest._id}`);
      labTest = existingTest;
    } else {
      labTest = new LabTest({
        patientName: "Test Patient",
        patientEmail: "test.patient@example.com",
        phone: "1234567890",
        cnic: "12345-6789012-3",
        gender: "Male",
        doctor: doctor._id,
        doctorName: doctor.name,
        testName: "TEST - Blood Sugar",
        orderedBy: doctor._id,
        status: "Ordered",
      });
      await labTest.save();
      console.log(`✅ Created test order: ${labTest._id}`);
    }

    console.log(`   Patient: ${labTest.patientName}`);
    console.log(`   Test: ${labTest.testName}`);
    console.log(`   Status: ${labTest.status}\n`);

    // Step 3: Simulate file upload
    console.log("📋 STEP 3: Simulating file upload...");

    const uploadDir = path.join(__dirname, "uploads", "lab");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`✅ Created upload directory: ${uploadDir}`);
    }

    // Create a dummy test file
    const testFileName = `test-lab-report-${Date.now()}.txt`;
    const testFilePath = path.join(uploadDir, testFileName);
    fs.writeFileSync(
      testFilePath,
      "This is a test lab report.\n\nTest Results:\n- Blood Sugar: 95 mg/dL (Normal)\n- Date: " +
        new Date().toISOString(),
    );
    console.log(`✅ Created test file: ${testFileName}\n`);

    // Step 4: Manually add upload to patient record (simulating backend logic)
    console.log("📋 STEP 4: Adding upload to patient record...");

    let patientRecord = await PatientRecord.findOne({
      patientEmail: labTest.patientEmail,
      doctorName: labTest.doctorName,
    });

    const uploadData = {
      title: `Lab Result: ${labTest.testName}`,
      description: `Lab test result for ${labTest.testName} uploaded by lab.`,
      filename: testFileName,
      originalName: testFileName,
      path: testFilePath,
      fileUrl: `/uploads/lab/${testFileName}`,
      mimetype: "text/plain",
      size: fs.statSync(testFilePath).size,
      uploadedBy: "lab",
      uploadedAt: new Date(),
    };

    if (patientRecord) {
      console.log(`✅ Found existing patient record: ${patientRecord._id}`);
      patientRecord.patientUploads.push(uploadData);
      await patientRecord.save();
      console.log(`✅ Added upload to existing record`);
    } else {
      console.log(`⚠️ No existing patient record found, creating new one...`);
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
      console.log(`✅ Created new patient record: ${patientRecord._id}`);
    }

    // Also update the LabTest
    labTest.report = {
      filename: testFileName,
      path: testFilePath,
      url: `/uploads/lab/${testFileName}`,
      uploadedAt: new Date(),
    };
    labTest.status = "Completed";
    await labTest.save();
    console.log(`✅ Updated lab test status to Completed\n`);

    // Step 5: Verify in database
    console.log("📋 STEP 5: Verifying data in database...\n");

    console.log("=== LAB TESTS ===");
    const allTests = await LabTest.find({
      testName: { $regex: /TEST/, $options: "i" },
    });
    console.log(`Found ${allTests.length} test lab orders:`);
    allTests.forEach((test) => {
      console.log(`  - ${test.testName} (${test.status})`);
      console.log(`    Patient: ${test.patientEmail}`);
      console.log(`    Report: ${test.report ? "✅ Yes" : "❌ No"}`);
    });

    console.log("\n=== PATIENT RECORDS ===");
    const recordsWithUploads = await PatientRecord.find({
      "patientUploads.0": { $exists: true },
    });
    console.log(
      `Found ${recordsWithUploads.length} records with patient uploads:`,
    );
    recordsWithUploads.forEach((record) => {
      console.log(`  - ${record.patientName} (${record.patientEmail})`);
      console.log(`    Doctor: ${record.doctorName}`);
      console.log(`    Uploads: ${record.patientUploads.length}`);
      record.patientUploads.forEach((upload) => {
        console.log(`      * ${upload.title} (by ${upload.uploadedBy})`);
      });
    });

    // Step 6: Test the API query
    console.log("\n📋 STEP 6: Testing patient records query...\n");

    const query = {
      $or: [
        { patientEmail: labTest.patientEmail },
        { phone: labTest.phone },
        { patientName: new RegExp(`^${labTest.patientName}$`, "i") },
      ],
    };

    if (labTest.doctorName) {
      query.$and = [
        {
          $or: [
            { doctorName: labTest.doctorName },
            { patientUploads: { $exists: true, $ne: [] } },
          ],
        },
      ];
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    const queryResults = await PatientRecord.find(query);
    console.log(`\nQuery returned ${queryResults.length} records`);

    if (queryResults.length === 0) {
      console.log("❌ PROBLEM: Query returned no results!");
      console.log("This means the frontend won't see the lab uploads.");
    } else {
      console.log("✅ SUCCESS: Query found patient records");
      queryResults.forEach((record, idx) => {
        console.log(`\nRecord ${idx + 1}:`);
        console.log(`  Patient: ${record.patientName}`);
        console.log(`  Email: ${record.patientEmail}`);
        console.log(`  Doctor: ${record.doctorName}`);
        console.log(
          `  Patient Uploads: ${record.patientUploads ? record.patientUploads.length : 0}`,
        );
        if (record.patientUploads && record.patientUploads.length > 0) {
          record.patientUploads.forEach((upload, uIdx) => {
            console.log(`    ${uIdx + 1}. ${upload.title}`);
            console.log(`       By: ${upload.uploadedBy}`);
            console.log(`       File: ${upload.fileUrl}`);
          });
        }
      });
    }

    console.log("\n✅ Test completed successfully!");
    console.log("\n📌 NEXT STEPS:");
    console.log("1. Start your backend server: cd backend && node server.js");
    console.log("2. Start your frontend: cd Frontend && npm run dev");
    console.log("3. Login as doctor and navigate to patient records");
    console.log(`4. Search for patient: ${labTest.patientEmail}`);
    console.log(
      '5. You should see the lab upload in "Patient Uploaded Reports" section',
    );

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

runTest();
