/* eslint-env node, commonjs */
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    department: { type: String },
    nic: { type: String },
    gender: { type: String },
    bio: { type: String },
    role: { type: String, enum: ["doctor", "lab"], default: "doctor" },
    dateOfBirth: { type: Date },
    photo: { type: String },
  },
  { timestamps: true },
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
