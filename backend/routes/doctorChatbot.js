const express = require("express");
const router = express.Router();
const doctorChatbotController = require("../controllers/doctorChatbotController");
const { authenticate } = require("../middleware/auth");

// POST /api/doctor-chatbot/analyze
// Medical case analysis for doctors with file upload support
router.post(
  "/analyze",
  authenticate,
  doctorChatbotController.upload.array("medicalFiles", 10),
  doctorChatbotController.analyzeMedicalCase,
);

module.exports = router;
