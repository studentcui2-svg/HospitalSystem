const Referral = require("../models/Referral");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const PatientRecord = require("../models/PatientRecord");
const sendEmail = require("../utils/email");

// Create a new referral
exports.createReferral = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      referredDoctorId,
      reason,
      notes,
      urgency,
      patientHistory,
      diagnosis,
      currentMedications,
    } = req.body;

    console.log("[REFERRAL] Creating new referral:", {
      patientId,
      referredDoctorId,
      referringDoctorId: req.userId,
      hasUserId: !!req.userId,
      userRole: req.userRole,
      requestBody: req.body,
    });

    if (!req.userId) {
      console.error("[REFERRAL] No userId in request");
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }

    // Validate required fields
    if (!referredDoctorId) {
      return res
        .status(400)
        .json({ ok: false, error: "Referred doctor ID is required" });
    }
    if (!patientName || !patientEmail) {
      return res
        .status(400)
        .json({ ok: false, error: "Patient name and email are required" });
    }
    if (!reason) {
      return res
        .status(400)
        .json({ ok: false, error: "Reason for referral is required" });
    }

    // Get referring doctor details
    const referringDoctor = await User.findById(req.userId);
    console.log("[REFERRAL] Referring doctor lookup:", {
      userId: req.userId,
      found: !!referringDoctor,
      doctorName: referringDoctor?.name,
    });

    if (!referringDoctor) {
      return res
        .status(404)
        .json({ ok: false, error: "Referring doctor not found" });
    }

    // Try to get department from Doctor collection
    let referringDepartment = "";
    const referringDoctorProfile = await Doctor.findOne({
      email: referringDoctor.email,
    });
    if (referringDoctorProfile) {
      referringDepartment = referringDoctorProfile.department || "";
    }

    // Get referred doctor details
    // First try to find in User collection
    let referredDoctor = await User.findById(referredDoctorId);

    // If not found in User, try to find in Doctor collection and get corresponding User
    if (!referredDoctor) {
      console.log(
        "[REFERRAL] Referred doctor not found in User collection, checking Doctor collection",
      );
      const doctorProfile = await Doctor.findById(referredDoctorId);

      if (doctorProfile && doctorProfile.email) {
        // Try to find User by email
        referredDoctor = await User.findOne({
          email: doctorProfile.email,
          role: "doctor",
        });

        if (!referredDoctor) {
          console.log(
            "[REFERRAL] Creating User account for doctor:",
            doctorProfile.name,
          );
          // Create User account for this doctor
          referredDoctor = new User({
            name: doctorProfile.name,
            email: doctorProfile.email,
            phone: doctorProfile.phone,
            role: "doctor",
            isVerified: true,
            gender: doctorProfile.gender,
            dateOfBirth: doctorProfile.dateOfBirth,
          });
          await referredDoctor.save();
          console.log(
            "[REFERRAL] Created User account with ID:",
            referredDoctor._id,
          );
        }
      }
    }

    if (!referredDoctor || referredDoctor.role !== "doctor") {
      console.error("[REFERRAL] Referred doctor not found:", {
        referredDoctorId,
      });
      return res
        .status(404)
        .json({ ok: false, error: "Referred doctor not found" });
    }

    console.log("[REFERRAL] Referred doctor found:", {
      id: referredDoctor._id,
      name: referredDoctor.name,
      email: referredDoctor.email,
    });

    // Try to get referred doctor's department
    let referredDepartment = "";
    const referredDoctorProfile = await Doctor.findOne({
      email: referredDoctor.email,
    });
    if (referredDoctorProfile) {
      referredDepartment = referredDoctorProfile.department || "";
    }

    // Fetch all patient records and uploads
    console.log("[REFERRAL] Fetching patient records for:", patientEmail);
    const patientRecords = await PatientRecord.find({
      patientEmail: patientEmail,
    })
      .sort({ visitDate: -1 })
      .limit(20);

    console.log("[REFERRAL] Found", patientRecords.length, "patient records");

    // Create referral
    const referral = new Referral({
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      referringDoctorId: req.userId,
      referringDoctorName: referringDoctor.name,
      referringDoctorEmail: referringDoctor.email,
      referringDepartment,
      referredDoctorId,
      referredDoctorName: referredDoctor.name,
      referredDoctorEmail: referredDoctor.email,
      referredDepartment,
      reason,
      notes,
      urgency: urgency || "routine",
      patientHistory,
      diagnosis,
      currentMedications,
    });

    await referral.save();

    console.log("[REFERRAL] Referral created successfully:", referral._id);

    // Send email to patient
    const patientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .doctor-info { background: #e0e7ff; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .urgency { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
          .urgency-routine { background: #d1fae5; color: #065f46; }
          .urgency-urgent { background: #fed7aa; color: #92400e; }
          .urgency-emergency { background: #fee2e2; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Specialist Referral</h1>
          </div>
          <div class="content">
            <p>Dear ${patientName},</p>
            
            <div class="info-box">
              <p><strong>Dr. ${referringDoctor.name}</strong> ${referringDepartment ? `(${referringDepartment})` : ""} has referred you to a specialist for further consultation.</p>
              ${
                urgency && urgency !== "routine"
                  ? `
                <p style="margin-top: 15px;">
                  <span class="urgency urgency-${urgency}">${urgency.toUpperCase()}</span>
                </p>
              `
                  : ""
              }
            </div>
            
            <div class="doctor-info">
              <h3 style="margin-top: 0; color: #667eea;">Referred to:</h3>
              <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${referredDoctor.name}</p>
              ${referredDepartment ? `<p style="margin: 5px 0;"><strong>Department:</strong> ${referredDepartment}</p>` : ""}
              ${referredDoctor.email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${referredDoctor.email}</p>` : ""}
            </div>
            
            <div class="info-box">
              <h4 style="margin-top: 0;">Reason for Referral:</h4>
              <p>${reason}</p>
              ${
                notes
                  ? `
                <h4>Additional Notes:</h4>
                <p>${notes}</p>
              `
                  : ""
              }
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Please book an appointment with Dr. ${referredDoctor.name}</li>
              <li>Use the button below to access the appointment booking system</li>
              <li>Bring all relevant medical records and test results</li>
            </ol>
            
            <center>
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/appointments" class="button">
                📅 Book Appointment Now
              </a>
            </center>
            
            <div class="footer">
              <p>This is an automated message from ZeeCare Hospital Management System.</p>
              <p>If you have any questions, please contact us at ${referringDoctor.email || "support@zeecare.com"}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to referred doctor
    const doctorEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-section { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #4f46e5; border-radius: 5px; }
          .patient-info { background: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .medical-info { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .urgency { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
          .urgency-routine { background: #d1fae5; color: #065f46; }
          .urgency-urgent { background: #fed7aa; color: #92400e; }
          .urgency-emergency { background: #fee2e2; color: #991b1b; }
          .label { font-weight: bold; color: #4f46e5; display: inline-block; min-width: 150px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👨‍⚕️ New Patient Referral</h1>
          </div>
          <div class="content">
            <p>Dear Dr. ${referredDoctor.name},</p>
            
            <div class="info-section">
              <p>You have received a new patient referral from <strong>Dr. ${referringDoctor.name}</strong>${referringDepartment ? ` (${referringDepartment})` : ""}.</p>
              ${
                urgency && urgency !== "routine"
                  ? `
                <p style="margin-top: 15px;">
                  <span class="urgency urgency-${urgency}">⚠️ ${urgency.toUpperCase()} REFERRAL</span>
                </p>
              `
                  : ""
              }
            </div>
            
            <div class="patient-info">
              <h3 style="margin-top: 0; color: #1e40af;">Patient Information</h3>
              <p><span class="label">Name:</span> ${patientName}</p>
              <p><span class="label">Email:</span> ${patientEmail}</p>
              ${patientPhone ? `<p><span class="label">Phone:</span> ${patientPhone}</p>` : ""}
              <p><span class="label">Patient ID:</span> ${patientId}</p>
            </div>
            
            <div class="info-section">
              <h4 style="margin-top: 0; color: #4f46e5;">Reason for Referral:</h4>
              <p style="white-space: pre-wrap;">${reason}</p>
            </div>
            
            ${
              notes
                ? `
              <div class="info-section">
                <h4 style="margin-top: 0; color: #4f46e5;">Additional Notes:</h4>
                <p style="white-space: pre-wrap;">${notes}</p>
              </div>
            `
                : ""
            }
            
            ${
              diagnosis
                ? `
              <div class="medical-info">
                <h4 style="margin-top: 0; color: #92400e;">Diagnosis:</h4>
                <p style="white-space: pre-wrap;">${diagnosis}</p>
              </div>
            `
                : ""
            }
            
            ${
              patientHistory
                ? `
              <div class="info-section">
                <h4 style="margin-top: 0; color: #4f46e5;">Patient History:</h4>
                <p style="white-space: pre-wrap;">${patientHistory}</p>
              </div>
            `
                : ""
            }
            
            ${
              currentMedications
                ? `
              <div class="medical-info">
                <h4 style="margin-top: 0; color: #92400e;">Current Medications:</h4>
                <p style="white-space: pre-wrap;">${currentMedications}</p>
              </div>
            `
                : ""
            }
            
            ${
              patientRecords.length > 0
                ? `
              <div class="info-section" style="background: #f0fdf4; border-left-color: #10b981;">
                <h3 style="margin-top: 0; color: #065f46;">📋 Patient Medical Records (${patientRecords.length} visits)</h3>
                ${patientRecords
                  .map(
                    (record, idx) => `
                  <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #10b981;">
                    <div style="font-weight: bold; color: #047857; margin-bottom: 8px;">
                      Visit #${idx + 1} - ${new Date(record.visitDate).toLocaleDateString()} 
                      ${record.doctorName ? `(Dr. ${record.doctorName})` : ""}
                    </div>
                    ${record.complaints ? `<p><strong>Complaints:</strong> ${record.complaints}</p>` : ""}
                    ${record.diagnosis ? `<p><strong>Diagnosis:</strong> ${record.diagnosis}</p>` : ""}
                    ${record.prescription ? `<p><strong>Prescription:</strong> ${record.prescription}</p>` : ""}
                    ${record.bloodPressure || record.temperature ? `<p><strong>Vitals:</strong> ${record.bloodPressure ? `BP: ${record.bloodPressure}` : ""} ${record.temperature ? `Temp: ${record.temperature}` : ""}</p>` : ""}
                    ${
                      record.attachments && record.attachments.length > 0
                        ? `
                      <div style="margin-top: 10px;">
                        <strong>📎 Doctor Attachments (${record.attachments.length}):</strong>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                          ${record.attachments
                            .map(
                              (file) =>
                                `<li>${file.originalName} (${(file.size / 1024).toFixed(1)} KB)</li>`,
                            )
                            .join("")}
                        </ul>
                      </div>
                    `
                        : ""
                    }
                    ${
                      record.patientUploads && record.patientUploads.length > 0
                        ? `
                      <div style="margin-top: 10px; background: #dbeafe; padding: 10px; border-radius: 5px;">
                        <strong>📄 Lab Reports & Patient Uploads (${record.patientUploads.length}):</strong>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                          ${record.patientUploads
                            .map(
                              (upload) => `
                            <li>
                              ${upload.uploadedBy === "lab" ? "🧪" : upload.uploadedBy === "doctor" ? "👨‍⚕️" : "👤"} 
                              ${upload.title || upload.originalName} 
                              ${upload.description ? `- ${upload.description}` : ""}
                              (${(upload.size / 1024).toFixed(1)} KB, uploaded by ${upload.uploadedBy})
                            </li>
                          `,
                            )
                            .join("")}
                        </ul>
                      </div>
                    `
                        : ""
                    }
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : `
              <div class="info-section" style="background: #fef3c7;">
                <p style="color: #92400e; margin: 0;">ℹ️ No previous medical records found for this patient.</p>
              </div>
            `
            }
            
            <div class="info-section">
              <h4 style="margin-top: 0;">Next Steps:</h4>
              <ul>
                <li>Review the patient's medical information and records above</li>
                <li>The patient will contact you to schedule an appointment</li>
                <li>You can view this referral in your doctor portal</li>
                <li>Update the referral status after consultation</li>
                <li>All patient records and uploads are accessible in your portal</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Referral ID: ${referral._id}</p>
              <p>This is an automated notification from ZeeCare Hospital Management System.</p>
              <p>Login to your portal for more details: ${process.env.FRONTEND_URL || "http://localhost:5173"}/doctor-panel</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails
    try {
      console.log("[REFERRAL] Sending email to patient:", patientEmail);
      await sendEmail({
        to: patientEmail,
        subject: `Referral to Dr. ${referredDoctor.name} - ZeeCare Hospital`,
        html: patientEmailHtml,
      });
      console.log("[REFERRAL] Patient email sent successfully");
    } catch (emailError) {
      console.error("[REFERRAL] Failed to send patient email:", emailError);
    }

    try {
      console.log(
        "[REFERRAL] Sending email to referred doctor:",
        referredDoctor.email,
      );
      await sendEmail({
        to: referredDoctor.email,
        subject: `New Patient Referral from Dr. ${referringDoctor.name} - ${patientName}`,
        html: doctorEmailHtml,
      });
      console.log("[REFERRAL] Doctor email sent successfully");
    } catch (emailError) {
      console.error("[REFERRAL] Failed to send doctor email:", emailError);
    }

    res.json({
      ok: true,
      message: "Referral created successfully",
      referral,
    });
  } catch (error) {
    console.error("[REFERRAL] Error creating referral:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Get referrals for a doctor (both sent and received)
exports.getDoctorReferrals = async (req, res) => {
  try {
    const { type } = req.query; // 'sent' or 'received'

    // Get current user's email to match referrals
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    console.log("[REFERRAL] Fetching referrals for:", {
      userId: req.userId,
      email: currentUser.email,
      type,
    });

    let query = {};
    if (type === "sent") {
      // Match by ID or email
      query = {
        $or: [
          { referringDoctorId: req.userId },
          { referringDoctorEmail: currentUser.email },
        ],
      };
    } else if (type === "received") {
      // Match by ID or email
      query = {
        $or: [
          { referredDoctorId: req.userId },
          { referredDoctorEmail: currentUser.email },
        ],
      };
    } else {
      // Get both - match by ID or email
      query = {
        $or: [
          { referringDoctorId: req.userId },
          { referredDoctorId: req.userId },
          { referringDoctorEmail: currentUser.email },
          { referredDoctorEmail: currentUser.email },
        ],
      };
    }

    const referrals = await Referral.find(query)
      .sort({ createdAt: -1 })
      .populate("patientId", "name email phone")
      .populate("referringDoctorId", "name email")
      .populate("referredDoctorId", "name email");

    console.log("[REFERRAL] Found", referrals.length, "referrals");

    res.json({
      ok: true,
      referrals,
    });
  } catch (error) {
    console.error("[REFERRAL] Error fetching referrals:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Update referral status
exports.updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ ok: false, error: "Referral not found" });
    }

    // Only the referred doctor can update status
    if (referral.referredDoctorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    referral.status = status;
    await referral.save();

    // Send notification email to referring doctor
    if (status === "accepted" || status === "declined") {
      const statusMessage =
        status === "accepted"
          ? "has accepted the referral"
          : "has declined the referral";

      try {
        await sendEmail({
          to: referral.referringDoctorEmail,
          subject: `Referral Update - ${referral.patientName}`,
          html: `
            <h3>Referral Status Update</h3>
            <p>Dr. ${referral.referredDoctorName} ${statusMessage} for patient <strong>${referral.patientName}</strong>.</p>
            <p>Referral ID: ${referral._id}</p>
          `,
        });
      } catch (emailError) {
        console.error(
          "[REFERRAL] Failed to send status update email:",
          emailError,
        );
      }
    }

    res.json({
      ok: true,
      message: "Referral status updated",
      referral,
    });
  } catch (error) {
    console.error("[REFERRAL] Error updating referral:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Get single referral
exports.getReferral = async (req, res) => {
  try {
    const { id } = req.params;

    const referral = await Referral.findById(id)
      .populate("patientId", "name email phone gender dateOfBirth")
      .populate("referringDoctorId", "name email")
      .populate("referredDoctorId", "name email");

    if (!referral) {
      return res.status(404).json({ ok: false, error: "Referral not found" });
    }

    // Check if user is involved in this referral
    const isInvolved =
      referral.referringDoctorId._id.toString() === req.userId.toString() ||
      referral.referredDoctorId._id.toString() === req.userId.toString() ||
      referral.patientId._id.toString() === req.userId.toString();

    if (!isInvolved && req.userRole !== "admin") {
      return res.status(403).json({ ok: false, error: "Unauthorized" });
    }

    res.json({
      ok: true,
      referral,
    });
  } catch (error) {
    console.error("[REFERRAL] Error fetching referral:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};
