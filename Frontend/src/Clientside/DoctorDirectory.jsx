import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaComments,
} from "react-icons/fa";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";
import ChatInterface from "./ChatInterface";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  color: white;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-bottom-color: #667eea;
  }

  &::placeholder {
    color: #a0aec0;
  }

  @media (max-width: 768px) {
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: 1024px) {
    display: block;
    overflow-x: auto;
  }
`;

const Thead = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Th = styled.th`
  padding: 1.2rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 1024px) {
    padding: 1rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const Tbody = styled.tbody`
  tr:nth-child(even) {
    background: #f7fafc;
  }

  tr:hover {
    background: #edf2f7;
    transition: background 0.2s;
  }

  @media (max-width: 768px) {
    display: block;

    tr {
      display: block;
      margin-bottom: 1.5rem;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
`;

const Td = styled.td`
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
  font-size: 0.95rem;

  @media (max-width: 1024px) {
    padding: 1rem 0.8rem;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    display: block;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #e2e8f0;
    position: relative;
    padding-left: 40%;

    &:before {
      content: attr(data-label);
      position: absolute;
      left: 1rem;
      font-weight: 700;
      color: #667eea;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    &:last-child {
      border-bottom: none;
      padding-left: 1rem;

      &:before {
        display: none;
      }
    }
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  color: #4a5568;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    color: #667eea;
    font-size: 0.9rem;
  }
`;

const ChatButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  font-size: 1.1rem;
`;

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter(
        (doc) =>
          (doc.name || "").toLowerCase().includes(query) ||
          (doc.department || "").toLowerCase().includes(query) ||
          (doc.email || "").toLowerCase().includes(query) ||
          (doc.specialization || "").toLowerCase().includes(query),
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const loadDoctors = async () => {
    try {
      const response = await jsonFetch("/api/doctors");
      if (response && response.doctors) {
        setDoctors(response.doctors);
        setFilteredDoctors(response.doctors);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (doctor) => {
    const token = localStorage.getItem("app_token");
    if (!token) {
      toast.error("Please login to start a chat");
      return;
    }

    setSelectedDoctor(doctor);
    setChatOpen(true);
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading doctors...</LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Our Medical Team</Title>
        <Subtitle>
          Connect with our experienced healthcare professionals
        </Subtitle>
      </Header>

      <TableContainer>
        <SearchBar
          type="text"
          placeholder="Search by name, department, or specialization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filteredDoctors.length === 0 ? (
          <EmptyState>
            {searchQuery
              ? "No doctors found matching your search"
              : "No doctors available"}
          </EmptyState>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Doctor Name</Th>
                <Th>Department</Th>
                <Th>Specialization</Th>
                <Th>Contact Details</Th>
                <Th>Action</Th>
              </tr>
            </Thead>
            <Tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id}>
                  <Td data-label="Doctor Name">
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        marginBottom: 4,
                      }}
                    >
                      Dr. {doctor.name}
                    </div>
                    {doctor.nic && (
                      <DetailItem>
                        <FaIdCard />
                        <span style={{ fontSize: "0.85rem" }}>
                          NIC: {doctor.nic}
                        </span>
                      </DetailItem>
                    )}
                  </Td>
                  <Td data-label="Department">
                    <div style={{ fontWeight: 600 }}>
                      {doctor.department || "-"}
                    </div>
                  </Td>
                  <Td data-label="Specialization">
                    <div>{doctor.specialization || "-"}</div>
                  </Td>
                  <Td data-label="Contact Details">
                    {doctor.email && (
                      <DetailItem>
                        <FaEnvelope />
                        <span>{doctor.email}</span>
                      </DetailItem>
                    )}
                    {doctor.phone && (
                      <DetailItem>
                        <FaPhone />
                        <span>{doctor.phone}</span>
                      </DetailItem>
                    )}
                  </Td>
                  <Td>
                    <ChatButton onClick={() => handleStartChat(doctor)}>
                      <FaComments />
                      Start Chat
                    </ChatButton>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {/* Chat Interface */}
      {selectedDoctor && (
        <ChatInterface
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedDoctor(null);
          }}
          doctorId={selectedDoctor._id}
          doctorName={selectedDoctor.name}
          doctorDepartment={selectedDoctor.department}
          userRole="user"
        />
      )}
    </Container>
  );
};

export default DoctorDirectory;
