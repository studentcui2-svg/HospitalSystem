const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/email");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const axios = require("axios");
const mongoose = require("mongoose");

// Zoom API Configuration
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || "";
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID || "";
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || "";

// Function to get Zoom access token
async function getZoomAccessToken() {
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    console.warn("[ZOOM] API credentials not configured");
    return null;
  }

  try {
    const authString = Buffer.from(
      `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`,
    ).toString("base64");
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "[ZOOM] Failed to get access token:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Function to create Zoom meeting
async function createZoomMeeting(appointmentData) {
  const token = await getZoomAccessToken();

  if (!token) {
    console.warn("[ZOOM] No access token, skipping meeting creation");
    return null;
  }

  try {
    const meetingData = {
      topic: `Medical Appointment - ${appointmentData.patientName} with Dr. ${appointmentData.doctor}`,
      type: 2, // Scheduled meeting
      start_time: new Date(appointmentData.date).toISOString(),
      duration: appointmentData.durationMinutes || 30,
      timezone: appointmentData.timezone || "Asia/Karachi",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: "both",
        auto_recording: "none",
      },
    };

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[ZOOM] Meeting created:", response.data.id);
    return {
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      password: response.data.password,
    };
  } catch (error) {
    console.error(
      "[ZOOM] Failed to create meeting:",
      error.response?.data || error.message,
    );
    return null;
  }
}

exports.createAppointment = async (req, res) => {
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    console.warn("[ZOOM] API credentials not configured");
    return null;
  }

  try {
    const authString = Buffer.from(
      `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`,
    ).toString("base64");
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "[ZOOM] Failed to get access token:",
      error.response?.data || error.message,
    );
    return null;
  }
};

// Function to create Zoom meeting
async function createZoomMeeting(appointmentData) {
  const token = await getZoomAccessToken();

  if (!token) {
    console.warn("[ZOOM] No access token, skipping meeting creation");
    return null;
  }

  try {
    const meetingData = {
      topic: `Medical Appointment - ${appointmentData.patientName} with Dr. ${appointmentData.doctor}`,
      type: 2, // Scheduled meeting
      start_time: new Date(appointmentData.date).toISOString(),
      duration: appointmentData.durationMinutes || 30,
      timezone: appointmentData.timezone || "Asia/Karachi",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: "both",
        auto_recording: "none",
      },
    };

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[ZOOM] Meeting created:", response.data.id);
    return {
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      password: response.data.password,
    };
  } catch (error) {
    console.error(
      "[ZOOM] Failed to create meeting:",
      error.response?.data || error.message,
    );
    return null;
  }
}

