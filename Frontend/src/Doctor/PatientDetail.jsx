import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch, getApiBase, getAuthToken } from "../utils/api";
import { FiArrowLeft, FiFileText, FiImage, FiDownload } from "react-icons/fi";

const Container = styled.div`
  padding: 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.85rem;
    width: 100%;
    justify-content: center;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateX(-4px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  }

  svg {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(-3px);
  }
`;

const Title = styled.h1`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2rem;
  margin: 0;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${(props) =>
    props.bg || "linear-gradient(135deg, #4f46e5, #7e22ce)"};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 10px;
  font-size: 0.95rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.85rem;
    margin-left: 0;
    width: 100%;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow:
    0 20px 60px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 16px;
  }

  h2 {
    @media (max-width: 768px) {
      font-size: 1.25rem !important;
    }
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 16px 12px;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.color || "#1f2937"};

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 8px;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 6px;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-top: 4px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.active ? "#667eea" : "transparent")};
  color: ${(props) => (props.active ? "#667eea" : "rgba(255, 255, 255, 0.7)")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    color: #667eea;
    transform: translateY(-2px);
  }
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecordCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-left: 6px solid ${(props) => props.$borderColor || "#667eea"};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    border-left-width: 4px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.3);

    @media (max-width: 768px) {
      transform: translateY(-2px);
    }
  }
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const RecordTitle = styled.h3`
  color: #1f2937;
  margin: 0;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const RecordDate = styled.div`
  color: #6b7280;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const RecordContent = styled.div`
  color: #374151;
  line-height: 1.6;
  margin-top: 12px;

  p {
    margin: 8px 0;
    word-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin: 6px 0;
    }

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }

  strong {
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

const AttachmentsSection = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    margin-top: 12px;
    padding-top: 10px;
  }
`;

const AttachmentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const AttachmentItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  svg {
    flex-shrink: 0;
    color: #3b82f6;
  }

  @media (max-width: 480px) {
    padding: 8px;
    gap: 8px;
    font-size: 0.85rem;
  }
`;

const AttachmentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AttachmentName = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const AttachmentSize = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;

  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${(props) => props.bg || "#e5e7eb"};
  color: ${(props) => props.color || "#374151"};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-left: 8px;

  @media (max-width: 768px) {
    padding: 8px 12px;
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
    font-size: 0.8rem;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  overflow-y: auto;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 0 0 20px 20px;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideDown 0.3s ease;
  position: relative;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 0 0 16px 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 0 0 12px 12px;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  h2 {
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }

    @media (max-width: 480px) {
      font-size: 1.25rem;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;

  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #374151;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;

  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 80px;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed #667eea;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  background: rgba(102, 126, 234, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: #764ba2;
  }

  input[type="file"] {
    display: none;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  color: #6b7280;
  margin: 0.5rem 0;
  font-size: 0.95rem;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-top: 12px;
`;

const RemoveFileButton = styled.button`
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    background: #dc2626;
  }
`;

const PatientDetail = ({ identifier, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeTab = "all";
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    complaints: "",
    diagnosis: "",
    prescription: "",
    bloodPressure: "",
    temperature: "",
    followUpDate: "",
    followUpNotes: "",
    files: [],
    labTests: "",
  });
  const [orderedLabTests, setOrderedLabTests] = useState([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: "",
    medicines: [],
    generalInstructions: "",
    dietaryAdvice: "",
    followUpDate: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [referralData, setReferralData] = useState({
    referredDoctorId: "",
    reason: "",
    notes: "",
    urgency: "routine",
    patientHistory: "",
    diagnosis: "",
    currentMedications: "",
  });

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Helper function to get file icon
  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) {
      return <FiImage size={20} />;
    }
    return <FiFileText size={20} />;
  };

  useEffect(() => {
    console.log("[PATIENT DETAIL] Identifier prop:", identifier);
    if (identifier) {
      fetchPatientData();
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  const fetchDoctors = async () => {
    try {
      const data = await jsonFetch("/api/doctors");
      // Filter out current doctor
      const currentUserId =
        window.__APP_USER__?._id || localStorage.getItem("userId");
      const otherDoctors = (data.doctors || []).filter(
        (doc) => doc._id !== currentUserId,
      );
      setDoctors(otherDoctors);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      console.log("[PATIENT DETAIL] Fetching data for identifier:", identifier);
      const doctorName =
        window.__APP_USER__?.name ||
        localStorage.getItem("userName") ||
        "Dr. Unknown";
      console.log("[PATIENT DETAIL] Doctor Name:", doctorName);
      const [recordsData, summaryData] = await Promise.all([
        jsonFetch(
          `/api/patient-records/patients/${identifier}/records?doctorName=${encodeURIComponent(doctorName)}`,
        ),
        jsonFetch(`/api/patient-records/patients/${identifier}/summary`).catch(
          () => null,
        ),
      ]);

      setRecords(recordsData.records || []);
      setAppointments(recordsData.appointments || []);

      console.log(
        "[PATIENT DETAIL] Records count:",
        recordsData.records?.length || 0,
      );
      console.log(
        "[PATIENT DETAIL] Appointments count:",
        recordsData.appointments?.length || 0,
      );
      console.log(
        "[PATIENT DETAIL] Total visits from API:",
        recordsData.totalVisits,
      );

      // Try to set patient from summary first
      if (summaryData && summaryData.patient) {
        setPatient(summaryData.patient);
      }
      // Then try from existing records
      else if (recordsData.records && recordsData.records.length > 0) {
        const firstRecord = recordsData.records[0];
        setPatient({
          name: firstRecord.patientName,
          email: firstRecord.patientEmail,
          phone: firstRecord.phone,
          cnic: firstRecord.cnic,
        });
      }
      // Finally try from appointments
      else if (
        recordsData.appointments &&
        recordsData.appointments.length > 0
      ) {
        const firstAppt = recordsData.appointments[0];
        setPatient({
          name: firstAppt.patientName,
          email: firstAppt.patientEmail,
          phone: firstAppt.phone,
          cnic: firstAppt.cnic,
        });
      }
      // If all else fails, use the identifier
      else {
        setPatient({
          name: "Unknown Patient",
          email: identifier.includes("@") ? identifier : "",
          phone:
            !identifier.includes("@") && !isNaN(identifier) ? identifier : "",
          cnic:
            !identifier.includes("@") && identifier.length > 10
              ? identifier
              : "",
        });
      }
    } catch (error) {
      toast.error("Failed to load patient data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    try {
      const doctorName =
        window.__APP_USER__?.name ||
        localStorage.getItem("userName") ||
        "Dr. Unknown";

      // Create FormData for multipart upload
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("patientName", patient?.name);
      formDataToSend.append("patientEmail", patient?.email);
      formDataToSend.append("phone", patient?.phone);
      formDataToSend.append("doctorName", doctorName);
      formDataToSend.append("complaints", formData.complaints);
      formDataToSend.append("diagnosis", formData.diagnosis);
      formDataToSend.append("bloodPressure", formData.bloodPressure);
      formDataToSend.append("temperature", formData.temperature);
      formDataToSend.append("prescription", formData.prescription);
      formDataToSend.append("followUpDate", formData.followUpDate);
      formDataToSend.append("followUpNotes", formData.followUpNotes);

      // Add all files
      formData.files.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const apiBase = getApiBase();
      const token = getAuthToken();

      let response;
      if (editingRecord) {
        response = await fetch(
          `${apiBase}/api/patient-records/records/${editingRecord._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
          },
        );
      } else {
        response = await fetch(`${apiBase}/api/patient-records/records`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save record");
      }

      toast.success(
        editingRecord
          ? "Record updated successfully"
          : "Record created successfully",
      );

      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        complaints: "",
        diagnosis: "",
        prescription: "",
        bloodPressure: "",
        temperature: "",
        followUpDate: "",
        followUpNotes: "",
        files: [],
        labTests: "",
      });
      setOrderedLabTests([]);
      fetchPatientData();
    } catch (error) {
      toast.error("Failed to save record");
      console.error(error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await jsonFetch(`/api/patient-records/records/${recordId}`, {
        method: "DELETE",
      });
      toast.success("Record deleted successfully");
      fetchPatientData();
    } catch (error) {
      toast.error("Failed to delete record");
      console.error(error);
    }
  };

  const handleReferPatient = async () => {
    try {
      if (!referralData.referredDoctorId) {
        toast.error("Please select a doctor");
        return;
      }
      if (!referralData.reason) {
        toast.error("Please provide a reason for referral");
        return;
      }

      const response = await jsonFetch("/api/referrals", {
        method: "POST",
        body: JSON.stringify({
          patientId: patient._id || null,
          patientName: patient.name,
          patientEmail: patient.email,
          patientPhone: patient.phone,
          ...referralData,
        }),
      });

      if (response.ok) {
        toast.success(
          "Patient referred successfully! Emails sent to patient and doctor.",
        );
        setShowReferralModal(false);
        setReferralData({
          referredDoctorId: "",
          reason: "",
          notes: "",
          urgency: "routine",
          patientHistory: "",
          diagnosis: "",
          currentMedications: "",
        });
      }
    } catch (error) {
      toast.error("Failed to create referral");
      console.error(error);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData({
      complaints: record.complaints || "",
      diagnosis: record.diagnosis || "",
      prescription: record.prescription || "",
      bloodPressure: record.bloodPressure || "",
      temperature: record.temperature || "",
      followUpDate: record.followUpDate
        ? new Date(record.followUpDate).toISOString().split("T")[0]
        : "",
      followUpNotes: record.followUpNotes || "",
      files: [],
      labTests: "",
    });
    setOrderedLabTests([]);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const allowedTypes = [
      // Images
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];

    for (const file of selectedFiles) {
      if (allowedTypes.includes(file.type)) {
        if (file.size <= 10 * 1024 * 1024) {
          // 10MB limit
          validFiles.push(file);
        } else {
          toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        }
      } else {
        toast.error(`${file.name} has an unsupported file type.`);
      }
    }

    setFormData({ ...formData, files: [...formData.files, ...validFiles] });
  };

  const handleRemoveFile = (index) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData({ ...formData, files: newFiles });
  };

  const handleOrderLabTest = async () => {
    if (!formData.labTests.trim()) {
      toast.error("Please enter a test name");
      return;
    }

    try {
      const doctorName =
        window.__APP_USER__?.name ||
        localStorage.getItem("userName") ||
        "Dr. Unknown";
      const doctorId =
        window.__APP_USER__?._id || localStorage.getItem("userId") || null;

      const response = await fetch("/api/lab/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          patientName: patient?.name || "Unknown Patient",
          patientEmail: patient?.email || "",
          phone: patient?.phone || "",
          cnic: patient?.cnic || "",
          gender: patient?.gender || "",
          doctor: doctorId,
          doctorName: doctorName,
          testName: formData.labTests.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Lab test "${formData.labTests}" ordered successfully!`);
        setOrderedLabTests([...orderedLabTests, formData.labTests.trim()]);
        setFormData({ ...formData, labTests: "" });
      } else {
        toast.error(data.message || "Failed to order lab test");
      }
    } catch (error) {
      console.error("Error ordering lab test:", error);
      toast.error("Failed to order lab test");
    }
  };

  const renderFormFields = () => {
    return (
      <>
        <FormGroup>
          <Label>Chief Complaints</Label>
          <TextArea
            value={formData.complaints}
            onChange={(e) =>
              setFormData({ ...formData, complaints: e.target.value })
            }
            placeholder="Patient's main complaints..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Diagnosis</Label>
          <TextArea
            value={formData.diagnosis}
            onChange={(e) =>
              setFormData({ ...formData, diagnosis: e.target.value })
            }
            placeholder="Medical diagnosis..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Prescription</Label>
          <TextArea
            value={formData.prescription}
            onChange={(e) =>
              setFormData({ ...formData, prescription: e.target.value })
            }
            placeholder="Prescribed medications and instructions..."
          />
        </FormGroup>

        <h3 style={{ color: "#667eea", marginTop: "1.5rem" }}>Vital Signs</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <FormGroup>
            <Label>Blood Pressure</Label>
            <Input
              type="text"
              value={formData.bloodPressure}
              onChange={(e) =>
                setFormData({ ...formData, bloodPressure: e.target.value })
              }
              placeholder="120/80"
            />
          </FormGroup>

          <FormGroup>
            <Label>Temperature</Label>
            <Input
              type="text"
              value={formData.temperature}
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.target.value })
              }
              placeholder="98.6°F"
            />
          </FormGroup>
        </div>

        <h3 style={{ color: "#667eea", marginTop: "1.5rem" }}>Follow-up</h3>
        <FormGroup>
          <Label>Follow-up Date</Label>
          <Input
            type="date"
            value={formData.followUpDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) =>
              setFormData({ ...formData, followUpDate: e.target.value })
            }
            title="Follow-up date must be a future date"
          />
        </FormGroup>

        <FormGroup>
          <Label>Follow-up Notes</Label>
          <TextArea
            value={formData.followUpNotes}
            onChange={(e) =>
              setFormData({ ...formData, followUpNotes: e.target.value })
            }
            placeholder="Instructions for next visit..."
          />
        </FormGroup>

        <h3 style={{ color: "#667eea", marginTop: "1.5rem" }}>🧪 Lab Tests</h3>
        <FormGroup>
          <Label>Order Lab Test</Label>
          <div
            style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
          >
            <Input
              type="text"
              value={formData.labTests}
              onChange={(e) =>
                setFormData({ ...formData, labTests: e.target.value })
              }
              placeholder="Enter test name (e.g., CBC, Blood Sugar, X-Ray...)"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleOrderLabTest();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleOrderLabTest}
              style={{ minWidth: "120px", whiteSpace: "nowrap" }}
            >
              Send to Lab
            </Button>
          </div>
          {orderedLabTests.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <p
                style={{
                  color: "#10b981",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                ✅ Ordered Tests ({orderedLabTests.length}):
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {orderedLabTests.map((test, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#d1fae5",
                      color: "#065f46",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    🧪 {test}
                  </span>
                ))}
              </div>
            </div>
          )}
        </FormGroup>

        <h3 style={{ color: "#667eea", marginTop: "1.5rem" }}>
          📎 Attachments (Optional)
        </h3>
        <FormGroup>
          <Label>Upload Images or Documents</Label>
          <FileUploadArea
            onClick={() => document.getElementById("file-upload").click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={handleFileChange}
            />
            <UploadIcon>📁</UploadIcon>
            <UploadText>
              <strong>Click to upload</strong> or drag and drop
            </UploadText>
            <UploadText style={{ fontSize: "0.85rem" }}>
              Images: PNG, JPEG, JPG, GIF, WEBP, SVG
            </UploadText>
            <UploadText style={{ fontSize: "0.85rem" }}>
              Documents: PDF, Word, Excel, TXT, CSV (MAX. 10MB each)
            </UploadText>
          </FileUploadArea>
          {formData.files.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  color: "#667eea",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                📌 {formData.files.length} file
                {formData.files.length > 1 ? "s" : ""} selected (original names
                preserved)
              </p>
              {formData.files.map((file, index) => (
                <FilePreview key={index}>
                  <span style={{ flex: 1, wordBreak: "break-word" }}>
                    {file.type.startsWith("image/") ? "🖼️" : "📄"}{" "}
                    <strong>{file.name}</strong>{" "}
                    <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </span>
                  <RemoveFileButton onClick={() => handleRemoveFile(index)}>
                    Remove
                  </RemoveFileButton>
                </FilePreview>
              ))}
            </div>
          )}
        </FormGroup>
      </>
    );
  };

  const filteredRecords = () => {
    if (activeTab === "all") return records;
    return records.filter((record) => record.recordType === activeTab);
  };

  if (loading) {
    return (
      <Container>
        <Title style={{ color: "white" }}>Loading patient data...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <BackButton
            onClick={
              onBack ||
              (() => {
                window.location.href = "#/doctor/panel";
              })
            }
          >
            <FiArrowLeft />
            Back to Patients
          </BackButton>
          <div>
            <Title>{patient?.name || "Patient Details"}</Title>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                marginTop: "4px",
                fontSize: "0.95rem",
              }}
            >
              {patient?.email && `${patient.email} | `}
              {patient?.phone}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button
            onClick={() => {
              setEditingRecord(null);
              setOrderedLabTests([]);
              setShowModal(true);
            }}
          >
            + Add New Record
          </Button>
          <Button
            onClick={() => setShowReferralModal(true)}
            bg="linear-gradient(135deg, #10b981, #059669)"
          >
            👨‍⚕️ Refer to Specialist
          </Button>
          <Button
            onClick={() => {
              setPrescriptionData({
                diagnosis: "",
                medicines: [],
                generalInstructions: "",
                dietaryAdvice: "",
                followUpDate: "",
              });
              setShowPrescriptionModal(true);
            }}
            bg="linear-gradient(135deg, #f59e0b, #d97706)"
          >
            💊 Create Prescription
          </Button>
        </div>
      </Header>

      <SummaryCard>
        <h2
          style={{
            margin: "0 0 16px 0",
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "700",
          }}
        >
          Patient Summary
        </h2>
        <SummaryGrid>
          <StatBox>
            <StatValue color="#667eea">{records.length}</StatValue>
            <StatLabel>Total Records</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue color="#10b981">{appointments.length}</StatValue>
            <StatLabel>Total Appointments</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue color="#764ba2">
              {records.filter((r) => r.followUpDate).length}
            </StatValue>
            <StatLabel>Follow-ups Scheduled</StatLabel>
          </StatBox>
        </SummaryGrid>
      </SummaryCard>

      <h3
        style={{ color: "#667eea", marginBottom: "20px", fontSize: "1.3rem" }}
      >
        Medical Records
      </h3>

      <RecordsList>
        {filteredRecords().map((record) => (
          <RecordCard key={record._id} $borderColor="#667eea">
            <RecordHeader>
              <div>
                <RecordTitle>
                  Visit on {new Date(record.visitDate).toLocaleDateString()}
                </RecordTitle>
                <RecordDate>Dr. {record.doctorName}</RecordDate>
              </div>
              <div>
                <ActionButton
                  bg="#dbeafe"
                  color="#1e40af"
                  onClick={() => handleEditRecord(record)}
                >
                  Edit
                </ActionButton>
                <ActionButton
                  bg="#fee2e2"
                  color="#dc2626"
                  onClick={() => handleDeleteRecord(record._id)}
                >
                  Delete
                </ActionButton>
              </div>
            </RecordHeader>
            <RecordContent>
              {record.complaints && (
                <p>
                  <strong>Complaints:</strong> {record.complaints}
                </p>
              )}
              {record.diagnosis && (
                <p>
                  <strong>Diagnosis:</strong> {record.diagnosis}
                </p>
              )}
              {record.prescription && (
                <p>
                  <strong>Prescription:</strong> {record.prescription}
                </p>
              )}
              {(record.bloodPressure || record.temperature) && (
                <p>
                  <strong>Vitals:</strong>
                  {record.bloodPressure && ` BP: ${record.bloodPressure}`}
                  {record.temperature && ` | Temp: ${record.temperature}`}
                </p>
              )}
              {record.followUpDate && (
                <p>
                  <strong>Follow-up:</strong>{" "}
                  {new Date(record.followUpDate).toLocaleDateString()}
                  {record.followUpNotes && ` - ${record.followUpNotes}`}
                </p>
              )}

              {/* Display Doctor's Attachments */}
              {record.attachments && record.attachments.length > 0 && (
                <AttachmentsSection>
                  <strong>
                    📎 Doctor's Attachments ({record.attachments.length}):
                  </strong>
                  <AttachmentsList>
                    {record.attachments.map((file, idx) => (
                      <AttachmentItem
                        key={idx}
                        href={`${getApiBase()}/${file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={file.originalName}
                      >
                        {getFileIcon(file.mimetype)}
                        <AttachmentInfo>
                          <AttachmentName title={file.originalName}>
                            {file.originalName}
                          </AttachmentName>
                          <AttachmentSize>
                            {formatFileSize(file.size)}
                          </AttachmentSize>
                        </AttachmentInfo>
                        <FiDownload size={16} />
                      </AttachmentItem>
                    ))}
                  </AttachmentsList>
                </AttachmentsSection>
              )}

              {/* Display Patient's Uploads */}
              {record.patientUploads && record.patientUploads.length > 0 && (
                <AttachmentsSection
                  style={{
                    marginTop: "1rem",
                    background: "#dbeafe",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <strong style={{ color: "#1e40af" }}>
                    � Patient & Lab Reports ({record.patientUploads.length}
                    ):
                  </strong>
                  <AttachmentsList>
                    {record.patientUploads.map((upload, idx) => {
                      const isLabUpload = upload.uploadedBy === "lab";
                      const uploaderLabel =
                        upload.uploadedBy === "lab"
                          ? "Lab"
                          : upload.uploadedBy === "doctor"
                            ? "Doctor"
                            : "Patient";
                      const uploaderIcon =
                        upload.uploadedBy === "lab"
                          ? "🧪"
                          : upload.uploadedBy === "doctor"
                            ? "👨‍⚕️"
                            : "👤";

                      return (
                        <AttachmentItem
                          key={idx}
                          href={
                            upload.fileUrl || `${getApiBase()}/${upload.path}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          download={upload.originalName}
                          style={{
                            background: isLabUpload ? "#ecfdf5" : "#f0f9ff",
                            border: isLabUpload
                              ? "2px solid #10b981"
                              : "2px solid #3b82f6",
                          }}
                        >
                          {getFileIcon(upload.mimetype)}
                          <AttachmentInfo>
                            <AttachmentName
                              title={upload.title || upload.originalName}
                            >
                              {upload.title || upload.originalName}
                            </AttachmentName>
                            {upload.description && (
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6b7280",
                                  marginTop: "0.25rem",
                                }}
                              >
                                {upload.description}
                              </div>
                            )}
                            <AttachmentSize>
                              {formatFileSize(upload.size)} • {uploaderIcon}{" "}
                              Uploaded by {uploaderLabel} on{" "}
                              {new Date(upload.uploadedAt).toLocaleDateString()}
                            </AttachmentSize>
                          </AttachmentInfo>
                          <FiDownload size={16} />
                        </AttachmentItem>
                      );
                    })}
                  </AttachmentsList>
                </AttachmentsSection>
              )}
            </RecordContent>
          </RecordCard>
        ))}
      </RecordsList>

      {filteredRecords().length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "1.1rem",
          }}
        >
          No records found. Click "Add New Record" to create one.
        </div>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                marginTop: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {editingRecord ? "Edit Patient Record" : "New Patient Record"}
            </h2>

            {renderFormFields()}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <Button onClick={handleSaveRecord}>
                {editingRecord ? "Update Record" : "Save Record"}
              </Button>
              <Button bg="#6b7280" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {showReferralModal && (
        <Modal onClick={() => setShowReferralModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                marginTop: 0,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              👨‍⚕️ Refer Patient to Specialist
            </h2>

            <FormGroup>
              <Label>Select Specialist Doctor *</Label>
              <select
                value={referralData.referredDoctorId}
                onChange={(e) =>
                  setReferralData({
                    ...referralData,
                    referredDoctorId: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  background: "white",
                }}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.name} {doc.department ? `(${doc.department})` : ""}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup>
              <Label>Urgency Level *</Label>
              <select
                value={referralData.urgency}
                onChange={(e) =>
                  setReferralData({ ...referralData, urgency: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  background: "white",
                }}
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </FormGroup>

            <FormGroup>
              <Label>Reason for Referral *</Label>
              <textarea
                value={referralData.reason}
                onChange={(e) =>
                  setReferralData({ ...referralData, reason: e.target.value })
                }
                placeholder="Why are you referring this patient?"
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Additional Notes</Label>
              <textarea
                value={referralData.notes}
                onChange={(e) =>
                  setReferralData({ ...referralData, notes: e.target.value })
                }
                placeholder="Any additional information for the specialist"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Patient History (Optional)</Label>
              <textarea
                value={referralData.patientHistory}
                onChange={(e) =>
                  setReferralData({
                    ...referralData,
                    patientHistory: e.target.value,
                  })
                }
                placeholder="Relevant medical history"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Current Diagnosis (Optional)</Label>
              <textarea
                value={referralData.diagnosis}
                onChange={(e) =>
                  setReferralData({
                    ...referralData,
                    diagnosis: e.target.value,
                  })
                }
                placeholder="Current diagnosis"
                rows={2}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Current Medications (Optional)</Label>
              <textarea
                value={referralData.currentMedications}
                onChange={(e) =>
                  setReferralData({
                    ...referralData,
                    currentMedications: e.target.value,
                  })
                }
                placeholder="List current medications"
                rows={2}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </FormGroup>

            <div
              style={{
                background: "#dbeafe",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "20px",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: "600",
                  color: "#1e40af",
                }}
              >
                ℹ️ What happens next:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#1e40af" }}>
                <li>
                  Patient will receive an email to book appointment with the
                  specialist
                </li>
                <li>
                  Specialist doctor will receive all patient details via email
                </li>
                <li>
                  Specialist can view this referral in their doctor portal
                </li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <Button onClick={handleReferPatient}>Send Referral</Button>
              <Button bg="#6b7280" onClick={() => setShowReferralModal(false)}>
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <Modal onClick={() => setShowPrescriptionModal(false)}>
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <ModalHeader>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                💊 Create Prescription
              </h2>
              <CloseButton onClick={() => setShowPrescriptionModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Patient: <strong>{patient?.name || patient?.patientName}</strong>
            </p>

            <FormGroup>
              <Label>Diagnosis *</Label>
              <TextArea
                value={prescriptionData.diagnosis}
                onChange={(e) =>
                  setPrescriptionData({
                    ...prescriptionData,
                    diagnosis: e.target.value,
                  })
                }
                placeholder="Primary diagnosis for this prescription..."
                rows={3}
                required
              />
            </FormGroup>

            <div
              style={{
                background: "#f0f9ff",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "1.1rem",
                  color: "#1e40af",
                }}
              >
                Medicines
              </h3>

              <Button
                onClick={async () => {
                  if (!medicines || medicines.length === 0) {
                    try {
                      const res = await jsonFetch("/api/pharmacy/medicines");
                      setMedicines(res.medicines || []);
                    } catch (err) {
                      console.error("Failed to load medicines:", err);
                    }
                  }
                  setPrescriptionData({
                    ...prescriptionData,
                    medicines: [
                      ...prescriptionData.medicines,
                      {
                        medicine: "",
                        medicineName: "",
                        dosage: "",
                        frequency: "",
                        duration: "",
                        instructions: "",
                        quantity: 1,
                      },
                    ],
                  });
                }}
                style={{ marginBottom: "16px" }}
              >
                + Add Medicine
              </Button>

              {prescriptionData.medicines.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <strong style={{ color: "#1f2937" }}>
                      Medicine {idx + 1}
                    </strong>
                    <button
                      onClick={() =>
                        setPrescriptionData({
                          ...prescriptionData,
                          medicines: prescriptionData.medicines.filter(
                            (_, i) => i !== idx,
                          ),
                        })
                      }
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <FormGroup style={{ marginBottom: "12px" }}>
                    <Label>Medicine Name *</Label>
                    <select
                      value={med.medicine}
                      onChange={(e) => {
                        const selectedMed = medicines.find(
                          (m) => m._id === e.target.value,
                        );
                        const newMeds = [...prescriptionData.medicines];
                        newMeds[idx] = {
                          ...newMeds[idx],
                          medicine: e.target.value,
                          medicineName: selectedMed?.name || "",
                          dosage: selectedMed?.strength || "",
                        };
                        setPrescriptionData({
                          ...prescriptionData,
                          medicines: newMeds,
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "0.95rem",
                      }}
                      required
                    >
                      <option value="">-- Select Medicine --</option>
                      {medicines.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} - {m.strength} ({m.form})
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <FormGroup>
                      <Label>Dosage</Label>
                      <Input
                        value={med.dosage}
                        onChange={(e) => {
                          const newMeds = [...prescriptionData.medicines];
                          newMeds[idx].dosage = e.target.value;
                          setPrescriptionData({
                            ...prescriptionData,
                            medicines: newMeds,
                          });
                        }}
                        placeholder="e.g., 500mg"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={med.quantity}
                        onChange={(e) => {
                          const newMeds = [...prescriptionData.medicines];
                          newMeds[idx].quantity = parseInt(e.target.value) || 1;
                          setPrescriptionData({
                            ...prescriptionData,
                            medicines: newMeds,
                          });
                        }}
                        min="1"
                      />
                    </FormGroup>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <FormGroup>
                      <Label>Frequency *</Label>
                      <select
                        value={med.frequency}
                        onChange={(e) => {
                          const newMeds = [...prescriptionData.medicines];
                          newMeds[idx].frequency = e.target.value;
                          setPrescriptionData({
                            ...prescriptionData,
                            medicines: newMeds,
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "0.95rem",
                        }}
                        required
                      >
                        <option value="">-- Select Frequency --</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">
                          Three times daily
                        </option>
                        <option value="Four times daily">
                          Four times daily
                        </option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="Before bed">Before bed</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </FormGroup>

                    <FormGroup>
                      <Label>Duration *</Label>
                      <select
                        value={med.duration}
                        onChange={(e) => {
                          const newMeds = [...prescriptionData.medicines];
                          newMeds[idx].duration = e.target.value;
                          setPrescriptionData({
                            ...prescriptionData,
                            medicines: newMeds,
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "0.95rem",
                        }}
                        required
                      >
                        <option value="">-- Select Duration --</option>
                        <option value="3 days">3 days</option>
                        <option value="5 days">5 days</option>
                        <option value="7 days">7 days</option>
                        <option value="10 days">10 days</option>
                        <option value="14 days">14 days</option>
                        <option value="1 month">1 month</option>
                        <option value="2 months">2 months</option>
                        <option value="3 months">3 months</option>
                        <option value="Continuous">Continuous</option>
                      </select>
                    </FormGroup>
                  </div>

                  <FormGroup>
                    <Label>Instructions</Label>
                    <Input
                      value={med.instructions}
                      onChange={(e) => {
                        const newMeds = [...prescriptionData.medicines];
                        newMeds[idx].instructions = e.target.value;
                        setPrescriptionData({
                          ...prescriptionData,
                          medicines: newMeds,
                        });
                      }}
                      placeholder="e.g., Take after meals, Avoid alcohol"
                    />
                  </FormGroup>
                </div>
              ))}

              {prescriptionData.medicines.length === 0 && (
                <p style={{ color: "#6b7280", textAlign: "center" }}>
                  No medicines added yet. Click "Add Medicine" to start.
                </p>
              )}
            </div>

            <FormGroup>
              <Label>General Instructions</Label>
              <TextArea
                value={prescriptionData.generalInstructions}
                onChange={(e) =>
                  setPrescriptionData({
                    ...prescriptionData,
                    generalInstructions: e.target.value,
                  })
                }
                placeholder="e.g., Get adequate rest, Drink plenty of water..."
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Dietary Advice</Label>
              <TextArea
                value={prescriptionData.dietaryAdvice}
                onChange={(e) =>
                  setPrescriptionData({
                    ...prescriptionData,
                    dietaryAdvice: e.target.value,
                  })
                }
                placeholder="e.g., Avoid spicy food, Increase protein intake..."
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Follow-up Date</Label>
              <Input
                type="date"
                value={prescriptionData.followUpDate}
                onChange={(e) =>
                  setPrescriptionData({
                    ...prescriptionData,
                    followUpDate: e.target.value,
                  })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </FormGroup>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <Button
                onClick={async () => {
                  if (!prescriptionData.diagnosis) {
                    toast.error("Please enter diagnosis");
                    return;
                  }
                  if (prescriptionData.medicines.length === 0) {
                    toast.error("Please add at least one medicine");
                    return;
                  }

                  // Validate all medicines
                  for (let med of prescriptionData.medicines) {
                    if (!med.medicine || !med.frequency || !med.duration) {
                      toast.error(
                        "Please fill all required fields for medicines",
                      );
                      return;
                    }
                  }

                  try {
                    const doctorName =
                      window.__APP_USER__?.name ||
                      localStorage.getItem("userName") ||
                      "Doctor";
                    const doctorEmail =
                      window.__APP_USER__?.email ||
                      localStorage.getItem("userEmail");

                    const res = await jsonFetch("/api/prescriptions", {
                      method: "POST",
                      body: JSON.stringify({
                        patientName:
                          patient?.name || patient?.patientName || identifier,
                        patientEmail: patient?.email || patient?.patientEmail,
                        patientPhone: patient?.phone || patient?.patientPhone,
                        doctorName,
                        doctorEmail,
                        ...prescriptionData,
                      }),
                    });

                    if (res.warnings && res.warnings.length > 0) {
                      toast.warning(
                        `Prescription created with warnings:\n${res.warnings.join("\n")}`,
                        { autoClose: 8000 },
                      );
                    } else {
                      toast.success(
                        "Prescription created and sent to patient!",
                      );
                    }

                    setShowPrescriptionModal(false);
                    setPrescriptionData({
                      diagnosis: "",
                      medicines: [],
                      generalInstructions: "",
                      dietaryAdvice: "",
                      followUpDate: "",
                    });
                  } catch (err) {
                    console.error("Failed to create prescription:", err);
                    toast.error(err.message || "Failed to create prescription");
                  }
                }}
              >
                Create Prescription
              </Button>
              <Button
                bg="#6b7280"
                onClick={() => setShowPrescriptionModal(false)}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PatientDetail;
