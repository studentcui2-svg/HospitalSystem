import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaUserMd,
  FaStethoscope,
  FaFileUpload,
  FaEye,
  FaDownload,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFileMedical,
  FaFileAlt,
  FaImage,
  FaFilePdf,
  FaQrcode,
  FaPrescriptionBottleAlt,
} from "react-icons/fa";

const Container = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
    margin: 1rem auto;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: 1024px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

const Thead = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
`;

const Tbody = styled.tbody`
  tr:nth-child(even) {
    background: #f9fafb;
  }

  tr:hover {
    background: #f3f4f6;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
`;

const DoctorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DoctorName = styled.div`
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
`;

const DoctorDept = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DateTimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DateTime = styled.div`
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
`;

const Duration = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${(props) => props.$bg || "#e5e7eb"};
  color: ${(props) => props.$color || "#374151"};
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${(props) => props.$bg || "#667eea"};
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$bg || "#667eea"};
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    border-radius: 0;
  }
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.25rem;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const RecordSection = styled.div`
  background: white;
  border: 2px solid ${(props) => props.$borderColor || "#e5e7eb"};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
    border-width: 1.5px;
  }
`;

const SummaryBar = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .text {
    display: flex;
    flex-direction: column;

    .label {
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${(props) => props.$borderColor || "#e5e7eb"};

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    flex-wrap: wrap;
  }
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$bg || "#f3f4f6"};
  color: ${(props) => props.$color || "#374151"};
  font-size: 1.25rem;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
`;

const SectionTitle = styled.h4`
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const RecordCount = styled.span`
  background: ${(props) => props.$bg || "#e5e7eb"};
  color: ${(props) => props.$color || "#374151"};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }
`;

const RecordItem = styled.div`
  padding: 1.25rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: start;
  transition: all 0.3s;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const RecordInfo = styled.div`
  flex: 1;
`;

const RecordTitle = styled.div`
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    word-break: break-word;
  }
`;

const RecordMeta = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const RecordActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const UploadForm = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed #667eea;
  border-radius: 8px;
  cursor: pointer;
  background: #f0f4ff;
  color: #667eea;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: #e0e7ff;
    border-color: #4f46e5;
  }

  input {
    display: none;
  }
`;

const UploaderBadge = styled.div`
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => (props.$isDoctor ? "#dcfce7" : "#dbeafe")};
  color: ${(props) => (props.$isDoctor ? "#166534" : "#1e40af")};
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;

  h3 {
    margin: 1rem 0 0.5rem;
    color: #374151;
    font-size: 1.25rem;
  }

  p {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
  }
`;

const MedicalRecordCard = styled.div`
  background: #f9fafb;
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #10b981;

  h4 {
    margin: 0;
    color: #10b981;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .date {
    color: #6b7280;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    h4 {
      font-size: 1rem;
    }

    .date {
      font-size: 0.8rem;
    }
  }
`;

const MedicalDetailSection = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
  }
`;

const DetailLabel = styled.div`
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const DetailValue = styled.div`
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.6;
  padding-left: 1.75rem;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding-left: 1rem;
    line-height: 1.5;
  }
`;

const VitalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding-left: 1.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding-left: 1rem;
    gap: 0.75rem;
  }
`;

