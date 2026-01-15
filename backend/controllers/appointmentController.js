const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/email");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createAppointment = async (req, res) => {
  try {
    console.log("[CREATE APPOINTMENT] Payload received:", req.body);

    const {
      patientName,
      patientEmail,
      cnic,
      phone,
      address,
      gender,
      dateOfBirth,
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

    // Check for overlapping appointments for the same doctor
    if (doctor) {
      const conflict = await Appointment.findOne({
        doctor,
        date: { $lt: endDate },
        end: { $gt: appointmentDate },
      });
      if (conflict) {
        console.warn(
          "[CREATE APPOINTMENT] Slot conflict for doctor",
          doctor,
          appointmentDate,
          endDate
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

    const appt = new Appointment({
      patientName,
      patientEmail,
      cnic,
      phone,
      address,
      gender,
      dateOfBirth: safeDob,
      department,
      doctor,
      notes,
      visitedBefore: visitedFlag,
      date: appointmentDate,
      end: endDate,
      durationMinutes: duration,
      timezone,
      createdBy: req.userId,
    });

    await appt.save();
    console.log("[CREATE APPOINTMENT] Saved appointment:", appt._id);
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

    // allow admin to request full list when needed via query param `all=true`
    let queryExec = Appointment.find(q).sort({ date: -1 });
    if (String(req.query.all) !== "true") {
      const max = 1000; // safety cap
      const limit = Math.min(Number(req.query.limit) || 100, max);
      queryExec = queryExec.limit(limit);
      console.log("[GET APPOINTMENTS] Applying limit:", limit);
    } else {
      console.log("[GET APPOINTMENTS] Returning all appointments (no limit)");
    }

    const appointments = await queryExec;
    console.log(
      "[GET APPOINTMENTS] Found",
      appointments.length,
      "appointments"
    );
    res.json({ ok: true, appointments });
  } catch (err) {
    console.error("[GET APPOINTMENTS ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`[UPDATE APPOINTMENT] ${id} -> ${status}`);

    const normalizedStatus = typeof status === "string" ? status.trim() : "";
    const allowedStatuses = ["Pending", "Accepted", "Rejected"];

    if (!allowedStatuses.includes(normalizedStatus)) {
      console.warn(
        "[UPDATE APPOINTMENT] Invalid status received:",
        normalizedStatus
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
        normalizedStatus
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
    await appt.save();
    console.log("[UPDATE APPOINTMENT] Updated:", appt._id);

    let notified = false;
    const { patientEmail, patientName, date } = appt;

    if (patientEmail) {
      const readableDate = date
        ? new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "(date not set)";

      const capitalizedStatus = normalizedStatus.toUpperCase();
      const subject = `Your appointment has been ${capitalizedStatus}`;

      let statusMessage =
        normalizedStatus === "Accepted"
          ? "We're happy to let you know that your appointment has been approved."
          : normalizedStatus === "Rejected"
          ? "We're sorry to inform you that we cannot accommodate your appointment at this time."
          : "Your appointment status has been updated.";

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
              <td style="padding: 4px 0; color: #6b7280;">Department:</td>
              <td style="padding: 4px 0; color: #111827;">${
                appt.department || "N/A"
              }</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Doctor:</td>
              <td style="padding: 4px 0; color: #111827;">${
                appt.doctor || "N/A"
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
              : `<p><strong>Scheduled Date:</strong> ${readableDate}</p>`
          }
          ${refundMessage}
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
          emailError
        );
      }
    } else {
      console.warn(
        "[UPDATE APPOINTMENT] No patient email available for notification",
        appt._id
      );
    }

    res.json({ ok: true, appointment: appt, notified, refund: refundInfo });
  } catch (err) {
    console.error("[UPDATE APPOINTMENT ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};
