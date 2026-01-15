const express = require("express");
const {
  getSiteContent,
  updateSiteContent,
} = require("../controllers/siteContentController");
const { isAdmin } = require("../middleware/auth");

const router = express.Router();

// Get site content
router.get("/", getSiteContent);

// Update site content (admin only)
router.put("/", isAdmin, updateSiteContent);

module.exports = router;
