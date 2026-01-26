const PatientRecord = require("../models/PatientRecord");
const Appointment = require("../models/Appointment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/patient-records";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname).toLowerCase(),
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and documents are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Export the upload middleware
exports.upload = upload;

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
    // But also include records where patient has uploaded files (patientUploads array is not empty)
    if (doctorName) {
      query.$and = [
        {
          $or: [
            { doctorName: doctorName },
            { patientUploads: { $exists: true, $ne: [] } },
          ],
        },
      ];
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
      appointmentQuery.doctorName = doctorName;
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
      console.log("[GET PATIENT RECORDS] Doctor name filter:", doctorName);
      console.log(
        "[GET PATIENT RECORDS] Exact match:",
        appointments[0].doctor === doctorName,
      );
      // Log all appointment doctors for debugging
      appointments.forEach((apt, idx) => {
        console.log(
          `[GET PATIENT RECORDS] Appointment ${idx + 1} doctor: "${apt.doctor}"`,
        );
      });
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

    // Add uploaded files to attachments
    if (req.files && req.files.length > 0) {
      recordData.attachments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

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

    // Add new files to existing attachments if files are uploaded
    if (req.files && req.files.length > 0) {
      const existingRecord = await PatientRecord.findById(id);
      const newAttachments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));

      // Combine existing and new attachments
      updates.attachments = [
        ...(existingRecord.attachments || []),
        ...newAttachments,
      ];
    }

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

// Get records by appointment ID
exports.getRecordsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Get appointment details to find patient info
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Find all patient records for this appointment OR for this patient (by email/phone)
    const query = {
      $or: [
        { appointmentId: appointmentId },
        { patientEmail: appointment.patientEmail },
        { phone: appointment.phone },
      ],
      status: { $ne: "deleted" },
    };

    const records = await PatientRecord.find(query).sort({ createdAt: -1 });

    // Flatten patient uploads from all records
    const allUploads = [];
    records.forEach((record) => {
      if (record.patientUploads && record.patientUploads.length > 0) {
        record.patientUploads.forEach((upload) => {
          allUploads.push({
            _id: record._id + "-" + upload._id,
            recordId: record._id,
            uploadId: upload._id,
            title: upload.title,
            description: upload.description,
            originalName: upload.originalName,
            path: upload.path,
            fileUrl: upload.path
              ? `/uploads/patient-records/${path.basename(upload.path)}`
              : upload.fileUrl,
            mimetype: upload.mimetype,
            size: upload.size,
            uploadedBy: upload.uploadedBy,
            uploadedAt: upload.uploadedAt,
          });
        });
      }

      // Also include doctor attachments
      if (record.attachments && record.attachments.length > 0) {
        record.attachments.forEach((attachment) => {
          allUploads.push({
            _id: record._id + "-" + attachment._id,
            recordId: record._id,
            uploadId: attachment._id,
            title: record.diagnosis || "Medical Record",
            description: record.prescription || "",
            originalName: attachment.originalName,
            path: attachment.path,
            fileUrl: attachment.path
              ? `/uploads/patient-records/${path.basename(attachment.path)}`
              : "",
            mimetype: attachment.mimetype,
            size: attachment.size,
            uploadedBy: "doctor",
            uploadedAt: attachment.uploadedAt,
          });
        });
      }
    });

    res.json({
      success: true,
      records: allUploads,
    });
  } catch (error) {
    console.error("[GET RECORDS BY APPOINTMENT ERROR]", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

// Upload patient medical report
exports.uploadPatientReport = async (req, res) => {
  try {
    const { title, description, appointmentId, uploadedBy } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!title || !appointmentId) {
      return res
        .status(400)
        .json({ error: "Title and appointment ID are required" });
    }

    // Get patient info from token (auth middleware sets req.userId, req.userEmail)
    const userId = req.userId;
    const userEmail = req.userEmail;

    if (!userId || !userEmail) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find or create patient record for this appointment
    let patientRecord = await PatientRecord.findOne({
      appointmentId: appointmentId,
    });

    const uploadData = {
      title: title,
      description: description || "",
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      fileUrl: `/uploads/patient-records/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: uploadedBy || "patient",
      uploadedAt: new Date(),
    };

    if (patientRecord) {
      // Add to existing record
      patientRecord.patientUploads.push(uploadData);
      await patientRecord.save();
    } else {
      // Get appointment details
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Create new patient record
      patientRecord = new PatientRecord({
        patientName: appointment.patientName || userEmail,
        patientEmail: appointment.patientEmail || userEmail,
        phone: appointment.phone || "",
        visitDate: appointment.date,
        doctorName: appointment.doctor || appointment.doctorName,
        appointmentId: appointmentId,
        createdBy: userId,
        patientUploads: [uploadData],
      });
      await patientRecord.save();
    }

    res.json({
      success: true,
      message: "Report uploaded successfully",
      upload: uploadData,
    });
  } catch (error) {
    console.error("[UPLOAD PATIENT REPORT ERROR]", error);
    res.status(500).json({ error: "Failed to upload report" });
  }
};