const PrescriptionSection = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }

  h3 {
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.3rem;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const PrescriptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const PrescriptionCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;

    &:hover {
      transform: translateY(-2px);
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const QRModalContent = styled.div`
  text-align: center;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
`;

const QRHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  color: white;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;

    @media (max-width: 768px) {
      font-size: 1.15rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }

  p {
    margin: 0.25rem 0;
    opacity: 0.9;

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 3px solid #667eea;
  display: inline-block;
  margin-bottom: 1rem;

  img {
    width: 200px;
    height: 200px;
    display: block;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;

    img {
      width: 180px;
      height: 180px;
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;

    img {
      width: 150px;
      height: 150px;
    }
  }
`;

const MedicineList = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 8px;
  border: 2px solid #10b981;
  text-align: left;

  h4 {
    margin: 0 0 0.75rem 0;
    color: #065f46;

    @media (max-width: 768px) {
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-top: 1rem;
  }
`;

const MedicineItem = styled.div`
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  span {
    color: #6b7280;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    padding: 0.45rem;
    font-size: 0.875rem;

    span {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.4rem;
    font-size: 0.85rem;

    span {
      font-size: 0.75rem;
    }
  }
`;

const VitalItem = styled.div`
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  .label {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
  }

  @media (max-width: 768px) {
    padding: 0.6rem;

    .label {
      font-size: 0.75rem;
    }

    .value {
      font-size: 1rem;
    }
  }
`;

const PatientAppointmentsTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [fullMedicalRecords, setFullMedicalRecords] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showPrescriptionQR, setShowPrescriptionQR] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    loadAppointments();
    loadPrescriptions();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await jsonFetch("/api/appointments");
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error("Failed to load appointments", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        console.log("[Prescriptions] No user email found");
        return;
      }

      console.log("[Prescriptions] Loading for email:", userEmail);
      const res = await jsonFetch(`/api/prescriptions/patient/${userEmail}`);
      console.log(
        "[Prescriptions] Loaded:",
        res.prescriptions?.length || 0,
        "prescriptions",
      );
      console.log("[Prescriptions] Data:", res.prescriptions);
      setPrescriptions(res.prescriptions || []);
    } catch (err) {
      console.error("Failed to load prescriptions", err);
      toast.error("Could not load prescriptions");
    }
  };

  const loadPatientRecords = async (appointmentId) => {
    try {
      const res = await jsonFetch(
        `/api/patient-records/appointment/${appointmentId}`,
      );
      setPatientRecords(res.fileUploads || res.records || []);
      setFullMedicalRecords(res.fullRecords || []);
    } catch (err) {
      console.error("Failed to load patient records", err);
      toast.error("Failed to load patient records");
    }
  };

  const handleViewRecords = (appointment) => {
    setSelectedAppointment(appointment);
    loadPatientRecords(appointment._id);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setPatientRecords([]);
    setFullMedicalRecords([]);
    setShowUploadForm(false);
    setUploadData({ title: "", description: "", file: null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadData.title || !uploadData.file) {
      toast.error("Please provide a title and select a file");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("file", uploadData.file);
      formData.append("appointmentId", selectedAppointment._id);
      formData.append("uploadedBy", "patient");

      const response = await fetch("/api/patient-records/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("app_token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Record uploaded successfully!");
        setUploadData({ title: "", description: "", file: null });
        setShowUploadForm(false);
        loadPatientRecords(selectedAppointment._id);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Failed to upload record");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await jsonFetch(`/api/patient-records/${recordId}`, {
        method: "DELETE",
      });
      toast.success("Record deleted successfully");
      loadPatientRecords(selectedAppointment._id);
    } catch (err) {
      console.error("Delete error", err);
      toast.error("Failed to delete record");
    }
  };

  const handleDownloadRecord = (record) => {
    const link = document.createElement("a");
    link.href = record.fileUrl || record.path;
    link.download = record.originalName || record.title || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (mimetype) => {
    if (mimetype?.includes("image")) return <FaImage />;
    if (mimetype?.includes("pdf")) return <FaFilePdf />;
    return <FaFileAlt />;
  };

  if (loading) {
    return (
      <Container>
        <Title>Loading appointments...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <FaCalendarAlt /> My Appointments & Records
      </Title>

      {/* Prescriptions Section */}
      {prescriptions.length > 0 && (
        <PrescriptionSection>
          <h3>
            <FaPrescriptionBottleAlt /> My Prescriptions ({prescriptions.length}
            )
          </h3>
          <PrescriptionGrid>
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription._id}
                onClick={() => {
                  setSelectedPrescription(prescription);
                  setShowPrescriptionQR(true);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                      Dr. {prescription.doctorName}
                    </div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <FaQrcode size={24} />
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>Diagnosis:</strong> {prescription.diagnosis}
                </div>
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                  {prescription.medicines?.length || 0} medicine(s)
                </div>
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.5rem",
                    background:
                      prescription.status === "Pending"
                        ? "rgba(251, 191, 36, 0.3)"
                        : "rgba(16, 185, 129, 0.3)",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  {prescription.status}
                </div>
              </PrescriptionCard>
            ))}
          </PrescriptionGrid>
        </PrescriptionSection>
      )}

      {appointments.length === 0 ? (
        <EmptyState>
          <FaCalendarAlt
            size={64}
            style={{ opacity: 0.3, marginBottom: "1rem" }}
          />
          <h3>No Appointments Found</h3>
          <p>You haven't booked any appointments yet.</p>
        </EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Doctor Details</Th>
                <Th>Appointment Time</Th>
                <Th>Patient Info</Th>
                <Th>Mode & Remarks</Th>
                <Th>Records</Th>
              </tr>
            </Thead>
            <Tbody>
              {appointments.map((appt) => {
                const status = (appt.status || "pending").toLowerCase();
                const isAccepted = status === "accepted";
                const isRejected = status === "rejected";
                const isOnline = appt.mode === "online";

                let statusColor = "#f59e0b";
                if (isAccepted) statusColor = "#10b981";
                if (isRejected) statusColor = "#ef4444";

                return (
                  <tr key={appt._id}>
                    <Td>
                      <DoctorInfo>
                        <DoctorName>
                          <FaStethoscope
                            style={{ display: "inline", marginRight: "0.5rem" }}
                          />
                          {appt.doctor || appt.doctorName || "Unknown Doctor"}
                        </DoctorName>
                        <DoctorDept>
                          {appt.department || "General Medicine"}
                        </DoctorDept>
                        {appt.doctorPhone && (
                          <DoctorDept>📞 {appt.doctorPhone}</DoctorDept>
                        )}
                      </DoctorInfo>
                    </Td>
                    <Td>
                      <DateTimeInfo>
                        <DateTime>
                          <FaCalendarAlt />
                          {new Date(appt.date).toLocaleDateString()}
                        </DateTime>
                        <DateTime>
                          <FaClock />
                          {new Date(appt.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </DateTime>
                        <Duration>
                          {appt.durationMinutes || 30} minutes
                        </Duration>
                      </DateTimeInfo>
                    </Td>
                    <Td>
                      <DoctorInfo>
                        <DoctorName>
                          <FaUser
                            style={{ display: "inline", marginRight: "0.5rem" }}
                          />
                          {appt.patientName || "You"}
                        </DoctorName>
                        {appt.patientEmail && (
                          <DoctorDept>📧 {appt.patientEmail}</DoctorDept>
                        )}
                        {appt.patientPhone && (
                          <DoctorDept>📱 {appt.patientPhone}</DoctorDept>
                        )}
                      </DoctorInfo>
                    </Td>
                    <Td>
                      <Badge
                        $bg={isOnline ? "#dbeafe" : "#fef3c7"}
                        $color={isOnline ? "#1e40af" : "#92400e"}
                      >
                        {isOnline ? "🌐 Online" : "🏥 In-Clinic"}
                      </Badge>
                      <br />
                      <Badge
                        $bg={statusColor + "20"}
                        $color={statusColor}
                        style={{ marginTop: "0.5rem" }}
                      >
                        {status.toUpperCase()}
                      </Badge>
                      {appt.remarks && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#6b7280",
                          }}
                        >
                          {appt.remarks}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          onClick={() => handleViewRecords(appt)}
                        >
                          <FaEye /> View Records
                        </Button>
                        {prescriptions.length > 0 &&
                          (() => {
                            // Find prescription for this appointment
                            const prescription = prescriptions.find(
                              (p) =>
                                String(p.appointment) === String(appt._id) ||
                                (p.patientEmail === appt.patientEmail &&
                                  Math.abs(
                                    new Date(p.createdAt) - new Date(appt.date),
                                  ) <
                                    7 * 24 * 60 * 60 * 1000),
                            );

                            if (prescription) {
                              console.log(
                                "[Prescription Button] Found prescription for appointment:",
                                appt._id,
                              );
                              return (
                                <Button
                                  $bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                  onClick={() => {
                                    console.log(
                                      "[Prescription] Opening modal for:",
                                      prescription,
                                    );
                                    setSelectedPrescription(prescription);
                                    setShowPrescriptionQR(true);
                                  }}
                                >
                                  <FaQrcode /> Prescription
                                </Button>
                              );
                            }
                            return null;
                          })()}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        </TableWrapper>
      )}

      {/* Patient Records Modal */}
      {selectedAppointment && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FaFileMedical />
                Patient Records
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f0f4ff",
                  borderRadius: "8px",
                }}
              >
                <strong>Appointment with:</strong>{" "}
                {selectedAppointment.doctor || selectedAppointment.doctorName}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(selectedAppointment.date).toLocaleString()}
              </div>

              {/* Summary Bar */}
              <SummaryBar>
                <SummaryItem>
                  <div className="icon">
                    <FaUserMd />
                  </div>
                  <div className="text">
                    <div className="label">Doctor's Reports</div>
                    <div className="value">
                      {
                        patientRecords.filter((r) => r.uploadedBy === "doctor")
                          .length
                      }
                    </div>
                  </div>
                </SummaryItem>
                <SummaryItem>
                  <div className="icon">
                    <FaUser />
                  </div>
                  <div className="text">
                    <div className="label">Your Uploads</div>
                    <div className="value">
                      {
                        patientRecords.filter((r) => r.uploadedBy !== "doctor")
                          .length
                      }
                    </div>
                  </div>
                </SummaryItem>
                <SummaryItem>
                  <div className="icon">
                    <FaFileMedical />
                  </div>
                  <div className="text">
                    <div className="label">Total Records</div>
                    <div className="value">{patientRecords.length}</div>
                  </div>
                </SummaryItem>
              </SummaryBar>

              {!showUploadForm && (
                <Button
                  $bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  onClick={() => setShowUploadForm(true)}
                  style={{ marginBottom: "1rem" }}
                >
                  <FaPlus /> Upload Medical Report
                </Button>
              )}

              {showUploadForm && (
                <UploadForm>
                  <h4
                    style={{
                      marginTop: 0,
                      marginBottom: "1rem",
                      color: "#1f2937",
                    }}
                  >
                    Upload New Medical Report
                  </h4>
                  <form onSubmit={handleUpload}>
                    <FormGroup>
                      <Label>Report Title *</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Blood Test Results, X-Ray Report"
                        value={uploadData.title}
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Description (Optional)</Label>
                      <TextArea
                        placeholder="Add any notes or description about this report..."
                        value={uploadData.description}
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            description: e.target.value,
                          })
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Select File *</Label>
                      <FileInputLabel>
                        <FaFileUpload size={20} />
                        {uploadData.file
                          ? uploadData.file.name
                          : "Choose File (PDF, Image, Doc)"}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileChange}
                          required
                        />
                      </FileInputLabel>
                    </FormGroup>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <Button type="submit" $bg="#10b981" disabled={uploading}>
                        <FaFileUpload />{" "}
                        {uploading ? "Uploading..." : "Upload Report"}
                      </Button>
                      <Button
                        type="button"
                        $bg="#6b7280"
                        onClick={() => {
                          setShowUploadForm(false);
                          setUploadData({
                            title: "",
                            description: "",
                            file: null,
                          });
                        }}
                      >
                        <FaTimes /> Cancel
                      </Button>
                    </div>
                  </form>
                </UploadForm>
              )}

              <RecordsList>
                {(() => {
                  const doctorFileUploads = patientRecords.filter(
                    (r) => r.uploadedBy === "doctor",
                  );
                  const patientFileUploads = patientRecords.filter(
                    (r) => r.uploadedBy !== "doctor",
                  );
                  const hasNoData =
                    patientRecords.length === 0 &&
                    fullMedicalRecords.length === 0;

                  return (
                    <>
                      {hasNoData ? (
                        <EmptyState>
                          <FaFileMedical
                            size={64}
                            style={{ opacity: 0.25, color: "#667eea" }}
                          />
                          <h3>No Medical Records Yet</h3>
                          <p>
                            Upload your medical reports or wait for your doctor
                            to add records.
                          </p>
                        </EmptyState>
                      ) : (
                        <>
                          {/* Doctor's Full Medical Records */}
                          {fullMedicalRecords.length > 0 && (
                            <RecordSection $borderColor="#10b981">
                              <SectionHeader $borderColor="#10b981">
                                <SectionIcon $bg="#d1fae5" $color="#10b981">
                                  <FaUserMd />
                                </SectionIcon>
                                <SectionTitle>
                                  Doctor's Medical Records
                                </SectionTitle>
                                <RecordCount $bg="#d1fae5" $color="#10b981">
                                  {fullMedicalRecords.length}{" "}
                                  {fullMedicalRecords.length === 1
                                    ? "Visit"
                                    : "Visits"}
                                </RecordCount>
                              </SectionHeader>

                              {fullMedicalRecords.map((record) => (
                                <MedicalRecordCard key={record._id}>
                                  <RecordHeader>
                                    <h4>
                                      🩺 Visit Record - Dr. {record.doctorName}
                                    </h4>
                                    <div className="date">
                                      {new Date(
                                        record.visitDate,
                                      ).toLocaleDateString()}
                                    </div>
                                  </RecordHeader>

                                  {record.complaints && (
                                    <MedicalDetailSection>
                                      <DetailLabel>
                                        🔴 <strong>Chief Complaints</strong>
                                      </DetailLabel>
                                      <DetailValue>
                                        {record.complaints}
                                      </DetailValue>
                                    </MedicalDetailSection>
                                  )}

                                  {record.diagnosis && (
                                    <MedicalDetailSection>
                                      <DetailLabel>
                                        ✅ <strong>Diagnosis</strong>
                                      </DetailLabel>
                                      <DetailValue>
                                        {record.diagnosis}
                                      </DetailValue>
                                    </MedicalDetailSection>
                                  )}

                                  {(record.bloodPressure ||
                                    record.temperature) && (
                                    <MedicalDetailSection>
                                      <DetailLabel>
                                        🌡️ <strong>Vital Signs</strong>
                                      </DetailLabel>
                                      <VitalsGrid>
                                        {record.bloodPressure && (
                                          <VitalItem>
                                            <div className="label">
                                              Blood Pressure
                                            </div>
                                            <div className="value">
                                              {record.bloodPressure}
                                            </div>
                                          </VitalItem>
                                        )}
                                        {record.temperature && (
                                          <VitalItem>
                                            <div className="label">
                                              Temperature
                                            </div>
                                            <div className="value">
                                              {record.temperature}
                                            </div>
                                          </VitalItem>
                                        )}
                                      </VitalsGrid>
                                    </MedicalDetailSection>
                                  )}

                                  {record.prescription && (
                                    <MedicalDetailSection>
                                      <DetailLabel>
                                        💊 <strong>Prescription</strong>
                                      </DetailLabel>
                                      <DetailValue>
                                        {record.prescription}
                                      </DetailValue>
                                    </MedicalDetailSection>
                                  )}

                                  {/* Prescription Details from Prescription System */}
                                  {(() => {
                                    // Find prescription(s) related to this visit
                                    const relatedPrescriptions =
                                      prescriptions.filter(
                                        (p) =>
                                          p.patientRecord === record._id ||
                                          (p.doctorName === record.doctorName &&
                                            new Date(
                                              p.createdAt,
                                            ).toDateString() ===
                                              new Date(
                                                record.visitDate,
                                              ).toDateString()),
                                      );

                                    if (relatedPrescriptions.length === 0)
                                      return null;

                                    return (
                                      <MedicalDetailSection>
                                        <DetailLabel>
                                          💊{" "}
                                          <strong>
                                            Detailed Prescription (
                                            {relatedPrescriptions.length})
                                          </strong>
                                        </DetailLabel>
                                        {relatedPrescriptions.map(
                                          (prescription, idx) => (
                                            <div
                                              key={prescription._id}
                                              style={{
                                                marginTop:
                                                  idx > 0 ? "1rem" : "0.5rem",
                                                padding: "1rem",
                                                background: "#f0fdf4",
                                                borderRadius: "8px",
                                                border: "2px solid #10b981",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  marginBottom: "0.75rem",
                                                  paddingBottom: "0.5rem",
                                                  borderBottom:
                                                    "1px solid #10b981",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    fontWeight: "700",
                                                    color: "#065f46",
                                                  }}
                                                >
                                                  Diagnosis:{" "}
                                                  {prescription.diagnosis}
                                                </div>
                                                <div
                                                  style={{
                                                    fontSize: "0.85rem",
                                                    color: "#6b7280",
                                                    marginTop: "0.25rem",
                                                  }}
                                                >
                                                  Issued:{" "}
                                                  {new Date(
                                                    prescription.createdAt,
                                                  ).toLocaleString()}
                                                </div>
                                              </div>

                                              <div
                                                style={{
                                                  marginBottom: "0.5rem",
                                                  fontWeight: "600",
                                                  color: "#065f46",
                                                }}
                                              >
                                                Medicines:
                                              </div>
                                              {prescription.medicines.map(
                                                (med, medIdx) => (
                                                  <div
                                                    key={medIdx}
                                                    style={{
                                                      padding: "0.75rem",
                                                      background: "white",
                                                      borderRadius: "6px",
                                                      marginBottom: "0.5rem",
                                                      fontSize: "0.9rem",
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        fontWeight: "700",
                                                        marginBottom: "0.25rem",
                                                        color: "#1f2937",
                                                      }}
                                                    >
                                                      {medIdx + 1}.{" "}
                                                      {med.medicineName}
                                                    </div>
                                                    <div
                                                      style={{
                                                        color: "#6b7280",
                                                        fontSize: "0.85rem",
                                                      }}
                                                    >
                                                      <div>
                                                        💊 Dosage: {med.dosage}
                                                      </div>
                                                      <div>
                                                        ⏰ Frequency:{" "}
                                                        {med.frequency}
                                                      </div>
                                                      <div>
                                                        📅 Duration:{" "}
                                                        {med.duration}
                                                      </div>
                                                      {med.instructions && (
                                                        <div>
                                                          📝 Instructions:{" "}
                                                          {med.instructions}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}

                                              {prescription.generalInstructions && (
                                                <div
                                                  style={{
                                                    marginTop: "0.75rem",
                                                    padding: "0.75rem",
                                                    background: "#fef3c7",
                                                    borderRadius: "6px",
                                                    fontSize: "0.85rem",
                                                  }}
                                                >
                                                  <strong>Instructions:</strong>{" "}
                                                  {
                                                    prescription.generalInstructions
                                                  }
                                                </div>
                                              )}

                                              {prescription.dietaryAdvice && (
                                                <div
                                                  style={{
                                                    marginTop: "0.5rem",
                                                    padding: "0.75rem",
                                                    background: "#dbeafe",
                                                    borderRadius: "6px",
                                                    fontSize: "0.85rem",
                                                  }}
                                                >
                                                  <strong>
                                                    Dietary Advice:
                                                  </strong>{" "}
                                                  {prescription.dietaryAdvice}
                                                </div>
                                              )}

                                              <div
                                                style={{
                                                  marginTop: "0.75rem",
                                                  display: "flex",
                                                  gap: "0.5rem",
                                                  flexWrap: "wrap",
                                                }}
                                              >
                                                <Button
                                                  $bg="#667eea"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPrescription(
                                                      prescription,
                                                    );
                                                    setShowPrescriptionQR(true);
                                                  }}
                                                  style={{
                                                    fontSize: "0.8rem",
                                                    padding: "0.5rem 1rem",
                                                  }}
                                                >
                                                  <FaQrcode /> View QR Code
                                                </Button>
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </MedicalDetailSection>
                                    );
                                  })()}

                                  {record.followUpDate && (
                                    <MedicalDetailSection>
                                      <DetailLabel>
                                        📅 <strong>Follow-Up</strong>
                                      </DetailLabel>
                                      <DetailValue>
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                          record.followUpDate,
                                        ).toLocaleDateString()}
                                        {record.followUpNotes && (
                                          <>
                                            <br />
                                            <strong>Notes:</strong>{" "}
                                            {record.followUpNotes}
                                          </>
                                        )}
                                      </DetailValue>
                                    </MedicalDetailSection>
                                  )}

                                  {record.hasAttachments && (
                                    <MedicalDetailSection>
                                      <DetailLabel>
                                        📎 <strong>Attached Documents</strong>
                                      </DetailLabel>
                                      <DetailValue>
                                        <em>
                                          See Doctor's Attachments section below
                                        </em>
                                      </DetailValue>
                                    </MedicalDetailSection>
                                  )}
                                </MedicalRecordCard>
                              ))}
                            </RecordSection>
                          )}

                          {/* Doctor's File Attachments */}
                          {doctorFileUploads.length > 0 && (
                            <RecordSection $borderColor="#10b981">
                              <SectionHeader $borderColor="#10b981">
                                <SectionIcon $bg="#d1fae5" $color="#10b981">
                                  <FaFilePdf />
                                </SectionIcon>
                                <SectionTitle>
                                  Doctor's Attachments
                                </SectionTitle>
                                <RecordCount $bg="#d1fae5" $color="#10b981">
                                  {doctorFileUploads.length}{" "}
                                  {doctorFileUploads.length === 1
                                    ? "File"
                                    : "Files"}
                                </RecordCount>
                              </SectionHeader>

                              {doctorFileUploads.map((record) => (
                                <RecordItem key={record._id}>
                                  <RecordInfo>
                                    <RecordTitle>
                                      {getFileIcon(record.mimetype)}{" "}
                                      {record.originalName}
                                    </RecordTitle>
                                    <RecordMeta>
                                      <div>
                                        📅 Uploaded:{" "}
                                        {new Date(
                                          record.uploadedAt,
                                        ).toLocaleString()}
                                      </div>
                                      <div>
                                        📦 Size:{" "}
                                        {(record.size / 1024).toFixed(2)} KB
                                      </div>
                                    </RecordMeta>
                                  </RecordInfo>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    <ActionButton
                                      $bg="#10b981"
                                      onClick={() =>
                                        handleDownloadRecord(record)
                                      }
                                    >
                                      <FaDownload />
                                    </ActionButton>
                                  </div>
                                </RecordItem>
                              ))}
                            </RecordSection>
                          )}

                          {/* Patient's Uploads Section */}
                          {patientFileUploads.length > 0 && (
                            <RecordSection $borderColor="#3b82f6">
                              <SectionHeader $borderColor="#3b82f6">
                                <SectionIcon $bg="#dbeafe" $color="#3b82f6">
                                  <FaUser />
                                </SectionIcon>
                                <SectionTitle>Your Uploads</SectionTitle>
                                <RecordCount $bg="#dbeafe" $color="#3b82f6">
                                  {patientFileUploads.length}{" "}
                                  {patientFileUploads.length === 1
                                    ? "File"
                                    : "Files"}
                                </RecordCount>
                              </SectionHeader>

                              {patientFileUploads.map((record) => (
                                <RecordItem key={record._id}>
                                  <RecordInfo>
                                    <RecordTitle>
                                      {getFileIcon(record.mimetype)}{" "}
                                      {record.title || record.originalName}
                                    </RecordTitle>
                                    <RecordMeta>
                                      {record.description && (
                                        <div>📝 {record.description}</div>
                                      )}
                                      <div>
                                        📅 Uploaded:{" "}
                                        {new Date(
                                          record.uploadedAt,
                                        ).toLocaleString()}
                                      </div>
                                      <div>
                                        📦 Size:{" "}
                                        {(record.size / 1024).toFixed(2)} KB
                                      </div>
                                    </RecordMeta>
                                    <UploaderBadge $isDoctor={false}>
                                      👤 Uploaded by You
                                    </UploaderBadge>
                                  </RecordInfo>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    <ActionButton
                                      $bg="#3b82f6"
                                      onClick={() =>
                                        window.open(
                                          record.fileUrl || record.path,
                                          "_blank",
                                        )
                                      }
                                    >
                                      <FaEye />
                                    </ActionButton>
                                    <ActionButton
                                      $bg="#10b981"
                                      onClick={() =>
                                        handleDownloadRecord(record)
                                      }
                                    >
                                      <FaDownload />
                                    </ActionButton>
                                    <ActionButton
                                      $bg="#ef4444"
                                      onClick={() =>
                                        handleDeleteRecord(record._id)
                                      }
                                    >
                                      <FaTrash />
                                    </ActionButton>
                                  </div>
                                </RecordItem>
                              ))}
                            </RecordSection>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </RecordsList>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Prescription QR Code Modal */}
      {showPrescriptionQR && selectedPrescription && (
        <Modal onClick={() => setShowPrescriptionQR(false)}>
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <ModalHeader>
              <ModalTitle>
                <FaPrescriptionBottleAlt />
                Prescription QR Code
              </ModalTitle>
              <CloseButton onClick={() => setShowPrescriptionQR(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <QRModalContent>
                <QRHeader>
                  <h3>{selectedPrescription.patientName}</h3>
                  <p>Dr. {selectedPrescription.doctorName}</p>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                    {new Date(
                      selectedPrescription.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </QRHeader>

                {selectedPrescription.qrCode ? (
                  <>
                    <QRCodeContainer>
                      <img
                        src={selectedPrescription.qrCode}
                        alt="Prescription QR Code"
                      />
                    </QRCodeContainer>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "0.5rem",
                      }}
                    >
                      📱 Show this QR code at the pharmacy
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#6b7280",
                      }}
                    >
                      Prescription ID: {selectedPrescription._id}
                    </p>
                  </>
                ) : (
                  <div
                    style={{
                      padding: "2rem",
                      background: "#fef3c7",
                      borderRadius: "8px",
                      border: "2px solid #f59e0b",
                    }}
                  >
                    <p style={{ margin: 0, color: "#92400e" }}>
                      ⚠️ QR Code not available for this prescription
                    </p>
                  </div>
                )}

                <MedicineList>
                  <h4>
                    💊 Prescribed Medicines (
                    {selectedPrescription.medicines?.length || 0}):
                  </h4>
                  {selectedPrescription.medicines?.map((med, idx) => (
                    <MedicineItem key={idx}>
                      <strong>{med.medicineName}</strong> - {med.dosage}
                      <br />
                      <span>
                        {med.frequency} for {med.duration}
                      </span>
                    </MedicineItem>
                  ))}
                </MedicineList>

                {selectedPrescription.diagnosis && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1rem",
                      background: "#eff6ff",
                      borderRadius: "8px",
                      textAlign: "left",
                    }}
                  >
                    <strong style={{ color: "#1e40af" }}>🩺 Diagnosis:</strong>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#374151" }}>
                      {selectedPrescription.diagnosis}
                    </p>
                  </div>
                )}

                <Button
                  $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  onClick={() => setShowPrescriptionQR(false)}
                  style={{ marginTop: "1.5rem", width: "100%" }}
                >
                  Close
                </Button>
              </QRModalContent>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PatientAppointmentsTable;
