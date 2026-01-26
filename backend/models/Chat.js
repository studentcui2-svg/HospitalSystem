const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["user", "doctor"], required: true },
  // Encrypted text message. Optional when sending attachments.
  content: { type: String },
  // Optional attachment metadata for files/images sent in chat
  attachment: {
    url: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    kind: { type: String, enum: ["image", "file"] },
  },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Doctor's user account
    messages: [messageSchema],
    lastMessage: { type: String },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCount: {
      patient: { type: Number, default: 0 },
      doctor: { type: Number, default: 0 },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index for faster queries
chatSchema.index({ patient: 1, doctor: 1 });
chatSchema.index({ patient: 1, active: 1 });
chatSchema.index({ doctorUser: 1, active: 1 });

module.exports = mongoose.model("Chat", chatSchema);
