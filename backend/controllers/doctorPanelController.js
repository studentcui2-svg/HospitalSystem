const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/email");

exports.getMyAppointments = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    if (!userEmail)
      return res.status(401).json({ message: "Not authenticated" });

    // Try to find doctor entry
    const doctor = await Doctor.findOne({
      email: { $regex: `^${userEmail}$`, $options: "i" },
    });
    const doctorName = doctor ? doctor.name : null;

    // Build query to match appointments where `doctor` equals the registered name or email
    const q = {
      $or: [],
    };
    if (doctorName) q.$or.push({ doctor: doctorName });
    q.$or.push({ doctor: userEmail });

    // if no or conditions, return empty
    if (!q.$or.length) return res.json({ ok: true, appointments: [] });

    const appointments = await Appointment.find(q)
      .sort({ date: 1 })
      .limit(1000);
    res.json({ ok: true, appointments });
  } catch (err) {
    console.error(
      "[DOCTOR PANEL] getMyAppointments error:",
      err && err.message
    );
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    const { id } = req.params;
    const { status } = req.body;

    if (!userEmail)
      return res.status(401).json({ message: "Not authenticated" });
    if (!id)
      return res.status(400).json({ message: "Appointment ID required" });
    if (!status) return res.status(400).json({ message: "Status required" });

    const allowed = ["Accepted", "Rejected", "Pending"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const appt = await Appointment.findById(id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    // Ensure this doctor is allowed to modify this appointment
    // Accept if appt.doctor equals doctor's name or email
    const doctor = await Doctor.findOne({
      email: { $regex: `^${userEmail}$`, $options: "i" },
    });
    const doctorName = doctor ? doctor.name : null;
    if (
      !(
        appt.doctor &&
        (appt.doctor === userEmail ||
          (doctorName && appt.doctor === doctorName))
      )
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this appointment" });
    }

    // If rejecting and payment completed, issue refund using stripe if available
    if (
      status === "Rejected" &&
      appt.payment?.status === "completed" &&
      appt.payment?.paymentIntentId
    ) {
      try {
        const Stripe = require("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const refund = await stripe.refunds.create({
          payment_intent: appt.payment.paymentIntentId,
        });
        appt.payment.status = "refunded";
        appt.payment.refundedAt = new Date();
        appt.payment.refundId = refund.id;
      } catch (reErr) {
        console.error("[DOCTOR PANEL] refund failed:", reErr && reErr.message);
      }
    }

    appt.status = status;
    await appt.save();

    // notify patient email if present
    if (appt.patientEmail) {
      try {
        const readableDate = appt.date
          ? new Date(appt.date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "(date not set)";
        const subject = `Your appointment status updated`;
        const html = `<p>Hello ${
          appt.patientName || "there"
        },</p><p>Your appointment scheduled on ${readableDate} has been updated to <strong>${status}</strong>.</p>`;
        await sendEmail({ to: appt.patientEmail, subject, html });
      } catch (emailErr) {
        console.warn(
          "[DOCTOR PANEL] Failed to send status email",
          emailErr && emailErr.message
        );
      }
    }

    res.json({ ok: true, appointment: appt });
  } catch (err) {
    console.error(
      "[DOCTOR PANEL] updateAppointmentStatus error:",
      err && err.message
    );
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    if (!userEmail)
      return res.status(401).json({ message: "Not authenticated" });
    const User = require("../models/User");
    const user = await User.findOne({
      email: { $regex: `^${userEmail}$`, $options: "i" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      ok: true,
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
      },
    });
  } catch (err) {
    console.error("[DOCTOR PANEL] getProfile error:", err && err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userEmail = req.userEmail;
    if (!userEmail)
      return res.status(401).json({ message: "Not authenticated" });
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const User = require("../models/User");
    const user = await User.findOne({
      email: { $regex: `^${userEmail}$`, $options: "i" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user already has a password, require currentPassword to match
    if (user.password) {
      const ok = await user.comparePassword(currentPassword || "");
      if (!ok)
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ ok: true, message: "Password updated" });
  } catch (err) {
    console.error("[DOCTOR PANEL] changePassword error:", err && err.message);
    res.status(500).json({ message: "Server error" });
  }
};
