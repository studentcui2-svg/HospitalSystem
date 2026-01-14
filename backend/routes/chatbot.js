const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// POST /api/chatbot  { message: "..." }
router.post("/", chatbotController.chat);

module.exports = router;
