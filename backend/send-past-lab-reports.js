const mongoose = require("mongoose");
require("dotenv").config();
const sendEmail = require("./utils/email");

async function sendPastReports() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/hospital-management";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const LabTest = require("./models/LabTest");
    const Doctor = require("./models/Doctor");
    const User = require("./models/User");

    // Find all completed lab tests with reports
    const testsWithReports = await LabTest.find({
      status: "Completed",
      "report.url": { $exists: true },
    });

    console.log(`📋 Found ${testsWithReports.length} completed lab reports\n`);

    if (testsWithReports.length === 0) {
      console.log("No reports to send.");
      process.exit(0);
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const lt of testsWithReports) {
      console.log(`\n📧 Processing: ${lt.testName} for ${lt.patientName}`);

      try {
        const toList = [];

        // Add patient email
        if (lt.patientEmail) {
          toList.push(lt.patientEmail);
          console.log(`   ✓ Patient: ${lt.patientEmail}`);
        }

        // Find doctor email
        let doctorDoc = null;

        if (lt.doctor) {
          doctorDoc = await Doctor.findById(lt.doctor).select("email name");
          if (!doctorDoc) {
            doctorDoc = await User.findById(lt.doctor).select("email name");
          }
        }

        if (!doctorDoc && lt.doctorName) {
          doctorDoc = await Doctor.findOne({ name: lt.doctorName }).select(
            "email name",
          );
          if (!doctorDoc) {
            doctorDoc = await User.findOne({
              name: lt.doctorName,
              role: "doctor",
            }).select("email name");
          }
        }

        if (doctorDoc && doctorDoc.email) {
          toList.push(doctorDoc.email);
          console.log(`   ✓ Doctor: ${doctorDoc.email}`);
        } else {
          console.log(`   ⚠️  Doctor not found: ${lt.doctorName}`);
        }

        if (toList.length === 0) {
          console.log(`   ❌ No recipients found, skipping...`);
          errorCount++;
          continue;
        }

        // Send email
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const reportUrl = `${baseUrl}${lt.report.url}`;

        await sendEmail({
          to: toList.join(","),
          subject: `Lab Test Report Available: ${lt.testName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">🧪 Lab Test Report Available</h2>
              <p>The lab test <strong>${lt.testName}</strong> for patient <strong>${lt.patientName}</strong> has been completed.</p>
              
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">Test Details:</h3>
                <p><strong>Patient:</strong> ${lt.patientName}</p>
                <p><strong>Test Name:</strong> ${lt.testName}</p>
                <p><strong>Status:</strong> Completed</p>
                <p><strong>Upload Date:</strong> ${new Date(lt.report.uploadedAt).toLocaleDateString()}</p>
              </div>
              
              <p>The report is now available in the patient records portal and can be downloaded using the link below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${reportUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">📄 Download Report</a>
              </div>
              
              <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">You can also view this report in the patient records section of your portal.</p>
            </div>
          `,
        });

        console.log(`   ✅ Email sent to: ${toList.join(", ")}`);
        sentCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`   ❌ Failed to send email:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY:");
    console.log("=".repeat(60));
    console.log(`Total reports: ${testsWithReports.length}`);
    console.log(`✅ Emails sent: ${sentCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=".repeat(60));

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

sendPastReports();
