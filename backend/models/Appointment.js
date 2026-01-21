const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    fatherName: { type: String },
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
    age: { type: Number },
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
    // appointment mode: online (telehealth) or physical (in-clinic)
    mode: { type: String, enum: ["online", "physical"], default: "physical" },
    // for physical appointments, patient may choose to pay online or pay on-site
    paymentPreference: {
      type: String,
      enum: ["online", "on-site"],
      default: "online",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    rejectionReason: { type: String },
    meetingLink: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Payment information
    payment: {
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "cancelled", "refunded"],
        default: "pending",
      },
      paymentIntentId: String,
      amount: Number, // in USD
      currency: { type: String, default: "usd" },
      paidAt: Date,
      refundedAt: Date,
      refundId: String,
      receipt: String,
    },
    // Optional invoice details (useful for pay-on-site physical appointments)
    invoice: {
      invoiceNumber: String,
      amountDue: Number,
      currency: { type: String, default: "USD" },
      status: {
        type: String,
        enum: ["unpaid", "paid", "pending"],
        default: "unpaid",
      },
      note: String,
      generatedAt: Date,
      // Basic HTML snapshot of the invoice for printing/viewing
      html: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
