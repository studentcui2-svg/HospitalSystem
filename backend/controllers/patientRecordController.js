const PatientRecord = require("../models/PatientRecord");
const Appointment = require("../models/Appointment");

// Get all records for a specific patient
exports.getPatientRecords = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be email or phone
    const { doctorName } = req.query; // Filter by doctor

    console.log("[GET PATIENT RECORDS] Identifier:", identifier);
    console.log("[GET PATIENT RECORDS] Doctor filter:", doctorName);

    const query = {
      $or: [
        { patientEmail: identifier },
        { phone: identifier },
        { patientName: new RegExp(`^${identifier}$`, "i") },
      ],
    };

    // Add doctor filter to records if provided
    if (doctorName) {
      query.doctorName = doctorName;
    }

    const records = await PatientRecord.find(query)
      .sort({ visitDate: -1 })
      .populate("appointmentId");

    console.log("[GET PATIENT RECORDS] Records found:", records.length);

    const appointmentQuery = {
      $or: [
        { patientEmail: identifier },
        { phone: identifier },
        { patientName: new RegExp(`^${identifier}$`, "i") },
      ],
    };

    // Add doctor filter to appointments if provided
    if (doctorName) {
      appointmentQuery.doctor = doctorName;
    }

    console.log(
      "[GET PATIENT RECORDS] Appointment query:",
      JSON.stringify(appointmentQuery),
    );

    const appointments = await Appointment.find(appointmentQuery).sort({
      date: -1,
    });

    console.log(
      "[GET PATIENT RECORDS] Appointments found:",
      appointments.length,
    );
    if (appointments.length > 0) {
      console.log(
        "[GET PATIENT RECORDS] First appointment doctor:",
        appointments[0].doctor,
      );
    }

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
          },
          lastVisit: { $max: "$visitDate" },
          totalVisits: { $sum: 1 },
        },
      },
      { $sort: { lastVisit: -1 } },
    ]);

    res.json({
      success: true,
      patients: patients,
      total: patients.length,
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

    // Clean CNIC if it's in CNIC format
    const cleanIdentifier = identifier.replace(/[-\s]/g, "");
    const isCnic =
      cleanIdentifier.length === 13 && /^\d+$/.test(cleanIdentifier);

    let query;
    if (isCnic) {
      // For CNIC, match both with and without dashes exactly
      const pattern1 = cleanIdentifier;
      const pattern2 = `${cleanIdentifier.slice(0, 5)}-${cleanIdentifier.slice(5, 12)}-${cleanIdentifier.slice(12)}`;
      query = {
        $or: [{ cnic: pattern1 }, { cnic: pattern2 }],
      };
    } else {
      // For email, phone, or name
      query = {
        $or: [
          { patientEmail: identifier },
          { phone: identifier },
          { patientName: new RegExp(`^${identifier}$`, "i") },
        ],
      };
    }

    // Try to get patient info from latest record first
    let latestRecord = await PatientRecord.findOne({
      ...query,
      status: { $ne: "deleted" },
    }).sort({
      visitDate: -1,
    });

    // If no record found, try to get from appointments
    if (!latestRecord) {
      const latestAppointment = await Appointment.findOne(query).sort({
        date: -1,
      });

      if (!latestAppointment) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Return patient info from appointment
      return res.json({
        success: true,
        patient: {
          name: latestAppointment.patientName,
          email: latestAppointment.patientEmail,
          phone: latestAppointment.phone,
          cnic: latestAppointment.cnic,
        },
        stats: {
          totalRecords: 0,
          totalVisits: 0,
          recordsByType: [],
        },
        appointments: [],
        latestVitals: null,
      });
    }

    // Count records by type
    const recordStats = await PatientRecord.aggregate([
      { $match: { ...query, status: { $ne: "deleted" } } },
      { $group: { _id: "$recordType", count: { $sum: 1 } } },
    ]);

    // Get all appointments using the same query logic
    const appointments = await Appointment.find(query).sort({ date: -1 });

    // Latest vital signs
    const latestVitals = await PatientRecord.findOne({
      ...query,
      status: { $ne: "deleted" },
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
