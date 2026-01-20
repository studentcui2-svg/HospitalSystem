const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/forgot", authController.resendOtp);
router.post("/verify-reset", authController.verifyReset);
router.post("/reset-password", authController.resetPassword);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.post("/avatar", authenticate, authController.updateAvatar);
router.delete("/delete", authenticate, authController.deleteAccount);

module.exports = router;
