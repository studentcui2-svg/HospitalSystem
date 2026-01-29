const Medicine = require("../models/Medicine");

// Get all medicines
exports.getAllMedicines = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { genericName: new RegExp(search, "i") },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (lowStock === "true") {
      query.$expr = { $lte: ["$stockQuantity", "$reorderLevel"] };
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });

    res.json({ medicines });
  } catch (err) {
    console.error("[Pharmacy] Get medicines error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();

    res.status(201).json({ ok: true, medicine });
  } catch (err) {
    console.error("[Pharmacy] Add medicine error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ ok: true, medicine });
  } catch (err) {
    console.error("[Pharmacy] Update medicine error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update medicine stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: "add" or "subtract"

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (operation === "add") {
      medicine.stockQuantity += quantity;
    } else if (operation === "subtract") {
      medicine.stockQuantity = Math.max(0, medicine.stockQuantity - quantity);
    }

    await medicine.save();

    res.json({ ok: true, medicine });
  } catch (err) {
    console.error("[Pharmacy] Update stock error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get low stock medicines
exports.getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      isActive: true,
      $expr: { $lte: ["$stockQuantity", "$reorderLevel"] },
    }).sort({ stockQuantity: 1 });

    res.json({ medicines });
  } catch (err) {
    console.error("[Pharmacy] Get low stock error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findById(id).populate("interactsWith");

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ medicine });
  } catch (err) {
    console.error("[Pharmacy] Get medicine error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete medicine (soft delete)
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ ok: true, message: "Medicine deleted" });
  } catch (err) {
    console.error("[Pharmacy] Delete medicine error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pharmacy dashboard stats
exports.getPharmacyStats = async (req, res) => {
  try {
    const Prescription = require("../models/Prescription");

    const [
      totalMedicines,
      lowStockCount,
      expiringSoon,
      pendingPrescriptions,
      dispensedToday,
    ] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({
        isActive: true,
        $expr: { $lte: ["$stockQuantity", "$reorderLevel"] },
      }),
      Medicine.countDocuments({
        isActive: true,
        expiryDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
      Prescription.countDocuments({ status: "Pending" }),
      Prescription.countDocuments({
        status: { $in: ["Dispensed", "PartiallyDispensed"] },
        dispensedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    res.json({
      totalMedicines,
      lowStockCount,
      expiringSoon,
      pendingPrescriptions,
      dispensedToday,
    });
  } catch (err) {
    console.error("[Pharmacy] Get stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
