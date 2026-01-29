const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String },

    referringDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referringDoctorName: { type: String, required: true },
    referringDoctorEmail: { type: String },
    referringDepartment: { type: String },

    referredDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredDoctorName: { type: String, required: true },
    referredDoctorEmail: { type: String, required: true },
    referredDepartment: { type: String },

    reason: { type: String, required: true },
    notes: { type: String },
    urgency: {
      type: String,
      enum: ["routine", "urgent", "emergency"],
      default: "routine",
    },

    patientHistory: { type: String },
    diagnosis: { type: String },
    currentMedications: { type: String },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },

    appointmentBooked: { type: Boolean, default: false },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Referral", referralSchema);
