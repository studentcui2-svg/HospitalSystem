const express = require("express");
const router = express.Router();
const patientRecordController = require("../controllers/patientRecordController");
const { authenticate } = require("../middleware/auth");

// Get all patients (list view)
router.get("/patients", authenticate, patientRecordController.getAllPatients);

// Get patient summary
router.get(
  "/patients/:identifier/summary",
  authenticate,
  patientRecordController.getPatientSummary,
);

// Get all records for a specific patient
router.get(
  "/patients/:identifier/records",
  authenticate,
  patientRecordController.getPatientRecords,
);

// Create new patient record
router.post(
  "/records",
  authenticate,
  patientRecordController.createPatientRecord,
);

// Update patient record
router.put(
  "/records/:id",
  authenticate,
  patientRecordController.updatePatientRecord,
);

// Delete patient record
router.delete(
  "/records/:id",
  authenticate,
  patientRecordController.deletePatientRecord,
);

module.exports = router;
