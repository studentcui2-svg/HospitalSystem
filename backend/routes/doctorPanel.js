const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const doctorPanelController = require("../controllers/doctorPanelController");

router.get(
  "/appointments",
  authenticate,
  doctorPanelController.getMyAppointments
);
router.patch(
  "/appointments/:id/status",
  authenticate,
  doctorPanelController.updateAppointmentStatus
);
router.get("/me", authenticate, doctorPanelController.getProfile);
router.patch(
  "/me/password",
  authenticate,
  doctorPanelController.changePassword
);

module.exports = router;
