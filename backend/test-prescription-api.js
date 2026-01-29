require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

console.log("=".repeat(70));
console.log("🏥 PRESCRIPTION API TEST - Full Flow with QR Code Email");
console.log("=".repeat(70));

async function testPrescriptionAPI() {
  try {
    // 1. Connect to MongoDB
    console.log("\n[1] Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to database");

    // 2. Import models and controller
    const User = require("./models/User");
    const Medicine = require("./models/Medicine");
    const prescriptionController = require("./controllers/prescriptionController");

    // 3. Find a doctor user
    console.log("\n[2] Finding doctor user...");
    const doctor = await User.findOne({ role: "doctor" });
    if (!doctor) {
      console.error("✗ No doctor found in database");
      process.exit(1);
    }
    console.log("✓ Doctor found:", doctor.name, `(${doctor.email})`);

    // 4. Find some medicines
    console.log("\n[3] Finding medicines...");
    const medicines = await Medicine.find().limit(3);
    if (medicines.length === 0) {
      console.error("✗ No medicines found in database");
      process.exit(1);
    }
    console.log(`✓ Found ${medicines.length} medicines:`);
    medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.name} - ${med.form}`);
    });

    // 5. Create test prescription data
    console.log("\n[4] Creating test prescription...");
    const testPrescription = {
      patientName: "Test Patient for QR",
      patientEmail: process.env.SMTP_USER, // Send to yourself
      patientPhone: "1234567890",
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      specialization: doctor.specialization || "General Medicine",
      diagnosis: "Test diagnosis for QR code email verification",
      medicines: medicines.map((med) => ({
        medicine: med._id,
        medicineName: med.name,
        dosage: `${med.strength} ${med.form}`,
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "Take after meals",
        quantity: 10,
      })),
      generalInstructions: "Get adequate rest and drink plenty of water",
      dietaryAdvice: "Avoid spicy food",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    console.log("  Patient:", testPrescription.patientName);
    console.log("  Patient Email:", testPrescription.patientEmail);
    console.log("  Doctor:", testPrescription.doctorName);
    console.log("  Medicines:", testPrescription.medicines.length);
    console.log("  Diagnosis:", testPrescription.diagnosis);

    // 6. Mock request and response objects
    const req = {
      userId: doctor._id,
      user: doctor,
      body: testPrescription,
    };

    let responseData = null;
    let statusCode = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    // 7. Call the controller
    console.log("\n[5] Calling prescription controller...");
    await prescriptionController.createPrescription(req, res);

    // 8. Check results
    console.log("\n[6] Checking results...");
    console.log("  Status Code:", statusCode);

    if (statusCode === 201 && responseData?.ok) {
      console.log("\n" + "=".repeat(70));
      console.log("✅ SUCCESS! Prescription created successfully");
      console.log("=".repeat(70));
      console.log("Prescription ID:", responseData.prescription._id);
      console.log(
        "QR Code:",
        responseData.prescription.qrCode ? "Generated ✓" : "Missing ✗",
      );
      console.log(
        "QR Code Length:",
        responseData.prescription.qrCode?.length || 0,
      );

      if (responseData.warnings) {
        console.log("\n⚠️ Warnings:", responseData.warnings.join(", "));
      }

      console.log("\n📧 EMAIL STATUS:");
      console.log("Check your inbox:", testPrescription.patientEmail);
      console.log(
        "Subject: 📋 Prescription from Dr.",
        testPrescription.doctorName,
      );
      console.log("\nWhat to verify:");
      console.log("1. Email received");
      console.log("2. QR code image visible");
      console.log("3. All medicines listed");
      console.log("4. Diagnosis shown");
      console.log("5. General instructions included");
      console.log("=".repeat(70));
    } else {
      console.error("\n" + "=".repeat(70));
      console.error("❌ FAILED! Prescription creation failed");
      console.error("=".repeat(70));
      console.error("Status:", statusCode);
      console.error("Response:", responseData);
      console.error("=".repeat(70));
    }

    // Cleanup
    await mongoose.connection.close();
    console.log("\n✓ Database connection closed");
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ ERROR:", error.message);
    console.error("=".repeat(70));
    console.error("\nFull error:");
    console.error(error);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Run the test
testPrescriptionAPI()
  .then(() => {
    console.log("\n✓ Test complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n✗ Test failed:", err);
    process.exit(1);
  });
