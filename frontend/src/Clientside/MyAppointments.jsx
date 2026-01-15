import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaClock,
  FaDownload,
  FaVideo,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Container = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  background: linear-gradient(90deg, #f3f4f6, #ffffff);
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #fbfbfd;
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  vertical-align: middle;
  color: #111827;
  font-size: 0.95rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
  background: ${(p) => p.bg || "#6b7280"};
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  color: white;
  margin-left: 8px;
  background: ${(p) => p.bg || "#4f46e5"};
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
`;

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jsonFetch("/api/appointments");
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error("Load appointments failed", err);
      toast.error(err?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const h = (e) => {
      console.log("Appointments changed event", e);
      load();
    };
    window.addEventListener("appointments:changed", h);
    return () => window.removeEventListener("appointments:changed", h);
  }, [load]);

  const downloadInvoice = (appt) => {
    if (!appt.invoice || !appt.invoice.html) {
      toast.info("No invoice available");
      return;
    }
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(appt.invoice.html);
    w.document.close();
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch (e) {
        console.error(e);
      }
    }, 300);
  };

  const startMeeting = (appt) => {
    toast.info(
      `Start meeting flow for ${appt.doctor || appt.doctorName || "doctor"}`
    );
  };

  return (
    <Container>
      <h2>My Appointments</h2>
      {loading && <p>Loading...</p>}
      {!loading && appointments.length === 0 && <p>No appointments found.</p>}

      {appointments.length > 0 && (
        <Table>
          <thead>
            <Tr>
              <Th>Doctor</Th>
              <Th>Date / Time</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th style={{ textAlign: "right" }}>Actions</Th>
            </Tr>
          </thead>
          <tbody>
            {appointments.map((a) => {
              const status = (a.status || "pending").toLowerCase();
              const isDone = status === "completed" || status === "done";
              const isRejected = status === "rejected";
              const isAccepted = status === "accepted";
              const isOnline = a.mode === "online";

              let badgeColor = "#f59e0b"; // amber for pending
              if (isAccepted) badgeColor = "#10b981"; // green
              if (isRejected) badgeColor = "#ef4444"; // red
              if (isDone) badgeColor = "#6b7280"; // gray

              return (
                <Tr key={a._id}>
                  <Td>
                    <div style={{ fontWeight: 800 }}>
                      {a.doctor || a.doctorName || "-"}
                    </div>
                    <div style={{ color: "#6b7280" }}>{a.department}</div>
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 700 }}>
                      {new Date(a.date).toLocaleString()}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {a.durationMinutes || 30} mins
                    </div>
                  </Td>
                  <Td>
                    <div>
                      {a.phone || a.doctorPhone || a.patientPhone || "-"}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {a.patientEmail || a.email || ""}
                    </div>
                  </Td>
                  <Td>
                    <Badge bg={badgeColor}>
                      {(a.status || "Pending").toUpperCase()}
                    </Badge>
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    {isAccepted &&
                      !isRejected &&
                      !isDone &&
                      (isOnline ? (
                        <ActionButton
                          bg="#7c3aed"
                          onClick={() => startMeeting(a)}
                        >
                          Get in touch
                        </ActionButton>
                      ) : (
                        <ActionButton bg="#6b7280" disabled>
                          On Clinic
                        </ActionButton>
                      ))}

                    {isRejected && (
                      <ActionButton bg="#ef4444" disabled>
                        Rejected
                      </ActionButton>
                    )}

                    {a.invoice && a.invoice.html && (
                      <ActionButton
                        type="button"
                        onClick={() => downloadInvoice(a)}
                        bg="#2563eb"
                      >
                        Invoice
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
