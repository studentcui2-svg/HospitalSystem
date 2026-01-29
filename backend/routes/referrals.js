const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createReferral,
  getDoctorReferrals,
  updateReferralStatus,
  getReferral,
} = require("../controllers/referralController");

// All routes require authentication
router.use(authenticate);

// Create a new referral (doctor only)
router.post("/", createReferral);

// Get referrals for logged-in doctor
router.get("/", getDoctorReferrals);

// Get single referral
router.get("/:id", getReferral);

// Update referral status (referred doctor only)
router.patch("/:id/status", updateReferralStatus);

module.exports = router;
