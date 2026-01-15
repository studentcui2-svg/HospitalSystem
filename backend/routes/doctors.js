const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { authenticate } = require("../middleware/auth");

router.get("/", doctorController.getDoctors);
router.post("/", authenticate, doctorController.createDoctor);
router.put("/:id", authenticate, doctorController.updateDoctor);
router.delete("/:id", authenticate, doctorController.deleteDoctor);
router.post(
  "/backfill-users",
  authenticate,
  doctorController.backfillDoctorUsers
);

module.exports = router;
