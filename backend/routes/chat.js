const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const Chat = require("../models/Chat");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "chat");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.error("[CHAT UPLOAD] Failed to create upload directory", err);
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Get all chats for current user (patient or doctor)
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let chats;
    if (userRole === "doctor") {
      // Find doctor by user email
      const user = await User.findById(userId);
      const doctor = await Doctor.findOne({ email: user.email });

      if (!doctor) {
        return res.json({ chats: [] });
      }

      // Get all chats and remove duplicates by patient ID
      const allChats = await Chat.find({ doctor: doctor._id, active: true })
        .populate("patient", "name email avatarUrl")
        .sort({ lastMessageTime: -1 });

      // Remove duplicates - keep only the most recent chat per patient
      const seenPatients = new Set();
      chats = allChats.filter((chat) => {
        if (!chat.patient || !chat.patient._id) return false;
        const patientId = chat.patient._id.toString();
        if (seenPatients.has(patientId)) {
          return false; // Skip duplicate
        }
        seenPatients.add(patientId);
        return true;
      });
    } else {
      chats = await Chat.find({ patient: userId, active: true })
        .populate("doctor", "name department email")
        .sort({ lastMessageTime: -1 });
    }

    res.json({ chats });
  } catch (error) {
    console.error("[GET CHATS ERROR]", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
});

// Get specific chat with messages
router.get("/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const chat = await Chat.findById(chatId)
      .populate("patient", "name email avatarUrl")
      .populate("doctor", "name department email");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify user has access to this chat
    if (userRole === "doctor") {
      const user = await User.findById(userId);
      const doctor = await Doctor.findOne({ email: user.email });
      if (!doctor || chat.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      if (chat.patient._id.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Mark messages as read
    if (userRole === "doctor") {
      chat.unreadCount.doctor = 0;
      chat.messages.forEach((msg) => {
        if (msg.senderRole === "user") msg.read = true;
      });
    } else {
      chat.unreadCount.patient = 0;
      chat.messages.forEach((msg) => {
        if (msg.senderRole === "doctor") msg.read = true;
      });
    }
    await chat.save();

    res.json({ chat });
  } catch (error) {
    console.error("[GET CHAT ERROR]", error);
    res.status(500).json({ message: "Failed to load chat" });
  }
});

// Create or get existing chat with doctor (patient) or patient (doctor)
router.post("/", authenticate, async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Handle based on user role
    if (userRole === "doctor") {
      // Doctor initiating chat with patient
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID required" });
      }

      const patient = await User.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Find doctor by user email
      const user = await User.findById(userId);
      const doctor = await Doctor.findOne({ email: user.email });

      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      // Check if chat already exists
      let chat = await Chat.findOne({
        patient: patientId,
        doctor: doctor._id,
      })
        .populate("patient", "name email avatarUrl")
        .populate("doctor", "name department email");

      if (!chat) {
        // Create new chat
        chat = new Chat({
          patient: patientId,
          doctor: doctor._id,
          doctorUser: userId,
          messages: [],
        });
        await chat.save();
        chat = await Chat.findById(chat._id)
          .populate("patient", "name email avatarUrl")
          .populate("doctor", "name department email");
      }

      res.json({ chat });
    } else {
      // Patient initiating chat with doctor
      if (!doctorId) {
        return res.status(400).json({ message: "Doctor ID required" });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Find doctor's user account
      const doctorUser = await User.findOne({ email: doctor.email });

      // Check if chat already exists
      let chat = await Chat.findOne({
        patient: userId,
        doctor: doctorId,
      })
        .populate("patient", "name email avatarUrl")
        .populate("doctor", "name department email");

      if (!chat) {
        // Create new chat
        chat = new Chat({
          patient: userId,
          doctor: doctorId,
          doctorUser: doctorUser?._id,
          messages: [],
        });
        await chat.save();
        chat = await Chat.findById(chat._id)
          .populate("patient", "name email avatarUrl")
          .populate("doctor", "name department email");
      }

      res.json({ chat });
    }
  } catch (error) {
    console.error("[CREATE CHAT ERROR]", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
});

// Delete/end chat
router.delete("/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify user owns this chat
    if (chat.patient.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    chat.active = false;
    await chat.save();

    res.json({ message: "Chat ended successfully" });
  } catch (error) {
    console.error("[DELETE CHAT ERROR]", error);
    res.status(500).json({ message: "Failed to end chat" });
  }
});

// Upload chat attachment (image or file)
router.post(
  "/:chatId/attachments",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      const { chatId } = req.params;

      // Basic validations
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Verify user has access to this chat
      const userId = req.userId;
      const userRole = req.userRole;
      if (userRole === "doctor") {
        const user = await User.findById(userId);
        const doctor = await Doctor.findOne({ email: user.email });
        if (!doctor || chat.doctor.toString() !== doctor._id.toString()) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        if (chat.patient.toString() !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const filePathRelative = path.join("/uploads", "chat", req.file.filename);
      const kind =
        req.file.mimetype && req.file.mimetype.startsWith("image/")
          ? "image"
          : "file";

      return res.status(201).json({
        ok: true,
        attachment: {
          url: filePathRelative,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          kind,
        },
      });
    } catch (error) {
      console.error("[CHAT ATTACHMENT UPLOAD ERROR]", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  },
);

module.exports = router;
