const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const prescriptionController = require("../controllers/prescriptionController");

// Create prescription (doctors only)
router.post("/", authenticate, prescriptionController.createPrescription);

// Get patient prescriptions
router.get(
  "/patient/:patientEmail",
  authenticate,
  prescriptionController.getPatientPrescriptions,
);

// Get doctor's prescriptions
router.get(
  "/doctor",
  authenticate,
  prescriptionController.getDoctorPrescriptions,
);

// Get pending prescriptions (pharmacy)
router.get(
  "/pending",
  authenticate,
  prescriptionController.getPendingPrescriptions,
);

// Get prescription by ID
router.get("/:id", authenticate, prescriptionController.getPrescriptionById);

// Update prescription status (pharmacy)
router.patch(
  "/:id/status",
  authenticate,
  prescriptionController.updatePrescriptionStatus,
);

module.exports = router;
