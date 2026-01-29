const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genericName: { type: String },
    category: {
      type: String,
      enum: [
        "Antibiotic",
        "Painkiller",
        "Antacid",
        "Antihistamine",
        "Antidiabetic",
        "Antihypertensive",
        "Vitamin",
        "Supplement",
        "Antiviral",
        "Antifungal",
        "Neurological",
        "Cardiovascular",
        "Gastrointestinal",
        "Respiratory",
        "Dermatological",
        "Contrast Media",
        "Other",
      ],
      default: "Other",
    },
    manufacturer: { type: String },
    form: {
      type: String,
      enum: [
        "Tablet",
        "Capsule",
        "Syrup",
        "Injection",
        "Drops",
        "Cream",
        "Ointment",
        "Inhaler",
        "Gel",
        "Lotion",
        "Spray",
        "Suspension",
        "Solution",
        "Suppository",
        "Respules",
        "Sachet",
        "Other",
      ],
      default: "Tablet",
    },
    strength: { type: String }, // e.g., "500mg", "10ml"
    price: { type: Number, default: 0 },

    // Inventory
    stockQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    expiryDate: { type: Date },
    batchNumber: { type: String },

    // Usage information
    commonDosage: { type: String }, // e.g., "1 tablet twice daily"
    sideEffects: { type: String },
    warnings: { type: String },

    // Drug interactions - array of medicine IDs that interact dangerously
    interactsWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }],

    // Simple interaction warnings as text
    interactionWarnings: [{ type: String }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index for faster search
medicineSchema.index({ name: 1, genericName: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ stockQuantity: 1 });
medicineSchema.index({ name: 1, strength: 1, form: 1 }, { unique: true }); // Unique combination

module.exports = mongoose.model("Medicine", medicineSchema);
