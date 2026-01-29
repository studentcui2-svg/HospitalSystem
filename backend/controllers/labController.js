const LabTest = require("../models/LabTest");
const sendEmail = require("../utils/email");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Multer storage for lab reports
const uploadDir = path.join(__dirname, "..", "uploads", "lab");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({ storage });

exports.orderTest = async (req, res) => {
  try {
    const {
      patientName,
      patientEmail,
      phone,
      cnic,
      gender,
      doctor,
      doctorName,
      testName,
    } = req.body;

    if (!patientName || !testName) {
      return res
        .status(400)
        .json({ message: "patientName and testName required" });
    }

    const lt = new LabTest({
      patientName,
      patientEmail,
      phone,
      cnic,
      gender,
      doctor,
      doctorName,
      testName,
      orderedBy: req.userId,
      status: "Ordered",
    });

    await lt.save();

    // Send email to patient
    if (patientEmail) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .test-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .test-name { font-size: 18px; font-weight: 700; color: #1e40af; margin-bottom: 5px; }
    .doctor-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .info-label { font-weight: 600; color: #4b5563; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Lab Test Requested</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${patientName}</strong>,</p>
      
      <p>Your physician has requested the following laboratory test(s) for your medical evaluation:</p>
      
      <div class="test-box">
        <div class="test-name">🔬 ${testName}</div>
        <p style="margin: 5px 0 0 0; color: #6b7280;">Status: <span style="color: #f59e0b; font-weight: 600;">Ordered - Pending Sample Collection</span></p>
      </div>

      <div class="doctor-info">
        <p style="margin: 5px 0;"><span class="info-label">👨‍⚕️ Ordered by:</span> Dr. ${doctorName || "Your Physician"}</p>
        <p style="margin: 5px 0;"><span class="info-label">📅 Order Date:</span> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="alert">
        <strong>⚠️ Important Instructions:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Please visit our hospital laboratory to complete this test</li>
          <li>Bring a valid ID and this email confirmation</li>
          <li>Fasting may be required for certain tests - please call us to confirm</li>
          <li>Lab hours: Monday - Saturday, 7:00 AM - 2:00 PM</li>
        </ul>
      </div>

      <p><strong>What to bring:</strong></p>
      <ul>
        <li>Valid identification (CNIC/Passport)</li>
        <li>Any previous medical reports (if applicable)</li>
        <li>Prescription or referral letter (if available)</li>
      </ul>

      <p>If you have any questions or need to schedule your lab visit, please contact our laboratory department.</p>

      <center>
        <a href="tel:+92XXXXXXXXXX" class="cta-button">📞 Call Lab: +92-XXX-XXXXXXX</a>
      </center>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Note:</strong> Test results will be made available to your doctor within 24-48 hours of sample collection. You will be notified once results are ready.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Hospital Management System</strong></p>
      <p>This is an automated notification. Please do not reply to this email.</p>
      <p>For assistance, contact our support team.</p>
    </div>
  </div>
</body>
</html>
        `;

        await sendEmail({
          to: patientEmail,
          subject: `🔬 Lab Test Requested: ${testName}`,
          html: emailHtml,
        });
      } catch (emailErr) {
        console.warn(
          "Failed to send patient test notification:",
          emailErr?.message,
        );
      }
    }

    // Optionally notify lab email
    const labEmail = process.env.LAB_EMAIL;
    if (labEmail) {
      try {
        await sendEmail({
          to: labEmail,
          subject: `New Lab Test Ordered: ${testName}`,
          html: `<p>New test ordered by Dr. ${doctorName || "(unknown)"} for patient <strong>${patientName}</strong>.</p>
                 <p>Test: <strong>${testName}</strong></p>
                 <p>Please check the lab portal to process this order.</p>`,
        });
      } catch (e) {
        console.warn("Failed to send lab notification", e && e.message);
      }
    }

    res.status(201).json({ ok: true, labTest: lt });
  } catch (err) {
    console.error("[LAB] orderTest error:", err && err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTests = async (req, res) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.patientEmail) q.patientEmail = req.query.patientEmail;

    const tests = await LabTest.find(q).sort({ createdAt: -1 });

    // Enrich tests with doctor email
    const enrichedTests = await Promise.all(
      tests.map(async (test) => {
        const testObj = test.toObject();

        // Try to find doctor email
        if (test.doctor) {
          const Doctor = require("../models/Doctor");
          const User = require("../models/User");

          let doctorDoc = await Doctor.findById(test.doctor).select("email");
          if (!doctorDoc) {
            doctorDoc = await User.findById(test.doctor).select("email");
          }

          if (doctorDoc && doctorDoc.email) {
            testObj.doctorEmail = doctorDoc.email;
          }
        } else if (test.doctorName) {
          // Try to find by name if no ID
          const Doctor = require("../models/Doctor");
          const User = require("../models/User");

          let doctorDoc = await Doctor.findOne({
            name: test.doctorName,
          }).select("email");
          if (!doctorDoc) {
            doctorDoc = await User.findOne({
              name: test.doctorName,
              role: "doctor",
            }).select("email");
          }

          if (doctorDoc && doctorDoc.email) {
            testObj.doctorEmail = doctorDoc.email;
          }
        }

        return testObj;
      }),
    );

    res.json({ ok: true, tests: enrichedTests });
  } catch (err) {
    console.error("[LAB] getTests error:", err && err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result, remarks } = req.body;
    const lt = await LabTest.findById(id);
    if (!lt) return res.status(404).json({ message: "Not found" });

    if (status) lt.status = status;
    if (result) lt.result = result;
    if (remarks) lt.remarks = remarks;

    await lt.save();

    // Notify doctor/patient when completed
    if (lt.status === "Completed") {
      try {
        const toList = [];
        if (lt.patientEmail) toList.push(lt.patientEmail);
        // If doctor info exists, try to find doctor email
        if (lt.doctor) {
          const Doctor = require("../models/Doctor");
          const doctorDoc = await Doctor.findById(lt.doctor).select(
            "email name",
          );
          if (doctorDoc && doctorDoc.email) toList.push(doctorDoc.email);
        }

        if (toList.length) {
          await sendEmail({
            to: toList.join(","),
            subject: `Lab Test Result: ${lt.testName}`,
            html: `<p>The lab test <strong>${lt.testName}</strong> for <strong>${lt.patientName}</strong> has been completed.</p>
                   <p>Remarks: ${lt.remarks || "N/A"}</p>
                   <p>Result: ${lt.result || "N/A"}</p>
                   <p>Report (if uploaded) is available in the portal.</p>`,
          });
        }
      } catch (e) {
        console.warn("[LAB] notify on complete failed", e && e.message);
      }
    }

    res.json({ ok: true, labTest: lt });
  } catch (err) {
    console.error("[LAB] updateTest error:", err && err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadReport = [
  upload.single("report"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const lt = await LabTest.findById(id);
      if (!lt) return res.status(404).json({ message: "Not found" });

      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const relPath = `/uploads/lab/${req.file.filename}`;
      lt.report = {
        filename: req.file.filename,
        path: req.file.path,
        url: relPath,
        uploadedAt: new Date(),
      };
      lt.status = "Completed";
      await lt.save();

      // --- Add to PatientRecord.patientUploads ---
      try {
        const PatientRecord = require("../models/PatientRecord");
        const Appointment = require("../models/Appointment");

        console.log(
          "[LAB] ========== ADDING UPLOAD TO PATIENT RECORD ==========",
        );
        console.log("[LAB] Patient Email:", lt.patientEmail);
        console.log("[LAB] Doctor Name:", lt.doctorName);
        console.log("[LAB] Test Name:", lt.testName);

        // Try to find appointment by patient email and doctor
        let appointment = await Appointment.findOne({
          patientEmail: lt.patientEmail,
          doctor: lt.doctor,
        }).sort({ date: -1 });

        console.log(
          "[LAB] Found appointment:",
          appointment ? appointment._id : "none",
        );

        // Find patient record - try multiple strategies
        let patientRecord = await PatientRecord.findOne({
          patientEmail: lt.patientEmail,
          doctorName: lt.doctorName,
        }).sort({ visitDate: -1 });

        console.log(
          "[LAB] Found patient record:",
          patientRecord ? patientRecord._id : "none - will create new",
        );

        const uploadData = {
          title: `Lab Result: ${lt.testName}`,
          description: `Lab test result for ${lt.testName} uploaded by lab.`,
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          fileUrl: relPath,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedBy: "lab",
          uploadedAt: new Date(),
        };

        if (patientRecord) {
          console.log(
            "[LAB] Adding upload to EXISTING record ID:",
            patientRecord._id,
          );
          patientRecord.patientUploads.push(uploadData);
          await patientRecord.save();
          console.log(
            "[LAB] ✅ Upload added successfully! Total uploads:",
            patientRecord.patientUploads.length,
          );
        } else {
          // If no record, create new
          console.log("[LAB] Creating NEW patient record with lab upload");
          patientRecord = new PatientRecord({
            patientName: lt.patientName,
            patientEmail: lt.patientEmail,
            phone: lt.phone,
            visitDate: appointment ? appointment.date : new Date(),
            doctorName: lt.doctorName,
            appointmentId: appointment ? appointment._id : undefined,
            createdBy: null, // Lab upload, not doctor
            patientUploads: [uploadData],
          });
          await patientRecord.save();
          console.log(
            "[LAB] ✅ New patient record created! ID:",
            patientRecord._id,
          );
        }
        console.log(
          "[LAB] ========== PATIENT RECORD UPDATE COMPLETE ==========\n",
        );
      } catch (err) {
        console.error(
          "[LAB] ❌❌❌ FAILED to add lab result to patient record!",
        );
        console.error("[LAB] Error type:", err.name);
        console.error("[LAB] Error message:", err.message);
        console.error("[LAB] Full error:", err);
        // Re-throw so we know upload failed
        throw new Error(`Failed to add to patient record: ${err.message}`);
      }

      // Notify patient/doctor same as updateTest
      try {
        const toList = [];
        if (lt.patientEmail) toList.push(lt.patientEmail);

        // Try to find doctor by ObjectId first, then by name
        let doctorDoc = null;
        if (lt.doctor) {
          const Doctor = require("../models/Doctor");
          const User = require("../models/User");

          doctorDoc = await Doctor.findById(lt.doctor).select("email name");

          // If not found in Doctor, try User model
          if (!doctorDoc) {
            doctorDoc = await User.findById(lt.doctor).select("email name");
          }

          if (doctorDoc && doctorDoc.email) {
            toList.push(doctorDoc.email);
            console.log("[LAB] Notifying doctor (by ID):", doctorDoc.email);
          }
        }

        // If no doctor found by ID, try by name
        if (!doctorDoc && lt.doctorName) {
          const Doctor = require("../models/Doctor");
          const User = require("../models/User");

          doctorDoc = await Doctor.findOne({ name: lt.doctorName }).select(
            "email name",
          );

          // If not in Doctor collection, try User collection
          if (!doctorDoc) {
            doctorDoc = await User.findOne({
              name: lt.doctorName,
              role: "doctor",
            }).select("email name");
          }

          if (doctorDoc && doctorDoc.email) {
            toList.push(doctorDoc.email);
            console.log("[LAB] Notifying doctor (by name):", doctorDoc.email);
          } else {
            console.log(
              "[LAB] ⚠️ Could not find doctor email for:",
              lt.doctorName,
            );
          }
        }

        console.log("[LAB] Email recipients:", toList.join(", "));

        if (toList.length) {
          const baseUrl = process.env.BASE_URL || "http://localhost:5000";
          const reportUrl = `${baseUrl}${lt.report.url}`;

          await sendEmail({
            to: toList.join(","),
            subject: `Lab Test Report Uploaded: ${lt.testName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">🧪 Lab Test Report Available</h2>
                <p>The lab test <strong>${lt.testName}</strong> for patient <strong>${lt.patientName}</strong> has been completed.</p>
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #1e40af;">Test Details:</h3>
                  <p><strong>Patient:</strong> ${lt.patientName}</p>
                  <p><strong>Test Name:</strong> ${lt.testName}</p>
                  <p><strong>Status:</strong> Completed</p>
                  <p><strong>Upload Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p>The report is now available in the patient records portal and can be downloaded using the link below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${reportUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">📄 Download Report</a>
                </div>
                
                <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">You can also view this report in the patient records section of your portal.</p>
              </div>
            `,
          });
          console.log("[LAB] Email sent to:", toList.join(", "));
        } else {
          console.log("[LAB] No email recipients found");
        }
      } catch (e) {
        console.warn("[LAB] notify on upload failed", e && e.message);
      }

      res.json({ ok: true, labTest: lt });
    } catch (err) {
      console.error("[LAB] uploadReport error:", err && err.message);
      res.status(500).json({ message: "Server error" });
    }
  },
];
