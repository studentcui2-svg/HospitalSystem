const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/forgot", authController.resendOtp);
router.post("/verify-reset", authController.verifyReset);
router.post("/reset-password", authController.resetPassword);
router.post("/login", authController.login);

module.exports = router;
