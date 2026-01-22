import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";
import { FiArrowLeft } from "react-icons/fi";

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
  border-left: 6px solid ${(props) => props.borderColor || "#667eea"};
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
  const [activeTab, setActiveTab] = useState("all");
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
  });

  useEffect(() => {
    if (identifier) {
      fetchPatientData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
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
      const recordData = {
        ...formData,
        patientName: patient?.name,
        patientEmail: patient?.email,
        phone: patient?.phone,
        doctorName: doctorName,
      };

      if (editingRecord) {
        await jsonFetch(`/api/patient-records/records/${editingRecord._id}`, {
          method: "PUT",
          body: recordData,
        });
        toast.success("Record updated successfully");
      } else {
        await jsonFetch("/api/patient-records/records", {
          method: "POST",
          body: recordData,
        });
        toast.success("Record created successfully");
      }

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
      });
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
    });
    setShowModal(true);
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
            onChange={(e) =>
              setFormData({ ...formData, followUpDate: e.target.value })
            }
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
        <Button
          onClick={() => {
            setEditingRecord(null);
            setShowModal(true);
          }}
        >
          + Add New Record
        </Button>
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
            <StatValue color="#f59e0b">
              {records.filter((r) => r.visitDate).length}
            </StatValue>
            <StatLabel>Completed Visits</StatLabel>
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
          <RecordCard key={record._id} borderColor="#667eea">
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
    </Container>
  );
};

export default PatientDetail;
