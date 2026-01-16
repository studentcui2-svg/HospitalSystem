import React, { useEffect, useRef, useState, useCallback } from "react";
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
import VideoCall from "./VideoCall";
import IncomingCallModal from "./IncomingCallModal";
import io from "socket.io-client";

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

  @media (max-width: 767px) {
    display: block;
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

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  background: linear-gradient(90deg, #f3f4f6, #ffffff);
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #fbfbfd;
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

const Td = styled.td`
  padding: 12px 16px;
  vertical-align: middle;
  color: #111827;
  font-size: 0.95rem;

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

    &:last-child {
      text-align: left;
      margin-top: 0.5rem;

      &::before {
        display: none;
      }
    }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
  background: ${(p) => p.$bg || "#6b7280"};
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  color: white;
  margin-left: 8px;
  background: ${(p) => p.$bg || "#4f46e5"};
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};

  @media (max-width: 767px) {
    display: block;
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
`;

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [socket, setSocket] = useState(null);
  const appointmentsRef = useRef([]);

  const getRoleFromToken = () => {
    try {
      const token =
        typeof window !== "undefined" &&
        (window.__APP_TOKEN__ || window.localStorage.getItem("app_token"));
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(payload)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const obj = JSON.parse(json);
      return obj || null;
    } catch (e) {
      console.error("Failed to parse token", e);
      return null;
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = getRoleFromToken();
      const role = payload?.role || null;
      let query = "";
      if (role === "admin") query = "?all=true";
      else if (role === "doctor") {
        // prefer the logged-in user's name (set on login)
        const doctorName =
          (typeof window !== "undefined" && window.__APP_USER__?.name) ||
          payload?.email ||
          "";
        if (doctorName) query = `?doctor=${encodeURIComponent(doctorName)}`;
      }
      const res = await jsonFetch(`/api/appointments${query}`);
      setAppointments(res.appointments || []);
      appointmentsRef.current = res.appointments || [];
      appointmentsRef.current = res.appointments || [];
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

  // Separate useEffect for socket setup - create socket ONCE on mount
  useEffect(() => {
    // Only create socket once, don't recreate on appointments change
    console.log("[MyAppointments] Creating socket connection");

    // Setup socket for incoming calls
    const newSocket = io("http://localhost:5000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    console.log("[MyAppointments] Socket created:", newSocket.id);
    setSocket(newSocket);

    // Get user info for joining rooms
    const user = getRoleFromToken();
    const userName = user?.email || "Patient";

    // Function to join appointment rooms
    const joinRooms = () => {
      console.log(
        "[MyAppointments] Joining rooms, socket connected:",
        newSocket.connected
      );

      // Join rooms for all accepted online appointments
      const acceptedOnlineAppts = appointmentsRef.current.filter((appt) => {
        const status = (appt.status || "pending").toLowerCase();
        const isAccepted = status === "accepted";
        const isOnline = appt.mode === "online";
        return isAccepted && isOnline;
      });

      console.log(
        "[MyAppointments] Found accepted online appointments:",
        acceptedOnlineAppts.length
      );

      acceptedOnlineAppts.forEach((appt) => {
        console.log("Patient joining room for appointment:", appt._id);
        newSocket.emit("join-room", {
          appointmentId: appt._id,
          userRole: "patient",
          userName: userName,
        });
      });
    };

    // Join rooms when socket connects
    newSocket.on("connect", () => {
      console.log("Patient socket connected", newSocket.id);
      joinRooms();
    });

    // If already connected, join immediately
    if (newSocket.connected) {
      console.log(
        "[MyAppointments] Socket already connected, joining rooms immediately"
      );
      joinRooms();
    }

    // Listen for incoming calls
    console.log("[MyAppointments] Registering incoming-call listener");
    newSocket.on(
      "incoming-call",
      ({ appointmentId, callerRole, callerName }) => {
        console.log(
          "[MyAppointments] INCOMING CALL RECEIVED from:",
          callerName,
          "for appointment:",
          appointmentId
        );
        setIncomingCall({
          appointmentId,
          callerRole,
          callerName,
        });
      }
    );

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []); // Empty dependency - only run once on mount

  // Separate effect to handle re-joining when appointments change
  useEffect(() => {
    if (!socket || appointments.length === 0) return;

    console.log("[MyAppointments] Appointments changed, updating room joins");

    // Get user info
    const user = getRoleFromToken();
    const userName = user?.email || "Patient";

    // Join rooms for all accepted online appointments
    const acceptedOnlineAppts = appointments.filter((appt) => {
      const status = (appt.status || "pending").toLowerCase();
      const isAccepted = status === "accepted";
      const isOnline = appt.mode === "online";
      return isAccepted && isOnline;
    });

    acceptedOnlineAppts.forEach((appt) => {
      console.log("Patient joining room for appointment (update):", appt._id);
      socket.emit("join-room", {
        appointmentId: appt._id,
        userRole: "patient",
        userName: userName,
      });
    });
  }, [appointments, socket]);

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

  const startMeeting = () => {
    // Patient cannot initiate calls, only wait/join
    // This is just here for UI consistency, but patient should wait for doctor to call
    toast.info("Waiting for doctor to start the meeting...");
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;

    // Accept the call via socket
    if (socket) {
      socket.emit("accept-call", {
        appointmentId: incomingCall.appointmentId,
        accepterRole: "patient",
      });
    }

    const user = getRoleFromToken();
    setActiveCall({
      appointmentId: incomingCall.appointmentId,
      doctorName: incomingCall.callerName,
      patientName: user?.email || "Patient",
      isInitiator: false, // Patient is accepting, not initiating
    });
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    if (!incomingCall) return;

    // Decline the call via socket
    if (socket) {
      socket.emit("decline-call", {
        appointmentId: incomingCall.appointmentId,
        declinerRole: "patient",
      });
    }

    toast.info("Call declined");
    setIncomingCall(null);
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

              // Check if appointment is currently active (during meeting time only)
              const appointmentDate = new Date(a.date);
              const appointmentEndDate = new Date(
                appointmentDate.getTime() +
                  (a.durationMinutes || 30) * 60 * 1000
              );
              const now = new Date();
              const isMeetingTimeNear =
                now >= appointmentDate && now <= appointmentEndDate; // Only during appointment window
              const minutesUntilAppointment =
                (appointmentDate - now) / (1000 * 60);

              return (
                <Tr key={a._id}>
                  <Td data-label="Doctor:">
                    <div style={{ fontWeight: 800 }}>
                      {a.doctor || a.doctorName || "-"}
                    </div>
                    <div style={{ color: "#6b7280" }}>{a.department}</div>
                  </Td>
                  <Td data-label="Date / Time:">
                    <div style={{ fontWeight: 700 }}>
                      {new Date(a.date).toLocaleString()}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {a.durationMinutes || 30} mins
                    </div>
                  </Td>
                  <Td data-label="Contact:">
                    <div>
                      {a.phone || a.doctorPhone || a.patientPhone || "-"}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {a.patientEmail || a.email || ""}
                    </div>
                  </Td>
                  <Td data-label="Status:">
                    <Badge $bg={badgeColor}>
                      {(a.status || "Pending").toUpperCase()}
                    </Badge>
                  </Td>
                  <Td data-label="Actions:" style={{ textAlign: "right" }}>
                    {isAccepted &&
                      !isRejected &&
                      !isDone &&
                      (isOnline ? (
                        <ActionButton
                          $bg="#7c3aed"
                          onClick={() => isMeetingTimeNear && startMeeting(a)}
                          disabled={!isMeetingTimeNear}
                          title={
                            isMeetingTimeNear
                              ? "Join meeting now"
                              : minutesUntilAppointment > 0
                              ? `Meeting available at appointment time (in ${Math.floor(
                                  minutesUntilAppointment
                                )} min)`
                              : "Meeting time has ended"
                          }
                        >
                          Get in touch
                        </ActionButton>
                      ) : (
                        <ActionButton $bg="#6b7280" disabled>
                          On Clinic
                        </ActionButton>
                      ))}

                    {isRejected && (
                      <ActionButton $bg="#ef4444" disabled>
                        Rejected
                      </ActionButton>
                    )}

                    {a.invoice && a.invoice.html && (
                      <ActionButton
                        type="button"
                        onClick={() => downloadInvoice(a)}
                        $bg="#2563eb"
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

      {activeCall && (
        <VideoCall
          appointmentId={activeCall.appointmentId}
          userRole="patient"
          userName={activeCall.patientName}
          isInitiator={activeCall.isInitiator}
          onEnd={() => setActiveCall(null)}
          socket={socket}
        />
      )}

      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callerRole={incomingCall.callerRole}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </Container>
  );
}
