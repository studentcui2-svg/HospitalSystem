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

// Create new patient record (with file upload support)
router.post(
  "/records",
  authenticate,
  patientRecordController.upload.array("attachments", 10),
  patientRecordController.createPatientRecord,
);

// Update patient record (with file upload support)
router.put(
  "/records/:id",
  authenticate,
  patientRecordController.upload.array("attachments", 10),
  patientRecordController.updatePatientRecord,
);

// Delete patient record
router.delete(
  "/records/:id",
  authenticate,
  patientRecordController.deletePatientRecord,
);

// Get records for a specific appointment
router.get(
  "/appointment/:appointmentId",
  authenticate,
  patientRecordController.getRecordsByAppointment,
);

// Upload patient medical report
router.post(
  "/upload",
  authenticate,
  patientRecordController.upload.single("file"),
  patientRecordController.uploadPatientReport,
);

module.exports = router;
