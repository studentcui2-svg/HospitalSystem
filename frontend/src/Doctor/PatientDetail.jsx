import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #4b5563;
  }
`;

const Title = styled.h1`
  color: #1f2937;
  font-size: 2rem;
  margin: 0;
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

  &:hover {
    opacity: 0.9;
  }
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StatBox = styled.div`
  background: ${(props) => props.bg || "#f3f4f6"};
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.color || "#1f2937"};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 4px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.active ? "#4f46e5" : "transparent")};
  color: ${(props) => (props.active ? "#4f46e5" : "#6b7280")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #4f46e5;
  }
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecordCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${(props) => props.borderColor || "#4f46e5"};
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
`;

const RecordTitle = styled.h3`
  color: #1f2937;
  margin: 0;
  font-size: 1.1rem;
`;

const RecordDate = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

const RecordContent = styled.div`
  color: #374151;
  line-height: 1.6;
  margin-top: 12px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4f46e5;
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
    recordType: "visit",
    title: "",
    description: "",
    diagnosis: "",
    prescription: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    followUpNotes: "",
  });

  useEffect(() => {
    if (identifier) {
      fetchPatientData();
    }
  }, [identifier]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [recordsData, summaryData] = await Promise.all([
        jsonFetch(`/api/patient-records/patients/${identifier}/records`),
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
      const recordData = {
        ...formData,
        patientName: patient?.name,
        patientEmail: patient?.email,
        phone: patient?.phone,
        cnic: patient?.cnic,
        doctorName: localStorage.getItem("doctorName") || "Dr. Unknown",
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
        recordType: "visit",
        title: "",
        description: "",
        diagnosis: "",
        prescription: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
        height: "",
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
      recordType: record.recordType,
      title: record.title,
      description: record.description || "",
      diagnosis: record.diagnosis || "",
      prescription: record.prescription || "",
      bloodPressure: record.bloodPressure || "",
      heartRate: record.heartRate || "",
      temperature: record.temperature || "",
      weight: record.weight || "",
      height: record.height || "",
      followUpNotes: record.followUpNotes || "",
    });
    setShowModal(true);
  };

  const filteredRecords = records.filter((record) => {
    if (activeTab === "all") return true;
    return record.recordType === activeTab;
  });

  const getRecordColor = (type) => {
    const colors = {
      visit: "#4f46e5",
      lab_report: "#10b981",
      prescription: "#f59e0b",
      diagnosis: "#ef4444",
      notes: "#8b5cf6",
      image: "#06b6d4",
      document: "#6b7280",
    };
    return colors[type] || "#4f46e5";
  };

  if (loading) {
    return (
      <Container>
        <Title>Loading...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <BackButton onClick={onBack || (() => window.history.back())}>
            ← Back
          </BackButton>
          <div>
            <Title>{patient?.name || "Patient Details"}</Title>
            <div style={{ color: "#6b7280", marginTop: "4px" }}>
              {patient?.email} | {patient?.phone}
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
        <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
          Patient Summary
        </h2>
        <SummaryGrid>
          <StatBox bg="#dbeafe">
            <StatValue color="#1e40af">{records.length}</StatValue>
            <StatLabel>Total Records</StatLabel>
          </StatBox>
          <StatBox bg="#dcfce7">
            <StatValue color="#15803d">{appointments.length}</StatValue>
            <StatLabel>Appointments</StatLabel>
          </StatBox>
          <StatBox bg="#fef3c7">
            <StatValue color="#ca8a04">
              {records.filter((r) => r.recordType === "visit").length}
            </StatValue>
            <StatLabel>Visits</StatLabel>
          </StatBox>
          <StatBox bg="#f3e8ff">
            <StatValue color="#7e22ce">
              {records.filter((r) => r.recordType === "lab_report").length}
            </StatValue>
            <StatLabel>Lab Reports</StatLabel>
          </StatBox>
        </SummaryGrid>
      </SummaryCard>

      <TabContainer>
        <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          All Records
        </Tab>
        <Tab
          active={activeTab === "visit"}
          onClick={() => setActiveTab("visit")}
        >
          Visits
        </Tab>
        <Tab
          active={activeTab === "lab_report"}
          onClick={() => setActiveTab("lab_report")}
        >
          Lab Reports
        </Tab>
        <Tab
          active={activeTab === "prescription"}
          onClick={() => setActiveTab("prescription")}
        >
          Prescriptions
        </Tab>
        <Tab
          active={activeTab === "diagnosis"}
          onClick={() => setActiveTab("diagnosis")}
        >
          Diagnoses
        </Tab>
        <Tab
          active={activeTab === "notes"}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </Tab>
      </TabContainer>

      <RecordsList>
        {filteredRecords.map((record) => (
          <RecordCard
            key={record._id}
            borderColor={getRecordColor(record.recordType)}
          >
            <RecordHeader>
              <div>
                <RecordTitle>{record.title}</RecordTitle>
                <RecordDate>
                  {new Date(record.visitDate).toLocaleDateString()} |{" "}
                  {record.recordType.replace("_", " ").toUpperCase()}
                </RecordDate>
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
              {record.description && (
                <p>
                  <strong>Description:</strong> {record.description}
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
              {record.bloodPressure && (
                <p>
                  <strong>Vitals:</strong> BP: {record.bloodPressure} | HR:{" "}
                  {record.heartRate} | Temp: {record.temperature}
                </p>
              )}
            </RecordContent>
          </RecordCard>
        ))}
      </RecordsList>

      {filteredRecords.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No records found. Click "Add New Record" to create one.
        </div>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>
              {editingRecord ? "Edit Record" : "New Patient Record"}
            </h2>

            <FormGroup>
              <Label>Record Type</Label>
              <Select
                value={formData.recordType}
                onChange={(e) =>
                  setFormData({ ...formData, recordType: e.target.value })
                }
              >
                <option value="visit">Visit</option>
                <option value="lab_report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="notes">Notes</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Title *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief title of the record"
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description..."
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

            <h3>Vital Signs</h3>
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
                <Label>Heart Rate</Label>
                <Input
                  type="text"
                  value={formData.heartRate}
                  onChange={(e) =>
                    setFormData({ ...formData, heartRate: e.target.value })
                  }
                  placeholder="72 bpm"
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

              <FormGroup>
                <Label>Weight</Label>
                <Input
                  type="text"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  placeholder="70 kg"
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Follow-up Notes</Label>
              <TextArea
                value={formData.followUpNotes}
                onChange={(e) =>
                  setFormData({ ...formData, followUpNotes: e.target.value })
                }
                placeholder="Follow-up instructions..."
              />
            </FormGroup>

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
