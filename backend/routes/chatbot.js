const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// POST /api/chatbot  { message: "..." }
router.post("/", chatbotController.chat);

// Dev-only debug endpoint
if (process.env.NODE_ENV !== "production" || process.env.DEBUG_GEMINI) {
  router.post("/debug", chatbotController.debug);
}

module.exports = router;
