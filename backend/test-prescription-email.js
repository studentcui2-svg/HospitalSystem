require("dotenv").config();
const mongoose = require("mongoose");
const sendEmail = require("./utils/email");
const QRCode = require("qrcode");

console.log("=".repeat(60));
console.log("📧 PRESCRIPTION EMAIL TEST WITH QR CODE");
console.log("=".repeat(60));

async function testPrescriptionEmail() {
  try {
    // 1. Generate QR Code
    console.log("\n[1] Generating QR Code...");
    const qrData = {
      prescriptionId: "TEST-" + new Date().getTime().toString(),
      patientName: "Test Patient",
      doctorName: "Dr. Test Doctor",
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    console.log("✓ QR Code generated successfully");
    console.log("  QR Code length:", qrCode.length);
    console.log("  QR Code preview:", qrCode.substring(0, 50) + "...");

    // 2. Create test prescription data
    const medicines = [
      {
        medicineName: "Paracetamol 500mg",
        dosage: "1 tablet",
        frequency: "3 times daily",
        duration: "5 days",
        instructions: "Take after meals",
      },
      {
        medicineName: "Amoxicillin 250mg",
        dosage: "1 capsule",
        frequency: "2 times daily",
        duration: "7 days",
        instructions: "Take with water",
      },
    ];

    const medicineList = medicines
      .map(
        (med, idx) =>
          `<tr style="background: ${idx % 2 === 0 ? "#f9fafb" : "white"};">
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${idx + 1}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>${med.medicineName}</strong></td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.dosage}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.frequency}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.duration}</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.instructions || "-"}</td>
          </tr>`,
      )
      .join("");

    // 3. Create email HTML with QR code
    console.log("\n[2] Creating email HTML with QR code...");
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #667eea; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border: 1px solid #e5e7eb; }
    .qr-code { text-align: center; margin: 20px 0; background: #f0fdf4; padding: 20px; border-radius: 8px; }
    .footer { text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Digital Prescription - TEST</h1>
    </div>
    <div class="content">
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>Patient:</strong> Test Patient</p>
        <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. Test Doctor (General Medicine)</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Prescription ID:</strong> ${qrData.prescriptionId}</p>
      </div>

      <h3 style="color: #1f2937; margin-top: 20px;">🩺 Diagnosis:</h3>
      <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">Viral Fever with throat infection</p>

      <h3 style="color: #1f2937; margin-top: 20px;">💊 Prescribed Medications:</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${medicineList}
        </tbody>
      </table>

      <div class="qr-code">
        <h3 style="color: #10b981; margin-top: 0;">📱 Pharmacy QR Code</h3>
        <img src="${qrCode}" alt="QR Code" style="max-width: 200px; border: 2px solid #10b981; border-radius: 8px; padding: 10px; background: white;" />
        <p style="font-size: 14px; color: #059669; margin-top: 10px;"><strong>Show this QR code at the pharmacy</strong></p>
        <p style="font-size: 12px; color: #6b7280;">QR Code contains: Prescription ID, Patient Name, Doctor Name</p>
      </div>

      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <strong>⚠️ Important Notes:</strong>
        <ul style="margin: 10px 0;">
          <li>Take medicines exactly as prescribed</li>
          <li>Complete the full course even if you feel better</li>
          <li>Store medicines in a cool, dry place</li>
          <li>Contact your doctor if you experience any side effects</li>
          <li>This prescription is valid for 30 days</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Hospital Management System - Email Test</strong></p>
      <p>This is a test email to verify QR code delivery</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log("✓ Email HTML created");
    console.log("  HTML length:", emailHtml.length);

    // 4. Send test email
    console.log("\n[3] Sending test email...");
    console.log("  To:", process.env.SMTP_USER);
    console.log("  Subject: TEST - Prescription with QR Code");

    const result = await sendEmail({
      to: process.env.SMTP_USER, // Send to yourself
      subject: "📋 TEST - Prescription with QR Code",
      html: emailHtml,
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUCCESS! Email sent successfully");
    console.log("=".repeat(60));
    console.log("Message ID:", result.messageId);
    console.log("\n📬 Check your inbox:", process.env.SMTP_USER);
    console.log("   Look for: 'TEST - Prescription with QR Code'");
    console.log("   Verify: QR code image is visible in the email");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ ERROR:", error.message);
    console.error("=".repeat(60));
    console.error("\nFull error:");
    console.error(error);
    console.error("\nTroubleshooting:");
    console.error("1. Check SMTP credentials in .env file");
    console.error("2. For Gmail, use App Password (not regular password)");
    console.error("3. Verify SMTP_HOST and SMTP_PORT are correct");
    console.error("4. Check internet connection");
  }
}

// Run the test
testPrescriptionEmail()
  .then(() => {
    console.log("\n✓ Test complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n✗ Test failed:", err);
    process.exit(1);
  });
