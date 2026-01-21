const mongoose = require("mongoose");

const patientRecordSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    phone: { type: String },
    cnic: { type: String },

    // Medical Information
    recordType: {
      type: String,
      enum: [
        "visit",
        "lab_report",
        "prescription",
        "diagnosis",
        "notes",
        "image",
        "document",
      ],
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },
    diagnosis: { type: String },
    prescription: { type: String },
    labResults: { type: String },

    // Visit Information
    visitDate: { type: Date, default: Date.now },
    doctorName: { type: String, required: true },
    department: { type: String },

    // Vital Signs
    bloodPressure: { type: String },
    heartRate: { type: String },
    temperature: { type: String },
    weight: { type: String },
    height: { type: String },

    // File attachments
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Medications
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],

    // Follow-up
    followUpDate: { type: Date },
    followUpNotes: { type: String },

    // Status
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },

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
patientRecordSchema.index({ cnic: 1, visitDate: -1 });

module.exports = mongoose.model("PatientRecord", patientRecordSchema);
