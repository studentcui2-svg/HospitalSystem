const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const pharmacyController = require("../controllers/pharmacyController");

// Get all medicines
router.get("/medicines", authenticate, pharmacyController.getAllMedicines);

// Get medicine by ID
router.get("/medicines/:id", authenticate, pharmacyController.getMedicineById);

// Add new medicine
router.post("/medicines", authenticate, pharmacyController.addMedicine);

// Update medicine
router.put("/medicines/:id", authenticate, pharmacyController.updateMedicine);

// Update stock
router.patch(
  "/medicines/:id/stock",
  authenticate,
  pharmacyController.updateStock,
);

// Get low stock medicines
router.get("/low-stock", authenticate, pharmacyController.getLowStockMedicines);

// Delete medicine
router.delete(
  "/medicines/:id",
  authenticate,
  pharmacyController.deleteMedicine,
);

// Get pharmacy stats
router.get("/stats", authenticate, pharmacyController.getPharmacyStats);

module.exports = router;
