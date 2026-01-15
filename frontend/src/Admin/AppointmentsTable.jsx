import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ========== Styled Components ==========

const TableWrap = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
  color: #111827;

  @media (max-width: 767px) {
    padding: 0.75rem;
    border-radius: 8px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LeftControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const RightControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 640px) {
    width: 100%;
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  width: 220px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const Select = styled.select`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ClearButton = styled.button`
  padding: 0.6rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #e5e7eb;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  @media (max-width: 767px) {
    display: block;
    min-width: unset;
    border: none;

    thead {
      display: none;
    }

    tbody {
      display: block;
      gap: 1rem;
    }
  }
`;

const Tr = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 767px) {
    display: block;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    border-bottom: none;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  background: #f3f4f6;
  font-weight: 700;
  color: #374151;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.95rem;
  color: #111827;

  @media (max-width: 767px) {
    display: block;
    padding: 0.5rem 0;
    text-align: left;
    border-bottom: none;

    &::before {
      content: attr(data-label);
      font-weight: 700;
      color: #374151;
      margin-right: 0.5rem;
      display: inline-block;
      width: 120px;
    }
  }
`;

const Status = styled.span`
  font-weight: 600;
  color: ${({ $status }) =>
    $status === "Accepted"
      ? "green"
      : $status === "Rejected"
      ? "red"
      : "#6b7280"};
`;

const StatusSelect = styled.select`
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #4338ca;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 2rem;
  color: #374151;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 700px;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 90%;
    max-height: 95vh;
  }

  @media (max-width: 480px) {
    width: 95%;
    border-radius: 8px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #111827;
  color: #fff;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalBody = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const DetailCard = styled.div`
  background: #f9fafb;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
`;

const DetailLabel = styled.div`
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.35rem;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
`;

const ModalFooter = styled.div`
  padding: 1.25rem 2rem 1.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  border: 1px solid rgba(79, 70, 229, 0.18);
  background: #fff;
  color: #4f46e5;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: #4f46e5;
    background: rgba(79, 70, 229, 0.06);
  }
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.3);
  }
`;

// ========== Component Logic ==========

const AppointmentsTable = ({ data = [], onStatusUpdate }) => {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    setRows(
      (data || []).map((r) => ({
        ...r,
        status: r.status || "Pending",
      }))
    );
  }, [data]);

  const updateStatus = async (appointmentId, status) => {
    try {
      setUpdatingId(appointmentId);
      const response = await jsonFetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          body: { status },
        }
      );

      const updated = response?.appointment;
      setRows((prev) =>
        prev.map((row) =>
          row._id === appointmentId ? { ...row, status: updated.status } : row
        )
      );

      if (typeof onStatusUpdate === "function") {
        onStatusUpdate(appointmentId, updated.status);
      }

      const patientName = updated?.patientName || "the patient";
      toast.success(`Status updated for ${patientName}`);
    } catch (error) {
      toast.error(error.message || "Failed to update appointment");
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterStatus !== "All" && r.status !== filterStatus) return false;
      if (!q) return true;
      return (
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.patientEmail || "").toLowerCase().includes(q) ||
        (r.cnic || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, filterStatus]);

  const clearFilters = () => {
    setQuery("");
    setFilterStatus("All");
  };

  const closeModal = () => setSelectedAppointment(null);

  const handlePrint = () => {
    if (!modalContentRef.current) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    printWindow.document.write(
      `<html><body>${modalContentRef.current.innerHTML}</body></html>`
    );
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPdf = async () => {
    if (!modalContentRef.current) return;
    const canvas = await html2canvas(modalContentRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth() - 20;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, width, height);
    pdf.save("appointment.pdf");
  };

  if (!rows.length)
    return (
      <TableWrap>
        <Empty>No appointments yet.</Empty>
      </TableWrap>
    );

  return (
    <TableWrap>
      <Toolbar>
        <LeftControls>
          <SearchInput
            placeholder="Search by name, email or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </LeftControls>
        <RightControls>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </Select>
          <ClearButton onClick={clearFilters}>Clear</ClearButton>
        </RightControls>
      </Toolbar>

      <Table>
        <thead>
          <Tr>
            <Th>Patient Name</Th>
            <Th>Email</Th>
            <Th>CNIC</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </thead>
        <tbody>
          {visibleRows.length === 0 ? (
            <Tr>
              <Td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                No results match your filters.
              </Td>
            </Tr>
          ) : (
            visibleRows.map((row) => (
              <Tr key={row._id || row.id}>
                <Td data-label="Patient Name:">
                  {row.patientName || "Unknown"}
                </Td>
                <Td data-label="Email:">{row.patientEmail || "-"}</Td>
                <Td data-label="CNIC:">{row.cnic || "-"}</Td>
                <Td data-label="Status:">
                  <Status $status={row.status}>{row.status}</Status>
                </Td>
                <Td data-label="Action:">
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusSelect
                      value={row.status}
                      onChange={(e) =>
                        updateStatus(row._id || row.id, e.target.value)
                      }
                      disabled={
                        updatingId === (row._id || row.id) ||
                        row.status !== "Pending"
                      }
                      title={
                        row.status !== "Pending"
                          ? "Status already finalised"
                          : undefined
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>\n{" "}
                      <option value="Rejected">Rejected</option>
                    </StatusSelect>
                    <ActionButton onClick={() => setSelectedAppointment(row)}>
                      View
                    </ActionButton>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>

      {selectedAppointment && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                Appointment – {selectedAppointment.patientName || "Unknown"}
              </ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>
            <ModalBody ref={modalContentRef}>
              {[
                {
                  label: "Patient Name",
                  value: selectedAppointment.patientName,
                },
                { label: "Email", value: selectedAppointment.patientEmail },
                { label: "Phone", value: selectedAppointment.phone },
                { label: "CNIC", value: selectedAppointment.cnic },
                { label: "Gender", value: selectedAppointment.gender },
                { label: "Department", value: selectedAppointment.department },
                { label: "Doctor", value: selectedAppointment.doctor },
                { label: "Address", value: selectedAppointment.address },
                { label: "Status", value: selectedAppointment.status },
              ].map((item) => (
                <DetailCard key={item.label}>
                  <DetailLabel>{item.label}</DetailLabel>
                  <DetailValue>{item.value || "-"}</DetailValue>
                </DetailCard>
              ))}
            </ModalBody>
            <ModalFooter>
              <SecondaryButton onClick={handlePrint}>Print</SecondaryButton>
              <PrimaryButton onClick={handleDownloadPdf}>
                Download PDF
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </TableWrap>
  );
};

export default AppointmentsTable;
