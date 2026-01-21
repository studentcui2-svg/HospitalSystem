const PatientRecord = require("../models/PatientRecord");
const Appointment = require("../models/Appointment");

// Get all records for a specific patient
exports.getPatientRecords = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be email, phone, or CNIC

    const query = {
      $or: [
        { patientEmail: identifier },
        { phone: identifier },
        { cnic: identifier },
        { patientName: new RegExp(identifier, "i") },
      ],
      status: { $ne: "deleted" },
    };

    const records = await PatientRecord.find(query)
      .sort({ visitDate: -1 })
      .populate("appointmentId");

    // Get all appointments for this patient
    const appointments = await Appointment.find({
      $or: [
        { patientEmail: identifier },
        { phone: identifier },
        { cnic: identifier },
        { patientName: new RegExp(identifier, "i") },
      ],
    }).sort({ date: -1 });

    res.json({
      success: true,
      records,
      appointments,
      totalRecords: records.length,
      totalVisits: appointments.length,
    });
  } catch (error) {
    console.error("[GET PATIENT RECORDS ERROR]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all unique patients (for patient list)
exports.getAllPatients = async (req, res) => {
  try {
    const { doctorName } = req.query;

    let query = {};
    if (doctorName) {
      query.doctorName = doctorName;
    }

    // Get unique patients from records
    const patients = await PatientRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            email: "$patientEmail",
            name: "$patientName",
            phone: "$phone",
            cnic: "$cnic",
          },
          lastVisit: { $max: "$visitDate" },
          totalVisits: { $sum: 1 },
          records: { $push: "$$ROOT" },
        },
      },
      { $sort: { lastVisit: -1 } },
    ]);

    // Also get patients from appointments
    const appointmentPatients = await Appointment.aggregate([
      doctorName ? { $match: { doctor: doctorName } } : { $match: {} },
      {
        $group: {
          _id: {
            email: "$patientEmail",
            name: "$patientName",
            phone: "$phone",
            cnic: "$cnic",
          },
          lastVisit: { $max: "$date" },
          totalAppointments: { $sum: 1 },
        },
      },
    ]);

    // Merge and deduplicate
    const allPatients = [...patients, ...appointmentPatients];
    const uniquePatients = Array.from(
      new Map(
        allPatients.map((p) => [p._id.email || p._id.phone || p._id.cnic, p]),
      ).values(),
    );

    res.json({
      success: true,
      patients: uniquePatients,
      total: uniquePatients.length,
    });
  } catch (error) {
    console.error("[GET ALL PATIENTS ERROR]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new patient record
exports.createPatientRecord = async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      createdBy: req.userId,
    };

    const record = new PatientRecord(recordData);
    await record.save();

    console.log("[CREATE PATIENT RECORD] Created:", record._id);
    res.status(201).json({
      success: true,
      record,
      message: "Patient record created successfully",
    });
  } catch (error) {
    console.error("[CREATE PATIENT RECORD ERROR]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update patient record
exports.updatePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await PatientRecord.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    console.log("[UPDATE PATIENT RECORD] Updated:", record._id);
    res.json({
      success: true,
      record,
      message: "Record updated successfully",
    });
  } catch (error) {
    console.error("[UPDATE PATIENT RECORD ERROR]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete patient record (soft delete)
exports.deletePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await PatientRecord.findByIdAndUpdate(
      id,
      { $set: { status: "deleted" } },
      { new: true },
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    console.log("[DELETE PATIENT RECORD] Deleted:", record._id);
    res.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE PATIENT RECORD ERROR]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient summary (overview)
exports.getPatientSummary = async (req, res) => {
  try {
    const { identifier } = req.params;

    const query = {
      $or: [
        { patientEmail: identifier },
        { phone: identifier },
        { cnic: identifier },
      ],
    };

    // Get patient info from latest record
    const latestRecord = await PatientRecord.findOne(query).sort({
      visitDate: -1,
    });

    if (!latestRecord) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Count records by type
    const recordStats = await PatientRecord.aggregate([
      { $match: { ...query, status: { $ne: "deleted" } } },
      { $group: { _id: "$recordType", count: { $sum: 1 } } },
    ]);

    // Get all appointments
    const appointments = await Appointment.find(query).sort({ date: -1 });

    // Latest vital signs
    const latestVitals = await PatientRecord.findOne({
      ...query,
      bloodPressure: { $exists: true, $ne: null },
    }).sort({ visitDate: -1 });

    res.json({
      success: true,
      patient: {
        name: latestRecord.patientName,
        email: latestRecord.patientEmail,
        phone: latestRecord.phone,
        cnic: latestRecord.cnic,
      },
      stats: {
        totalRecords: await PatientRecord.countDocuments({
          ...query,
          status: { $ne: "deleted" },
        }),
        totalAppointments: appointments.length,
        recordsByType: recordStats,
      },
      latestVitals: latestVitals
        ? {
            bloodPressure: latestVitals.bloodPressure,
            heartRate: latestVitals.heartRate,
            temperature: latestVitals.temperature,
            weight: latestVitals.weight,
            height: latestVitals.height,
            date: latestVitals.visitDate,
          }
        : null,
      recentVisits: await PatientRecord.find(query)
        .sort({ visitDate: -1 })
        .limit(5),
    });
  } catch (error) {
    console.error("[GET PATIENT SUMMARY ERROR]", error);
    res.status(500).json({ message: "Server error" });
  }
};
