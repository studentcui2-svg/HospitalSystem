const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    cnic: { type: String },
    phone: { type: String },
    address: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    dateOfBirth: { type: Date },
    department: { type: String },
    doctor: { type: String },
    notes: { type: String },
    visitedBefore: { type: Boolean, default: false },
    // `date` is the appointment start time (stored as UTC)
    date: { type: Date, required: true },
    // `end` is the appointment end time (stored as UTC)
    end: { type: Date, required: true },
    // duration in minutes (20 - 60)
    durationMinutes: { type: Number, default: 30 },
    // optional timezone identifier or offset provided by client for display purposes
    timezone: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
