const mongoose = require("mongoose");

const patientRecordSchema = new mongoose.Schema(
  {
    // Patient Information
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    phone: { type: String },

    // Visit Information
    visitDate: { type: Date, default: Date.now },
    doctorName: { type: String, required: true },

    // Chief Complaint & Diagnosis
    complaints: { type: String },
    diagnosis: { type: String },

    // Vital Signs
    bloodPressure: { type: String },
    temperature: { type: String },

    // Treatment
    prescription: { type: String },

    // Follow-up
    followUpDate: { type: Date },
    followUpNotes: { type: String },

    // Attachments (files uploaded by doctor)
    attachments: [
      {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Related appointment
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    // Created by doctor
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Index for faster patient record lookups
patientRecordSchema.index({ patientEmail: 1, visitDate: -1 });
patientRecordSchema.index({ phone: 1, visitDate: -1 });

module.exports = mongoose.model("PatientRecord", patientRecordSchema);
