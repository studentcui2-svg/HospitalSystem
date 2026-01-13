const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/email");

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

    const appointments = await Appointment.find(q)
      .sort({ date: -1 })
      .limit(100);
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

      const statusMessage =
        normalizedStatus === "Accepted"
          ? "We're happy to let you know that your appointment has been approved."
          : normalizedStatus === "Rejected"
          ? "We're sorry to inform you that we cannot accommodate your appointment at this time."
          : "Your appointment status has been updated.";

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="color: #4f46e5;">Hello ${patientName || "there"},</h2>
          <p>${statusMessage}</p>
          <p><strong>Status:</strong> ${normalizedStatus}</p>
          <p><strong>Scheduled Date:</strong> ${readableDate}</p>
          <p style="margin-top: 18px;">If you have any questions, please reply to this email or call our reception.</p>
          <p style="margin-top: 24px;">Best regards,<br/>The Clinic Team</p>
        </div>
      `;

      try {
        const noReplyFrom =
          process.env.SMTP_NO_REPLY ||
          `No Reply <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
        await sendEmail({
          to: patientEmail,
          subject,
          html,
          text: `${statusMessage} Status: ${normalizedStatus}. Scheduled Date: ${readableDate}.`,
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

    res.json({ ok: true, appointment: appt, notified });
  } catch (err) {
    console.error("[UPDATE APPOINTMENT ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};
