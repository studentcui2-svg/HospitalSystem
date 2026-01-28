const express = require("express");
const router = express.Router();
const labController = require("../controllers/labController");
const { authenticate, isLab, isDoctor } = require("../middleware/auth");

// Doctors (or admin) can place orders
router.post("/order", authenticate, isDoctor, labController.orderTest);
// Lab users (or admin) can view and modify tests / upload reports
router.get("/", authenticate, isLab, labController.getTests);
router.patch("/:id", authenticate, isLab, labController.updateTest);
router.post("/:id/report", authenticate, isLab, labController.uploadReport);

module.exports = router;
