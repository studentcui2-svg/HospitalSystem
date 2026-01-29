const mongoose = require("mongoose");

const prescriptionItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., "500mg"
  frequency: { type: String, required: true }, // e.g., "Twice daily", "Three times daily"
  duration: { type: String, required: true }, // e.g., "7 days", "2 weeks"
  instructions: { type: String }, // e.g., "Take after meals"
  quantity: { type: Number, required: true }, // Total quantity to dispense
});

const prescriptionSchema = new mongoose.Schema(
  {
    // Patient info
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    patientPhone: { type: String },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Doctor info
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorName: { type: String, required: true },
    doctorEmail: { type: String },
    specialization: { type: String },

    // Associated appointment/record
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    patientRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientRecord",
    },

    // Diagnosis
    diagnosis: { type: String, required: true },

    // Medicines
    medicines: [prescriptionItemSchema],

    // Additional instructions
    generalInstructions: { type: String },
    dietaryAdvice: { type: String },
    followUpDate: { type: Date },

    // Prescription status
    status: {
      type: String,
      enum: ["Pending", "Dispensed", "PartiallyDispensed", "Cancelled"],
      default: "Pending",
    },

    // Pharmacy info
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dispensedAt: { type: Date },
    pharmacyRemarks: { type: String },

    // Digital signature
    digitalSignature: { type: String },
    qrCode: { type: String }, // For pharmacy scanning

    // Validity
    validUntil: { type: Date },
    isExpired: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-set validity to 30 days from creation
prescriptionSchema.pre("save", function (next) {
  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Index for faster queries
prescriptionSchema.index({ patientEmail: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
