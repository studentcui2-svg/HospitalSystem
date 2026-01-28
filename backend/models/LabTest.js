const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientEmail: { type: String },
    phone: { type: String },
    cnic: { type: String },
    gender: { type: String },

    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    doctorName: { type: String },

    testName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Ordered", "InProgress", "Completed"],
      default: "Ordered",
    },
    result: { type: String },
    remarks: { type: String },

    report: {
      filename: String,
      path: String,
      url: String,
      uploadedAt: Date,
    },

    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

labTestSchema.index({ patientEmail: 1, createdAt: -1 });

module.exports = mongoose.model("LabTest", labTestSchema);
