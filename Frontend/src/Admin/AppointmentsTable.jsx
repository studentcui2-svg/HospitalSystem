import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useGlobalLoading } from "../contexts/GlobalLoading";

// ========== Styled Components ==========

const TableWrap = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
  color: #111827;
  max-width: 100%;
  width: 100%;

  @media (max-width: 767px) {
    padding: 0.75rem;
    border-radius: 8px;
    overflow-x: visible;
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
  table-layout: fixed;
  border: 2px solid #d1d5db;

  @media (min-width: 768px) {
    min-width: unset;
  }

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
  border-bottom: 2px solid #d1d5db;

  &:hover {
    background: #f9fafb;
  }

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
  padding: 0.75rem 0.5rem;
  background: #f3f4f6;
  font-weight: 700;
  color: #374151;
  font-size: 0.85rem;
  border: 1px solid #d1d5db;
  vertical-align: top;

  &:nth-child(1) {
    width: 33%;
  } /* Patient Details */
  &:nth-child(2) {
    width: 28%;
  } /* Doctor Details */
  &:nth-child(3) {
    width: 12%;
  } /* Appointment Info */
  &:nth-child(4) {
    width: 13%;
  } /* Status & Remarks */
  &:nth-child(5) {
    width: 14%;
  } /* Action */

  @media (max-width: 767px) {
    display: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem 0.5rem;
  font-size: 0.85rem;
  color: #111827;
  vertical-align: top;
  border: 1px solid #e5e7eb;
  word-wrap: break-word;
  overflow-wrap: break-word;

  &:nth-child(1) {
    width: 33%;
  } /* Patient Details */
  &:nth-child(2) {
    width: 28%;
  } /* Doctor Details */
  &:nth-child(3) {
    width: 12%;
  } /* Appointment Info */
  &:nth-child(4) {
    width: 13%;
  } /* Status & Remarks */
  &:nth-child(5) {
    width: 14%;
  } /* Action */

  @media (max-width: 767px) {
    display: block;
    padding: 0.5rem 0;
    text-align: left;
    border-bottom: none;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    width: 100% !important;

    &::before {
      content: attr(data-label);
      font-weight: 700;
      color: #374151;
      margin-right: 0.5rem;
      display: inline-block;
      min-width: 120px;
    }
  }
`;

const Status = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $status }) =>
    $status === "Accepted"
      ? "#10b981"
      : $status === "Rejected"
        ? "#ef4444"
        : "#6b7280"};
  background: ${({ $status }) =>
    $status === "Accepted"
      ? "#d1fae5"
      : $status === "Rejected"
        ? "#fee2e2"
        : "#f3f4f6"};
`;

const StatusSelect = styled.select`
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  max-width: 120px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: 100%;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-top-color: #4f46e5;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SkeletonRow = styled.tr`
  display: table-row;
  background: transparent;
`;

const SkeletonTd = styled.td`
  padding: 0.75rem 0.5rem;
  vertical-align: middle;
`;

const SkeletonBlock = styled.div`
  height: 14px;
  width: ${(props) => props.width || "100%"};
  background: linear-gradient(90deg, #f3f4f6 25%, #ececec 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  border-radius: 6px;
  animation: shimmer 1.4s ease infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  border: 2px solid #3730a3;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #4338ca;
    border-color: #312e81;
  }

  @media (max-width: 767px) {
    width: 100%;
    margin-top: 0.5rem;
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

const AppointmentsTable = ({ data = [], onStatusUpdate, loading = false }) => {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingRejection, setPendingRejection] = useState(null);
  const modalContentRef = useRef(null);
  const { showLoading, hideLoading } = useGlobalLoading();

  useEffect(() => {
    setRows(
      (data || []).map((r) => ({
        ...r,
        status: r.status || "Pending",
      })),
    );
  }, [data]);

  const updateStatus = async (appointmentId, status, reason = "") => {
    try {
      setUpdatingId(appointmentId);
      showLoading("Updating appointment status...");
      const response = await jsonFetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          body:
            status === "Rejected" && reason
              ? { status, rejectionReason: reason }
              : { status },
        },
      );

      const updated = response?.appointment;
      setRows((prev) =>
        prev.map((row) =>
          row._id === appointmentId ? { ...row, status: updated.status } : row,
        ),
      );

      if (typeof onStatusUpdate === "function") {
        onStatusUpdate(appointmentId, updated.status);
      }

      const patientName = updated?.patientName || "the patient";
      toast.success(
        `Status updated for ${patientName}${status === "Rejected" && reason ? ". Email sent with reason and rebooking link." : ""}`,
      );
    } catch (error) {
      toast.error(error.message || "Failed to update appointment");
    } finally {
      setUpdatingId(null);
      hideLoading();
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    if (newStatus === "Rejected") {
      setPendingRejection(appointmentId);
      setShowRejectionModal(true);
      setRejectionReason("");
    } else {
      updateStatus(appointmentId, newStatus);
    }
  };

  const handleRejectionSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    updateStatus(pendingRejection, "Rejected", rejectionReason);
    setShowRejectionModal(false);
    setPendingRejection(null);
    setRejectionReason("");
  };

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    // First filter by search query and status
    let filtered = rows.filter((r) => {
      if (filterStatus !== "All" && r.status !== filterStatus) return false;
      if (!q) return true;
      return (
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.patientEmail || "").toLowerCase().includes(q) ||
        (r.cnic || "").toLowerCase().includes(q) ||
        (r.doctor || "").toLowerCase().includes(q) ||
        (r.doctorName || "").toLowerCase().includes(q)
      );
    });

    // Then filter by date period
    if (filterPeriod !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((appointment) => {
        const apptDate = new Date(appointment.date);
        const apptDay = new Date(
          apptDate.getFullYear(),
          apptDate.getMonth(),
          apptDate.getDate(),
        );

        switch (filterPeriod) {
          case "today":
            return apptDay.getTime() === today.getTime();

          case "week": {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return apptDate >= weekAgo;
          }

          case "month": {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return apptDate >= monthAgo;
          }

          default:
            return true;
        }
      });
    }

    // Sort by date (earliest first)
    return filtered.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  }, [rows, query, filterStatus, filterPeriod]);

  const clearFilters = () => {
    setQuery("");
    setFilterStatus("All");
    setFilterPeriod("all");
  };

  const closeModal = () => setSelectedAppointment(null);

  const handlePrint = () => {
    if (!modalContentRef.current) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    printWindow.document.write(
      `<html><body>${modalContentRef.current.innerHTML}</body></html>`,
    );
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPdf = async () => {
    if (!modalContentRef.current) return;
    try {
      showLoading("Generating PDF...");
      const canvas = await html2canvas(modalContentRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth() - 20;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save("appointment.pdf");
    } catch (e) {
      toast.error("Failed to generate PDF", e);
    } finally {
      hideLoading();
    }
  };

  if (loading) {
    // Render toolbar with disabled controls and skeleton rows while loading
    return (
      <TableWrap>
        <Toolbar>
          <LeftControls>
            <SearchInput
              placeholder="Search by patient/doctor name, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled
            />
          </LeftControls>
          <RightControls>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </Select>
            <ClearButton disabled>Clear</ClearButton>
            <LoadingOverlay>
              <Spinner />
              <div>Loading appointments…</div>
            </LoadingOverlay>
          </RightControls>
        </Toolbar>

        <Table>
          <thead>
            <Tr>
              <Th>Patient Name</Th>
              <Th>Email</Th>
              <Th>Mode</Th>
              <Th>Time Remaining</Th>
              <Th>CNIC</Th>
              <Th>Status</Th>
              <Th>Remarks</Th>
              <Th>Action</Th>
            </Tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i}>
                <SkeletonTd>
                  <SkeletonBlock width="140px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="120px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="160px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="110px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="80px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="90px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="80px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="100px" />
                </SkeletonTd>
                <SkeletonTd>
                  <SkeletonBlock width="120px" />
                </SkeletonTd>
              </SkeletonRow>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    );
  }

  return (
    <TableWrap>
      <Toolbar>
        <LeftControls>
          <SearchInput
            placeholder="Search by patient/doctor name, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </LeftControls>
        <RightControls>
          <Select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">Monthly</option>
          </Select>
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
            <Th>Patient Details</Th>
            <Th>Doctor Details</Th>
            <Th>Appointment Info</Th>
            <Th>Status & Remarks</Th>
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
            visibleRows.map((row) => {
              // Calculate age from dateOfBirth if not stored
              let calculatedAge = row.age;
              if (!calculatedAge && row.dateOfBirth) {
                const birthDate = new Date(row.dateOfBirth);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (
                  monthDiff < 0 ||
                  (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                  age--;
                }
                calculatedAge = age;
              }

              // Calculate time remaining and remarks for admin view
              const now = new Date();
              const appointmentDate = new Date(row.date);
              const appointmentEndDate = new Date(
                appointmentDate.getTime() +
                  (row.durationMinutes || 30) * 60 * 1000,
              );
              const appointmentTimePassed = now > appointmentEndDate;
              const isMeetingTimeNear =
                now >= appointmentDate && now <= appointmentEndDate;
              const minutesUntilAppointment =
                (appointmentDate - now) / (1000 * 60);
              const status = (row.status || "Pending").toLowerCase();
              const isOnline = row.mode === "online";

              // Auto-mark as done if accepted and time has passed
              const isDone =
                status === "completed" ||
                status === "done" ||
                (status === "accepted" && appointmentTimePassed);

              let timeRemaining = "-";
              let remarks = "-";

              if (isDone) {
                remarks = "Successful Done";
                timeRemaining = "Completed";
              } else if (status === "rejected") {
                remarks = "Rejected";
                timeRemaining = "N/A";
              } else if (status === "pending") {
                remarks = "Waiting for Approval";
                timeRemaining = "Pending";
              } else if (isMeetingTimeNear) {
                remarks = "In Meeting";
                timeRemaining = "Now";
              } else if (
                minutesUntilAppointment > 0 &&
                minutesUntilAppointment <= 5
              ) {
                timeRemaining = `${Math.floor(minutesUntilAppointment)} min`;
                remarks = "Starting Soon";
              } else if (minutesUntilAppointment > 0) {
                timeRemaining = `${Math.floor(minutesUntilAppointment)} min`;
                remarks = "Upcoming";
              }

              return (
                <Tr key={row._id || row.id}>
                  <Td data-label="Patient Details:">
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>
                      {row.patientName || "Unknown"}
                    </div>
                    {row.fatherName && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        Father: {row.fatherName}
                      </div>
                    )}
                    {calculatedAge !== null && calculatedAge !== undefined && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        Age: {calculatedAge} years
                      </div>
                    )}
                    {row.patientEmail && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        {row.patientEmail}
                      </div>
                    )}
                    {(row.phone || row.patientPhone) && (
                      <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        {row.phone || row.patientPhone}
                      </div>
                    )}
                  </Td>
                  <Td data-label="Doctor Details:">
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>
                      {row.doctorName || row.doctor || "-"}
                    </div>
                    {row.department && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        Dept: {row.department}
                      </div>
                    )}
                    {row.doctorEmail && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        {row.doctorEmail}
                      </div>
                    )}
                    {row.doctorPhone && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginBottom: 2,
                        }}
                      >
                        {row.doctorPhone}
                      </div>
                    )}
                    {row.doctorNic && (
                      <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        NIC: {row.doctorNic}
                      </div>
                    )}
                  </Td>
                  <Td data-label="Appointment Info:">
                    <Status
                      $status={isOnline ? "Online" : "Clinic"}
                      style={{
                        background: isOnline ? "#7c3aed" : "#f59e0b",
                        marginBottom: 6,
                      }}
                    >
                      {isOnline ? "ONLINE" : "CLINIC"}
                    </Status>
                    <div
                      style={{
                        fontWeight: 700,
                        color: isMeetingTimeNear ? "#ef4444" : "#111827",
                        fontSize: "0.875rem",
                      }}
                    >
                      {timeRemaining}
                    </div>
                  </Td>
                  <Td data-label="Status & Remarks:">
                    <Status $status={row.status} style={{ marginBottom: 6 }}>
                      {row.status}
                    </Status>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color:
                          remarks === "In Meeting"
                            ? "#10b981"
                            : remarks === "Missed"
                              ? "#ef4444"
                              : "#6b7280",
                      }}
                    >
                      {remarks}
                    </div>
                  </Td>
                  <Td data-label="Action:">
                    <StatusSelect
                      value={row.status}
                      onChange={(e) =>
                        handleStatusChange(row._id || row.id, e.target.value)
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
                      style={{ marginBottom: "8px", width: "100%" }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </StatusSelect>
                    <ActionButton
                      onClick={() => setSelectedAppointment(row)}
                      style={{ width: "100%", padding: "0.5rem 0.8rem" }}
                    >
                      Patient Details
                    </ActionButton>
                  </Td>
                </Tr>
              );
            })
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
                {
                  label: "Appointment Date & Time",
                  value: selectedAppointment.date
                    ? new Date(selectedAppointment.date).toLocaleString()
                    : "-",
                },
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

      {showRejectionModal && (
        <ModalOverlay>
          <ModalContent style={{ maxWidth: "500px" }}>
            <ModalHeader>
              <ModalTitle>Rejection Reason</ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowRejectionModal(false);
                  setPendingRejection(null);
                  setRejectionReason("");
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.9rem",
                  }}
                >
                  Please provide a reason for rejecting this appointment:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason (e.g., Doctor unavailable, Time slot conflict, etc.)"
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4f46e5";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(79, 70, 229, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  This reason will be sent to the patient via email along with a
                  link to reschedule.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <SecondaryButton
                onClick={() => {
                  setShowRejectionModal(false);
                  setPendingRejection(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={handleRejectionSubmit}
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                }}
              >
                Reject & Send Email
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </TableWrap>
  );
};

export default AppointmentsTable;
