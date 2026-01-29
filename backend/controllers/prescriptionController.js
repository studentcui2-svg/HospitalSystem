const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");
const sendEmail = require("../utils/email");
const QRCode = require("qrcode");

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      patientId,
      doctorName,
      doctorEmail,
      specialization,
      diagnosis,
      medicines,
      generalInstructions,
      dietaryAdvice,
      followUpDate,
      appointment,
      patientRecord,
    } = req.body;

    if (!patientName || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        message: "Patient name, diagnosis, and at least one medicine required",
      });
    }

    // Check for drug interactions
    const medicineIds = medicines.map((m) => m.medicine);
    const medicineDetails = await Medicine.find({ _id: { $in: medicineIds } });

    const warnings = [];
    for (let i = 0; i < medicineDetails.length; i++) {
      for (let j = i + 1; j < medicineDetails.length; j++) {
        const med1 = medicineDetails[i];
        const med2 = medicineDetails[j];

        // Check if med1 interacts with med2
        if (
          med1.interactsWith &&
          med1.interactsWith.some((id) => id.equals(med2._id))
        ) {
          warnings.push(`⚠️ ${med1.name} may interact with ${med2.name}`);
        }
      }

      // Add specific interaction warnings
      if (
        medicineDetails[i].interactionWarnings &&
        medicineDetails[i].interactionWarnings.length > 0
      ) {
        warnings.push(...medicineDetails[i].interactionWarnings);
      }
    }

    // Generate QR code for pharmacy scanning
    const qrData = {
      prescriptionId: new Date().getTime().toString(),
      patientName,
      doctorName,
    };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    const prescription = new Prescription({
      patientName,
      patientEmail,
      patientPhone,
      patientId,
      doctor: req.userId,
      doctorName: doctorName || req.user?.name || "Doctor",
      doctorEmail: doctorEmail || req.user?.email,
      specialization,
      diagnosis,
      medicines,
      generalInstructions,
      dietaryAdvice,
      followUpDate,
      appointment,
      patientRecord,
      qrCode,
    });

    await prescription.save();

    // Send email to patient
    console.log("[Prescription] Checking email delivery...");
    console.log("[Prescription] Patient email:", patientEmail);
    console.log("[Prescription] QR Code generated:", qrCode ? "YES" : "NO");
    console.log("[Prescription] QR Code length:", qrCode?.length || 0);

    if (patientEmail) {
      try {
        console.log("[Prescription] Preparing email with QR code...");
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
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px; }
    .qr-code { text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Digital Prescription</h1>
    </div>
    <div class="content">
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
        <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName} ${specialization ? `(${specialization})` : ""}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Prescription ID:</strong> ${prescription._id}</p>
      </div>

      <h3 style="color: #1f2937; margin-top: 20px;">🩺 Diagnosis:</h3>
      <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">${diagnosis}</p>

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

      ${
        warnings.length > 0
          ? `
        <div class="warning">
          <strong>⚠️ Important Warnings:</strong>
          <ul style="margin: 10px 0;">
            ${warnings.map((w) => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        generalInstructions
          ? `
        <h3 style="color: #1f2937; margin-top: 20px;">📝 General Instructions:</h3>
        <p style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">${generalInstructions}</p>
      `
          : ""
      }

      ${
        dietaryAdvice
          ? `
        <h3 style="color: #1f2937; margin-top: 20px;">🍽️ Dietary Advice:</h3>
        <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">${dietaryAdvice}</p>
      `
          : ""
      }

      ${
        followUpDate
          ? `
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <strong style="color: #1e40af;">📅 Follow-up Appointment: ${new Date(followUpDate).toLocaleDateString()}</strong>
        </div>
      `
          : ""
      }

      <div class="qr-code">
        <p><strong>Pharmacy QR Code:</strong></p>
        <img src="cid:qrcode" alt="Prescription QR Code" style="max-width: 200px; display: block; margin: 0 auto;" />
        <p style="font-size: 12px; color: #6b7280;">Show this QR code at the pharmacy</p>
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
      <p><strong>Hospital Management System</strong></p>
      <p>For queries, contact: ${doctorEmail || "hospital@example.com"}</p>
    </div>
  </div>
</body>
</html>
        `;

        console.log(
          "[Prescription] Email HTML prepared, length:",
          emailHtml.length,
        );
        console.log("[Prescription] Sending email to:", patientEmail);

        // Convert base64 QR code to buffer for CID attachment (more compatible than inline base64)
        const qrBuffer = Buffer.from(qrCode.split(",")[1], "base64");
        console.log(
          "[Prescription] QR buffer created, size:",
          qrBuffer.length,
          "bytes",
        );

        await sendEmail({
          to: patientEmail,
          subject: `📋 Prescription from Dr. ${doctorName}`,
          html: emailHtml,
          attachments: [
            {
              filename: "prescription-qr.png",
              content: qrBuffer,
              contentType: "image/png",
              cid: "qrcode", // This matches the src="cid:qrcode" in HTML
            },
          ],
        });

        console.log("[Prescription] ✓ Email sent successfully!");
      } catch (emailErr) {
        console.error("[Prescription] ✗ Email sending failed!");
        console.error("[Prescription] Email error:", emailErr?.message);
        console.error("[Prescription] Full error:", emailErr);
        // Don't throw error, just log it
      }
    } else {
      console.log(
        "[Prescription] ⚠️ No patient email provided, skipping email",
      );
    }

    res.status(201).json({
      ok: true,
      prescription,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (err) {
    console.error("[Prescription] Create error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientEmail } = req.params;

    const prescriptions = await Prescription.find({ patientEmail })
      .populate("medicines.medicine")
      .sort({ createdAt: -1 });

    res.json({ prescriptions });
  } catch (err) {
    console.error("[Prescription] Get patient prescriptions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get prescriptions for a doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.userId })
      .populate("medicines.medicine")
      .sort({ createdAt: -1 });

    res.json({ prescriptions });
  } catch (err) {
    console.error("[Prescription] Get doctor prescriptions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all pending prescriptions for pharmacy
exports.getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ status: "Pending" })
      .populate("medicines.medicine")
      .sort({ createdAt: -1 });

    res.json({ prescriptions });
  } catch (err) {
    console.error("[Prescription] Get pending prescriptions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update prescription status (pharmacy)
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pharmacyRemarks } = req.body;

    const prescription =
      await Prescription.findById(id).populate("medicines.medicine");
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    prescription.status = status;
    prescription.pharmacyRemarks = pharmacyRemarks;

    let receipt = null;
    let totalAmount = 0;

    if (status === "Dispensed" || status === "PartiallyDispensed") {
      prescription.dispensedBy = req.userId;
      prescription.dispensedAt = new Date();

      // Update medicine stock and calculate total
      const stockUpdates = [];
      const receiptItems = [];

      for (const item of prescription.medicines) {
        const medicine = await Medicine.findById(item.medicine);

        if (!medicine) {
          return res.status(404).json({
            message: `Medicine not found: ${item.medicineName}`,
          });
        }

        if (medicine.stockQuantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}, Required: ${item.quantity}`,
          });
        }

        // Deduct stock
        medicine.stockQuantity -= item.quantity;
        await medicine.save();

        const itemTotal = medicine.price * item.quantity;
        totalAmount += itemTotal;

        receiptItems.push({
          medicineName: medicine.name,
          genericName: medicine.genericName,
          strength: medicine.strength,
          quantity: item.quantity,
          unitPrice: medicine.price,
          total: itemTotal,
        });
      }

      // Generate receipt
      receipt = {
        receiptNumber: `RX-${Date.now()}`,
        prescriptionId: prescription._id,
        patientName: prescription.patientName,
        patientEmail: prescription.patientEmail,
        doctorName: prescription.doctorName,
        items: receiptItems,
        subtotal: totalAmount,
        tax: totalAmount * 0.05, // 5% tax
        total: totalAmount * 1.05,
        dispensedAt: new Date(),
        paymentStatus: "Paid",
      };

      // Send receipt email to patient
      if (prescription.patientEmail) {
        try {
          const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .receipt-container { border: 2px solid #059669; border-radius: 10px; padding: 30px; background: white; }
    .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #059669; margin: 0; }
    .receipt-number { font-size: 14px; color: #6b7280; margin-top: 10px; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; color: #059669; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { font-weight: 600; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #059669; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f9fafb; }
    .totals { margin-top: 20px; padding: 20px; background: #f0fdf4; border-radius: 8px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .grand-total { font-size: 20px; font-weight: bold; color: #059669; border-top: 2px solid #059669; margin-top: 10px; padding-top: 10px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    .stamp { text-align: center; margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px; }
    .stamp-text { font-size: 18px; font-weight: bold; color: #92400e; }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>🏥 PHARMACY RECEIPT</h1>
      <div class="receipt-number">Receipt #: ${receipt.receiptNumber}</div>
      <div class="receipt-number">Date: ${new Date().toLocaleString()}</div>
    </div>

    <div class="section">
      <div class="section-title">Patient Information</div>
      <div class="info-row">
        <span class="info-label">Patient Name:</span>
        <span>${prescription.patientName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Prescribed By:</span>
        <span>Dr. ${prescription.doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Diagnosis:</span>
        <span>${prescription.diagnosis}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Dispensed Medicines</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine Name</th>
            <th>Strength</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${receiptItems
            .map(
              (item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <strong>${item.medicineName}</strong><br>
                <small style="color: #6b7280;">${item.genericName}</small>
              </td>
              <td>${item.strength}</td>
              <td>${item.quantity}</td>
              <td>PKR ${item.unitPrice.toFixed(2)}</td>
              <td><strong>PKR ${item.total.toFixed(2)}</strong></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>PKR ${receipt.subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Tax (5%):</span>
        <span>PKR ${receipt.tax.toFixed(2)}</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL PAID:</span>
        <span>PKR ${receipt.total.toFixed(2)}</span>
      </div>
    </div>

    <div class="stamp">
      <div class="stamp-text">✓ PAID</div>
      <div style="font-size: 12px; margin-top: 10px;">Payment received in full</div>
    </div>

    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <strong>⚠️ Important Instructions:</strong>
      <ul style="margin: 10px 0;">
        <li>Take medicines exactly as prescribed by your doctor</li>
        <li>Complete the full course even if you feel better</li>
        <li>Store medicines in a cool, dry place away from direct sunlight</li>
        <li>Keep medicines out of reach of children</li>
        <li>Check expiry dates before consumption</li>
        <li>Contact your doctor if you experience any adverse effects</li>
      </ul>
    </div>

    <div class="footer">
      <p><strong>Hospital Pharmacy</strong></p>
      <p>Thank you for choosing our pharmacy services!</p>
      <p style="margin-top: 10px;">This is a computer-generated receipt</p>
    </div>
  </div>
</body>
</html>
          `;

          await sendEmail({
            to: prescription.patientEmail,
            subject: `🧾 Pharmacy Receipt - ${receipt.receiptNumber}`,
            html: receiptHtml,
          });
        } catch (emailErr) {
          console.warn("Failed to send receipt email:", emailErr?.message);
        }
      }
    }

    await prescription.save();

    res.json({ ok: true, prescription, receipt });
  } catch (err) {
    console.error("[Prescription] Update status error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription =
      await Prescription.findById(id).populate("medicines.medicine");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({ prescription });
  } catch (err) {
    console.error("[Prescription] Get by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
