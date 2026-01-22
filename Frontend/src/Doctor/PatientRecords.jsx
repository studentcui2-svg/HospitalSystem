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

const Title = styled.h1`
  color: #1f2937;
  font-size: 2rem;
  margin: 0;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #4f46e5, #7e22ce);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.3);
  }
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 12px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PatientCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ViewRecordsButton = styled.button`
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  background: linear-gradient(135deg, #4f46e5, #7e22ce);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }
`;

const PatientName = styled.h3`
  color: #1f2937;
  margin: 0 0 10px 0;
  font-size: 1.25rem;
`;

const PatientInfo = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 5px 0;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${(props) => props.bg || "#e5e7eb"};
  color: ${(props) => props.color || "#374151"};
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 10px;
`;

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await jsonFetch("/api/patient-records/patients");
      setPatients(response.patients || []);
    } catch (error) {
      toast.error("Failed to load patients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const name = patient._id?.name || "";
    const email = patient._id?.email || "";
    const phone = patient._id?.phone || "";
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      phone.includes(query)
    );
  });

  const handlePatientClick = (patient) => {
    const identifier = patient._id?.email || patient._id?.phone;
    window.location.href = `#/doctor/patient/${encodeURIComponent(identifier)}`;
  };

  if (loading) {
    return (
      <Container>
        <Title>Loading patients...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Patient Records</Title>
        <Button onClick={() => (window.location.href = "#/doctor/patient/new")}>
          + Add New Record
        </Button>
      </Header>

      <SearchBar
        type="text"
        placeholder="Search patients by name, email, or phone..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <PatientsGrid>
        {filteredPatients.map((patient, index) => (
          <PatientCard key={index}>
            <PatientName>{patient._id?.name || "Unknown Patient"}</PatientName>
            <PatientInfo>📧 {patient._id?.email || "No email"}</PatientInfo>
            <PatientInfo>📱 {patient._id?.phone || "No phone"}</PatientInfo>
            <div style={{ marginTop: "12px" }}>
              <Badge bg="#dbeafe" color="#1e40af">
                {patient.totalVisits || 0} Visits
              </Badge>
              {patient.lastVisit && (
                <Badge
                  bg="#f3e8ff"
                  color="#7e22ce"
                  style={{ marginLeft: "8px" }}
                >
                  Last: {new Date(patient.lastVisit).toLocaleDateString()}
                </Badge>
              )}
            </div>
            <ViewRecordsButton onClick={() => handlePatientClick(patient)}>
              📋 View Complete Records
            </ViewRecordsButton>
          </PatientCard>
        ))}
      </PatientsGrid>

      {filteredPatients.length === 0 && (
        <div
          style={{ textAlign: "center", marginTop: "50px", color: "#6b7280" }}
        >
          <p style={{ fontSize: "1.2rem" }}>No patients found</p>
          <p>Start by adding patient records from appointments</p>
        </div>
      )}
    </Container>
  );
};

export default PatientRecords;