exports.createAppointment = async (req, res) => {
  try {
    console.log("[CREATE APPOINTMENT] Payload received:", req.body);

    const {
      patientName,
      fatherName,
      patientEmail,
      cnic,
      phone,
      address,
      gender,
      dateOfBirth,
      age,
      department,
      doctor,
      notes,
      visitedBefore,
      date,
      durationMinutes,
      timezone,
    } = req.body;

    if (!patientName || !date) {
      console.warn("[CREATE APPOINTMENT] Missing patientName or date");
      return res.status(400).json({
        message: "Patient name and appointment date are required",
      });
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      console.warn("[CREATE APPOINTMENT] Invalid appointment date:", date);
      return res
        .status(400)
        .json({ message: "Invalid appointment date provided" });
    }

    // Determine duration (minutes) and enforce limits
    const parsedDuration = Number(durationMinutes) || 30;
    const duration = Math.max(20, Math.min(60, Math.floor(parsedDuration)));

    const endDate = new Date(appointmentDate.getTime() + duration * 60000);

    // Resolve doctor name/email to doctor ID
    const Doctor = require("../models/Doctor");
    let doctorId = null;
    let doctorName = null;

    if (doctor) {
      // Check if doctor is already an ObjectId
      if (mongoose.Types.ObjectId.isValid(doctor)) {
        const doctorDoc = await Doctor.findById(doctor);
        if (doctorDoc) {
          doctorId = doctorDoc._id;
          doctorName = doctorDoc.name;
        }
      } else {
        // Try to find doctor by name or email
        const doctorDoc = await Doctor.findOne({
          $or: [
            { name: { $regex: `^${doctor}$`, $options: "i" } },
            { email: { $regex: `^${doctor}$`, $options: "i" } },
          ],
        });
        if (doctorDoc) {
          doctorId = doctorDoc._id;
          doctorName = doctorDoc.name;
        } else {
          // Store as doctorName only if doctor not found in database
          doctorName = doctor;
        }
      }
    }

    // Check for overlapping appointments for the same doctor
    if (doctorId) {
      const conflict = await Appointment.findOne({
        doctor: doctorId,
        date: { $lt: endDate },
        end: { $gt: appointmentDate },
      });
      if (conflict) {
        console.warn(
          "[CREATE APPOINTMENT] Slot conflict for doctor",
          doctorId,
          appointmentDate,
          endDate,
        );
        return res.status(409).json({
          message:
            "Requested time overlaps with another appointment for this doctor",
        });
      }
    }

    const parsedDob = dateOfBirth ? new Date(dateOfBirth) : undefined;
    const safeDob =
      parsedDob && !Number.isNaN(parsedDob.getTime()) ? parsedDob : undefined;
    const visitedFlag =
      typeof visitedBefore === "string"
        ? ["true", "yes", "1", "visited"].includes(visitedBefore.toLowerCase())
        : Boolean(visitedBefore);

    const DEFAULT_FEE = Number(req.body.amount) || 50;

    // Build a simple invoice snapshot (useful for pay-on-site flow)
    const invoiceObj = {
      invoiceNumber: `INV-${Date.now()}`,
      amountDue: DEFAULT_FEE,
      currency: "USD",
      status: req.body.paymentPreference === "on-site" ? "unpaid" : "pending",
      note:
        req.body.paymentPreference === "on-site"
          ? "Pay on-site. Not paid at booking."
          : "Pending online payment.",
      generatedAt: new Date(),
      html: `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Invoice ${"INV-" + Date.now()}</title>
            <style>body{font-family:Arial,sans-serif;color:#111;} .h{color:#4f46e5;font-weight:700}</style>
          </head>
          <body>
            <h2 class="h">Clinic Invoice</h2>
            <p><strong>Invoice:</strong> ${"INV-" + Date.now()}</p>
            <p><strong>Patient:</strong> ${patientName || "-"}</p>
            <p><strong>Doctor:</strong> ${doctor || "-"}</p>
            <p><strong>Scheduled:</strong> ${appointmentDate.toLocaleString()}</p>
            <hr />
            <p><strong>Amount Due:</strong> USD ${DEFAULT_FEE.toFixed(2)}</p>
            <p><em>${
              req.body.paymentPreference === "on-site"
                ? "Pay on-site. Not paid at booking."
                : "Pending online payment."
            }</em></p>
            <p style="margin-top:20px;color:#6b7280;font-size:0.9rem">Please present this invoice at reception.</p>
          </body>
        </html>
      `,
    };

    const appt = new Appointment({
      patientName,
      fatherName,
      patientEmail,
      cnic,
      phone,
      address,
      gender,
      dateOfBirth: safeDob,
      age: age,
      department,
      doctor: doctorId,
      doctorName: doctorName || doctor,
      notes,
      visitedBefore: visitedFlag,
      date: appointmentDate,
      end: endDate,
      durationMinutes: duration,
      timezone,
      mode: req.body.mode || "physical",
      paymentPreference: req.body.paymentPreference || "online",
      invoice: invoiceObj,
      createdBy: req.userId,
    });

    await appt.save();
    console.log("[CREATE APPOINTMENT] Saved appointment:", appt._id);

    // Send email to doctor to notify about new booking
    if (doctorId) {
      try {
        const Doctor = require("../models/Doctor");
        const doctorDoc = await Doctor.findById(doctorId);
        if (doctorDoc && doctorDoc.email) {
          const doctorEmail = doctorDoc.email;
          const doctorName = doctorDoc.name || "Doctor";
          const readableDate = appointmentDate.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          });
          const subject = `New Appointment Booking - Action Required`;
          const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
              <h2 style="color: #4f46e5;">Hello Dr. ${doctorName},</h2>
              <p>Someone has booked an appointment with you. Please visit the portal to accept or reject this booking.</p>
              <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 12px 0; color: #374151; font-weight: 600;">📋 Appointment Details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 4px 0; color: #6b7280;">Patient Name:</td><td style="padding: 4px 0; color: #111827; font-weight: 600;">${patientName}</td></tr>
                  <tr><td style="padding: 4px 0; color: #6b7280;">Date & Time:</td><td style="padding: 4px 0; color: #111827; font-weight: 600;">${readableDate}</td></tr>
                  <tr><td style="padding: 4px 0; color: #6b7280;">Department:</td><td style="padding: 4px 0; color: #111827;">${department || "N/A"}</td></tr>
                  <tr><td style="padding: 4px 0; color: #6b7280;">Mode:</td><td style="padding: 4px 0; color: #111827; font-weight: 600;">${req.body.mode === "online" ? "🎥 Online" : "🏥 Physical"}</td></tr>
                </table>
              </div>
              <p style="margin-top: 18px;">Please log in to the portal to accept or reject this appointment.</p>
              <p style="margin-top: 24px;">Best regards,<br/>Hospital Management System</p>
            </div>
          `;
          const text = `Hello Dr. ${doctorName},\nSomeone has booked an appointment with you. Please visit the portal to accept or reject this booking.\nPatient: ${patientName}\nDate & Time: ${readableDate}`;
          const noReplyFrom =
            process.env.SMTP_NO_REPLY ||
            `No Reply <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
          await sendEmail({
            to: doctorEmail,
            subject,
            html,
            text,
            from: noReplyFrom,
          });
          console.log(
            `[EMAIL] ✓ Doctor booking notification sent to ${doctorEmail}`,
          );
        }
      } catch (err) {
        console.error(
          "[EMAIL ERROR] Failed to send doctor booking notification:",
          err.message,
        );
      }
    }

    res.status(201).json({ ok: true, appointment: appt });
  } catch (err) {
    console.error("[CREATE APPOINTMENT ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    console.log("[GET APPOINTMENTS] Request received");
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.search)
      q.patientName = { $regex: req.query.search, $options: "i" };

    // allow filtering by doctor name or ID
    if (req.query.doctor) {
      const Doctor = require("../models/Doctor");
      // Try to find doctor by name or email
      const doctor = await Doctor.findOne({
        $or: [
          { name: { $regex: `^${req.query.doctor}$`, $options: "i" } },
          { email: { $regex: `^${req.query.doctor}$`, $options: "i" } },
        ],
      });

      if (doctor) {
        // Search by doctor ID or doctorName (backward compatibility)
        q.$or = [
          { doctor: doctor._id },
          { doctorName: { $regex: `^${req.query.doctor}$`, $options: "i" } },
        ];
      } else {
        // Doctor not found, search by doctorName only
        q.doctorName = { $regex: `^${req.query.doctor}$`, $options: "i" };
      }
    }

    // Restrict non-admin users to see only their own appointments
    // Admin can see all appointments (via ?all=true) or specific filtered results
    // Doctor can see appointments by doctor name
    // Regular users see only appointments they created
    if (req.userRole !== "admin" && String(req.query.all) !== "true") {
      q.createdBy = req.userId;
      console.log(
        "[GET APPOINTMENTS] Restricting to user appointments:",
        req.userId,
      );
    }

    // allow admin to request full list when needed via query param `all=true`
    let queryExec = Appointment.find(q)
      .populate("doctor", "name email phone nic")
      .sort({ date: -1 });
    if (String(req.query.all) !== "true") {
      const max = 1000; // safety cap
      const limit = Math.min(Number(req.query.limit) || 100, max);
      queryExec = queryExec.limit(limit);
      console.log("[GET APPOINTMENTS] Applying limit:", limit);
    } else {
      console.log("[GET APPOINTMENTS] Returning all appointments (no limit)");
    }

    const appointments = await queryExec;

    // Map appointments to include doctor details for frontend compatibility
    const mappedAppointments = appointments.map((appt) => {
      const apptObj = appt.toObject();
      // Ensure doctor field contains name for frontend compatibility
      if (apptObj.doctor && typeof apptObj.doctor === "object") {
        apptObj.doctorName = apptObj.doctor.name;
        apptObj.doctorEmail = apptObj.doctor.email;
        apptObj.doctorPhone = apptObj.doctor.phone;
        apptObj.doctorNic = apptObj.doctor.nic;
        apptObj.doctor = apptObj.doctor.name;
      } else if (!apptObj.doctor && apptObj.doctorName) {
        apptObj.doctor = apptObj.doctorName;
      }
      return apptObj;
    });

    console.log(
      "[GET APPOINTMENTS] Found",
      appointments.length,
      "appointments",
    );
    res.json({ ok: true, appointments: mappedAppointments });
  } catch (err) {
    console.error("[GET APPOINTMENTS ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    console.log(`[UPDATE APPOINTMENT] ${id} -> ${status}`);

    const normalizedStatus = typeof status === "string" ? status.trim() : "";
    const allowedStatuses = ["Pending", "Accepted", "Rejected"];

    if (!allowedStatuses.includes(normalizedStatus)) {
      console.warn(
        "[UPDATE APPOINTMENT] Invalid status received:",
        normalizedStatus,
      );
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appt.status !== "Pending" && appt.status !== normalizedStatus) {
      console.warn(
        "[UPDATE APPOINTMENT] Attempt to change finalised appointment",
        appt._id,
        "from",
        appt.status,
        "to",
        normalizedStatus,
      );
      return res.status(400).json({
        message:
          "This appointment has already been finalised and cannot be changed.",
      });
    }

    if (appt.status === normalizedStatus) {
      return res.json({ ok: true, appointment: appt, notified: false });
    }

    // Process refund if rejecting an appointment with completed payment
    let refundInfo = null;
    if (
      normalizedStatus === "Rejected" &&
      appt.payment?.status === "completed" &&
      appt.payment?.paymentIntentId
    ) {
      try {
        console.log(`[REFUND] Processing refund for appointment ${appt._id}`);
        const refund = await stripe.refunds.create({
          payment_intent: appt.payment.paymentIntentId,
        });

        appt.payment.status = "refunded";
        appt.payment.refundedAt = new Date();
        appt.payment.refundId = refund.id;

        refundInfo = {
          refundId: refund.id,
          amount: refund.amount / 100,
          currency: refund.currency,
        };

        console.log(`[REFUND] Refund successful: ${refund.id}`);
      } catch (refundError) {
        console.error("[REFUND ERROR]", refundError.message);
        // Continue with rejection even if refund fails
        // Admin can manually process refund later
      }
    }

    appt.status = normalizedStatus;
    if (normalizedStatus === "Rejected" && rejectionReason) {
      appt.rejectionReason = rejectionReason;
    }

    // Create Zoom meeting when appointment is accepted (online mode only)
    if (
      normalizedStatus === "Accepted" &&
      appt.mode === "online" &&
      !appt.meetingLink
    ) {
      const zoomMeeting = await createZoomMeeting({
        patientName: appt.patientName,
        doctor: appt.doctor,
        date: appt.date,
        durationMinutes: appt.durationMinutes,
        timezone: appt.timezone,
      });

      if (zoomMeeting) {
        appt.meetingLink = zoomMeeting.joinUrl;
        console.log("[ZOOM] Meeting link saved:", zoomMeeting.joinUrl);
      }
    }

    await appt.save();
    console.log("[UPDATE APPOINTMENT] Updated:", appt._id);

    let notified = false;
    const { patientEmail, patientName, date } = appt;

    // Fetch doctor name for patient email
    let doctorDisplayName = appt.doctorName || "N/A";
    if (appt.doctor && mongoose.Types.ObjectId.isValid(appt.doctor)) {
      const Doctor = require("../models/Doctor");
      const doctorDoc = await Doctor.findById(appt.doctor).select("name");
      if (doctorDoc && doctorDoc.name) {
        doctorDisplayName = doctorDoc.name;
      }
    }

    // Prepare readable date for emails
    const readableDate = date
      ? new Date(date).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "(date not set)";

    // Add meeting link section for accepted online appointments
    // This is used in both patient and doctor emails
    let meetingLinkMessage = "";
    if (
      normalizedStatus === "Accepted" &&
      appt.mode === "online" &&
      appt.meetingLink
    ) {
      meetingLinkMessage = `
        <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #10b981;">
          <p style="margin: 0; color: white; font-weight: 700; font-size: 1.2rem; text-align: center;">🎥 Your Virtual Meeting is Ready!</p>
          <p style="margin: 12px 0; color: white; line-height: 1.6; text-align: center;">Join your online consultation at the scheduled time:</p>
          <div style="text-align: center; margin: 16px 0;">
            <a href="${appt.meetingLink}" style="display: inline-block; background: white; color: #10b981; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Join Meeting</a>
          </div>
          <p style="margin: 12px 0 0 0; color: #d1fae5; font-size: 0.85rem; text-align: center;">
            💡 Tip: Test your camera and microphone before the meeting
          </p>
        </div>
      `;
    }

    if (patientEmail) {
      const capitalizedStatus = normalizedStatus.toUpperCase();
      const subject = `Your appointment has been ${capitalizedStatus}`;

      let statusMessage =
        normalizedStatus === "Accepted"
          ? "We're happy to let you know that your appointment has been approved."
          : normalizedStatus === "Rejected"
            ? "We're sorry to inform you that we cannot accommodate your appointment at this time."
            : "Your appointment status has been updated.";

      // Add rejection reason to message if provided
      let rejectionReasonMessage = "";
      if (normalizedStatus === "Rejected" && rejectionReason) {
        rejectionReasonMessage = `
          <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-weight: 700; font-size: 1.1rem;">📝 Reason for Rejection:</p>
            <p style="margin: 8px 0 0 0; color: #374151; line-height: 1.6;">${rejectionReason}</p>
          </div>
        `;
      }

      // Add rebooking link for rejected appointments
      let rebookingMessage = "";
      if (normalizedStatus === "Rejected") {
        const rebookingLink = "http://localhost:5173";
        rebookingMessage = `
          <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-weight: 700; font-size: 1.1rem;">📅 Want to Reschedule?</p>
            <p style="margin: 8px 0; color: #374151; line-height: 1.6;">You can book a new appointment at a different time by clicking the button below:</p>
            <div style="text-align: center; margin-top: 16px;">
              <a href="${rebookingLink}/#/appointment" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem;">Book New Appointment</a>
            </div>
          </div>
        `;
      }

      // Add refund information if applicable
      let refundMessage = "";
      if (refundInfo) {
        const currencySymbol =
          refundInfo.currency === "usd"
            ? "$"
            : refundInfo.currency === "pkr"
              ? "PKR "
              : refundInfo.currency.toUpperCase() + " ";
        refundMessage = `
          <div style="background: #d1fae5; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #10b981;">
            <p style="margin: 0; color: #065f46; font-weight: 700; font-size: 1.1rem;">💰 Refund Processed Successfully</p>
            <table style="margin-top: 12px; width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #374151; font-weight: 600;">Refund Amount:</td>
                <td style="padding: 6px 0; color: #047857; font-weight: 700;">${currencySymbol}${
                  refundInfo.amount
                }</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #374151; font-weight: 600;">Refund ID:</td>
                <td style="padding: 6px 0; color: #6b7280;">${
                  refundInfo.refundId
                }</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #374151; font-weight: 600;">Refund Date:</td>
                <td style="padding: 6px 0; color: #6b7280;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <p style="margin: 12px 0 0 0; color: #047857; font-size: 0.9rem;">
              ⏱️ Please allow 5-10 business days for the refund to appear in your account.
            </p>
          </div>
        `;
      }

      // Original appointment details for rejected appointments
      const appointmentDetails = `
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 12px 0; color: #374151; font-weight: 600;">📋 Appointment Details:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Doctor:</td>
              <td style="padding: 4px 0; color: #111827; font-weight: 600;">Dr. ${doctorDisplayName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Department:</td>
              <td style="padding: 4px 0; color: #111827;">${
                appt.department || "N/A"
              }</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Scheduled Date:</td>
              <td style="padding: 4px 0; color: #111827;">${readableDate}</td>
            </tr>
          </table>
        </div>
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="color: #4f46e5;">Hello ${patientName || "there"},</h2>
          <p>${statusMessage}</p>
          <p><strong>Status:</strong> <span style="color: ${
            normalizedStatus === "Accepted"
              ? "#10b981"
              : normalizedStatus === "Rejected"
                ? "#ef4444"
                : "#f59e0b"
          }; font-weight: 600;">${normalizedStatus}</span></p>
          ${
            normalizedStatus === "Rejected"
              ? appointmentDetails
              : `<div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0 0 12px 0; color: #374151; font-weight: 600;">📋 Appointment Details:</p>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Doctor:</td>
                      <td style="padding: 4px 0; color: #111827; font-weight: 600;">Dr. ${doctorDisplayName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Department:</td>
                      <td style="padding: 4px 0; color: #111827;">${appt.department || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Scheduled Date:</td>
                      <td style="padding: 4px 0; color: #111827; font-weight: 600;">${readableDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Duration:</td>
                      <td style="padding: 4px 0; color: #111827;">${appt.durationMinutes || 30} minutes</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6b7280;">Mode:</td>
                      <td style="padding: 4px 0; color: #111827; font-weight: 600;">${appt.mode === "online" ? "🎥 Online" : "🏥 Physical"}</td>
                    </tr>
                  </table>
                </div>`
          }
          ${meetingLinkMessage}
          ${rejectionReasonMessage}
          ${refundMessage}
          ${rebookingMessage}
          <p style="margin-top: 18px;">If you have any questions, please reply to this email or call our reception.</p>
          <p style="margin-top: 24px;">Best regards,<br/>The Clinic Team</p>
        </div>
      `;

      const refundText = refundInfo
        ? ` Your payment of ${refundInfo.currency.toUpperCase()} ${
            refundInfo.amount
          } has been refunded (Refund ID: ${refundInfo.refundId}).`
        : "";

      try {
        const noReplyFrom =
          process.env.SMTP_NO_REPLY ||
          `No Reply <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
        await sendEmail({
          to: patientEmail,
          subject,
          html,
          text: `${statusMessage} Status: ${normalizedStatus}. Scheduled Date: ${readableDate}.${refundText}`,
          from: noReplyFrom,
        });
        notified = true;
      } catch (emailError) {
        console.error(
          "[UPDATE APPOINTMENT] Failed to send status email for",
          appt._id,
          emailError,
        );
      }
    } else {
      console.warn(
        "[UPDATE APPOINTMENT] No patient email available for notification",
        appt._id,
      );
    }

    // Send email to doctor when appointment is accepted
    if (normalizedStatus === "Accepted" && appt.doctor) {
      try {
        const Doctor = require("../models/Doctor");
        let doctorEmail = null;
        let doctorName = appt.doctorName || "Doctor";

        // Fetch doctor email from Doctor model
        if (mongoose.Types.ObjectId.isValid(appt.doctor)) {
          const doctorDoc = await Doctor.findById(appt.doctor).select(
            "name email",
          );
          if (doctorDoc) {
            doctorEmail = doctorDoc.email;
            doctorName = doctorDoc.name;
            console.log(`[EMAIL] Found doctor: ${doctorName} (${doctorEmail})`);
          }
        }

        if (doctorEmail) {
          const readableDate = date
            ? new Date(date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "(date not set)";

          const doctorSubject = `New Appointment Confirmed - ${patientName}`;
          const doctorHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
              <h2 style="color: #4f46e5;">Hello Dr. ${doctorName},</h2>
              <p>A new appointment has been confirmed with you.</p>
              
              <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 12px 0; color: #374151; font-weight: 600;">📋 Appointment Details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Patient Name:</td>
                    <td style="padding: 4px 0; color: #111827; font-weight: 600;">${appt.patientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Father Name:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.fatherName || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Age:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.age ? appt.age + " years" : "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Gender:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.gender || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Contact:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.phone || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Email:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.patientEmail || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Department:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.department || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Date & Time:</td>
                    <td style="padding: 4px 0; color: #111827; font-weight: 600;">${readableDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Duration:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.durationMinutes || 30} minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280;">Mode:</td>
                    <td style="padding: 4px 0; color: #111827; font-weight: 600;">${appt.mode === "online" ? "🎥 Online" : "🏥 Physical"}</td>
                  </tr>
                  ${
                    appt.notes
                      ? `<tr>
                    <td style="padding: 4px 0; color: #6b7280;">Notes:</td>
                    <td style="padding: 4px 0; color: #111827;">${appt.notes}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>
              
              ${meetingLinkMessage}
              
              <p style="margin-top: 18px;">Please be available at the scheduled time.</p>
              <p style="margin-top: 24px;">Best regards,<br/>Hospital Management System</p>
            </div>
          `;

          const doctorText = `New appointment confirmed with ${patientName} on ${readableDate}. ${appt.meetingLink ? `Meeting Link: ${appt.meetingLink}` : ""}`;

          const noReplyFrom =
            process.env.SMTP_NO_REPLY ||
            `No Reply <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

          await sendEmail({
            to: doctorEmail,
            subject: doctorSubject,
            html: doctorHtml,
            text: doctorText,
            from: noReplyFrom,
          });
          console.log(`[EMAIL] ✓ Doctor notification sent to ${doctorEmail}`);
        } else {
          console.warn(
            `[EMAIL] No doctor email found for appointment ${appt._id}`,
          );
        }
      } catch (emailErr) {
        console.error(
          "[EMAIL ERROR] Failed to send doctor notification:",
          emailErr.message,
        );
      }
    }

    res.json({ ok: true, appointment: appt, notified, refund: refundInfo });
  } catch (err) {
    console.error("[UPDATE APPOINTMENT ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

// New endpoint to lookup patient by CNIC
exports.getPatientByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;

    if (!cnic) {
      return res.status(400).json({ message: "CNIC is required" });
    }

    console.log("[GET PATIENT BY CNIC] Looking up:", cnic);

    // Clean the CNIC by removing dashes and spaces
    const cleanCnic = cnic.replace(/[-\s]/g, "");

    // Create a regex that matches the CNIC in both formats:
    // 35201-1234567-1 or 3520112345671
    // Using word boundaries to ensure exact match
    const pattern1 = cleanCnic; // Without dashes
    const pattern2 = `${cleanCnic.slice(0, 5)}-${cleanCnic.slice(5, 12)}-${cleanCnic.slice(12)}`; // With dashes

    console.log(
      "[GET PATIENT BY CNIC] Searching for patterns:",
      pattern1,
      "or",
      pattern2,
    );

    // Find the most recent appointment for this CNIC
    const recentAppointment = await Appointment.findOne({
      $or: [{ cnic: pattern1 }, { cnic: pattern2 }],
    })
      .sort({ createdAt: -1 })
      .select(
        "patientName fatherName patientEmail phone cnic address gender age dateOfBirth",
      );

    if (!recentAppointment) {
      console.log("[GET PATIENT BY CNIC] No appointment found");
      return res.status(404).json({
        message: "No previous records found for this CNIC",
        found: false,
      });
    }

    // Count total appointments for this CNIC
    const totalAppointments = await Appointment.countDocuments({
      $or: [{ cnic: pattern1 }, { cnic: pattern2 }],
    });

    // Count completed visits
    const completedVisits = await Appointment.countDocuments({
      $or: [{ cnic: pattern1 }, { cnic: pattern2 }],
      status: "completed",
    });

    console.log("[GET PATIENT BY CNIC] Found patient:", {
      name: recentAppointment.patientName,
      totalAppointments,
      completedVisits,
    });

    res.json({
      found: true,
      patient: {
        firstName: recentAppointment.patientName?.split(" ")[0] || "",
        lastName:
          recentAppointment.patientName?.split(" ").slice(1).join(" ") || "",
        fatherName: recentAppointment.fatherName,
        email: recentAppointment.patientEmail,
        mobileNumber: recentAppointment.phone,
        nic: recentAppointment.cnic,
        address: recentAppointment.address,
        gender: recentAppointment.gender,
        age: recentAppointment.age,
        dateOfBirth: recentAppointment.dateOfBirth,
      },
      history: {
        totalAppointments,
        completedVisits,
        lastVisit: recentAppointment.createdAt,
      },
    });
  } catch (err) {
    console.error("[GET PATIENT BY CNIC ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};
