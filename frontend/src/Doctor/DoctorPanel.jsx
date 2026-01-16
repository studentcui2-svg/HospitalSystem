import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styled from "styled-components";
import { jsonFetch } from "../utils/api";
import VideoCall from "../Clientside/VideoCall";
import IncomingCallModal from "../Clientside/IncomingCallModal";
import io from "socket.io-client";

const Container = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: 1rem;
`;

const Header = styled.h2`
  margin: 0 0 1rem 0;
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

const Small = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

const ProfileBox = styled.div`
  background: #ffffff;
  color: #111827;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;

  form {
    @media (max-width: 767px) {
      flex-direction: column !important;
      align-items: stretch !important;

      > div {
        width: 100%;
      }
    }
  }
`;

const DoctorPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, apptRes] = await Promise.all([
          jsonFetch(`/api/doctor/me`).catch(() => null),
          jsonFetch(`/api/doctor/appointments`).catch(() => ({
            appointments: [],
          })),
        ]);
        if (profileRes && profileRes.profile) {
          setProfile(profileRes.profile);
          setDoctorName(
            profileRes.profile.name || profileRes.profile.email || ""
          );
        }
        setAppointments((apptRes && apptRes.appointments) || []);
      } catch (err) {
        console.error("[DoctorPanel] Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Separate useEffect for socket setup that depends on appointments and doctorName
  useEffect(() => {
    console.log(
      "[DoctorPanel] Socket setup useEffect triggered, appointments:",
      appointments.length,
      "doctorName:",
      doctorName
    );

    if (appointments.length === 0 || !doctorName) {
      console.log("[DoctorPanel] Missing data, skipping socket setup");
      return;
    }

    // Setup socket for incoming calls from patients
    const newSocket = io("http://localhost:5000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    console.log("[DoctorPanel] Socket created for incoming patient calls");
    setSocket(newSocket);

    // DON'T join rooms here - only join in VideoCall when actually in a call
    // This prevents receiving your own call notifications

    // Listen for incoming calls from patients only
    newSocket.on(
      "incoming-call",
      ({ appointmentId, callerRole, callerName }) => {
        // Only show incoming calls from patients, not from ourselves
        if (callerRole === "patient") {
          console.log(
            "[DoctorPanel] Incoming call from patient:",
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
      }
    );

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [appointments, doctorName]);

  const handleChangePassword = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }
    setChanging(true);
    try {
      await jsonFetch(`/api/doctor/me/password`, {
        method: "PATCH",
        body: { currentPassword: currentPassword || undefined, newPassword },
      });
      alert("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      const p = await jsonFetch(`/api/doctor/me`);
      if (p && p.profile) setProfile(p.profile);
    } catch (err) {
      alert(err.message || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

  const acceptAppointment = async (id) => {
    try {
      const res = await jsonFetch(`/api/doctor/appointments/${id}/status`, {
        method: "PATCH",
        body: { status: "Accepted" },
      });
      if (res && res.appointment) {
        setAppointments((s) =>
          s.map((a) => (a._id === id ? res.appointment : a))
        );
      }
    } catch (err) {
      console.error("[DoctorPanel] Accept failed", err);
    }
  };

  const startMeeting = (appt) => {
    setActiveCall({
      appointmentId: appt._id,
      patientName: appt.patientName,
      isInitiator: true, // Doctor is initiating the call
    });
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;

    // Accept the call via socket
    if (socket) {
      socket.emit("accept-call", {
        appointmentId: incomingCall.appointmentId,
        accepterRole: "doctor",
      });
    }

    setActiveCall({
      appointmentId: incomingCall.appointmentId,
      patientName: incomingCall.callerName,
      isInitiator: false, // Doctor is accepting, not initiating
    });
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    if (!incomingCall) return;

    // Decline the call via socket
    if (socket) {
      socket.emit("decline-call", {
        appointmentId: incomingCall.appointmentId,
        declinerRole: "doctor",
      });
    }

    setIncomingCall(null);
  };

  // Helper to check if meeting can start (only during appointment time)
  const canStartMeeting = (appt) => {
    const now = new Date().getTime();
    const apptTime = new Date(appt.date).getTime();
    const apptEndTime = apptTime + (appt.durationMinutes || 30) * 60 * 1000;
    // Only allow during appointment window
    return now >= apptTime && now <= apptEndTime;
  };

  return (
    <Container>
      <Header>Doctor Panel</Header>
      <p>
        Welcome{doctorName ? `, Dr. ${doctorName}` : ""}. Here are your upcoming
        appointments.
      </p>

      {loading && <p>Loading...</p>}

      {profile && (
        <ProfileBox>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "#111827" }}>Email:</strong>{" "}
            <span style={{ color: "#111827", fontWeight: 700 }}>
              {profile.email}
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "#111827" }}>Password set:</strong>{" "}
            <span style={{ color: "#111827", fontWeight: 700 }}>
              {profile.hasPassword ? "Yes" : "No"}
            </span>
          </div>
          <form
            onSubmit={handleChangePassword}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            {profile.hasPassword && (
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ padding: 8, borderRadius: 6, width: "100%" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 4,
                  }}
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            )}
            <div style={{ position: "relative" }}>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password (min 6)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ padding: 8, borderRadius: 6, width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 4,
                }}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <ActionButton
              as="button"
              type="submit"
              disabled={changing}
              $bg="#2563eb"
            >
              {changing ? "Saving..." : profile.hasPassword ? "Change" : "Set"}
            </ActionButton>
          </form>
        </ProfileBox>
      )}

      {appointments.length === 0 && !loading && <p>No appointments found.</p>}

      {appointments.length > 0 && (
        <Table>
          <thead>
            <Tr>
              <Th>Patient</Th>
              <Th>Date / Time</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th style={{ textAlign: "right" }}>Actions</Th>
            </Tr>
          </thead>
          <tbody>
            {appointments.map((a) => {
              const status = (a.status || "Pending").toLowerCase();
              const isDone = status === "completed" || status === "done";
              const isRejected = status === "rejected";
              const isPending = status === "pending";
              const isAccepted = status === "accepted";

              let badgeColor = "#f59e0b"; // amber for pending
              if (isAccepted) badgeColor = "#10b981"; // green
              if (isRejected) badgeColor = "#ef4444"; // red
              if (isDone) badgeColor = "#6b7280"; // gray

              return (
                <Tr key={a._id}>
                  <Td data-label="Patient:">
                    <div style={{ fontWeight: 800 }}>{a.patientName}</div>
                    <Small>{a.patientEmail}</Small>
                  </Td>
                  <Td data-label="Date / Time:">
                    <div style={{ fontWeight: 700 }}>
                      {new Date(a.date).toLocaleString()}
                    </div>
                    <Small>{a.durationMinutes || 30} mins</Small>
                  </Td>
                  <Td data-label="Contact:">
                    <div>{a.phone || a.patientPhone || "-"}</div>
                    <Small>{a.gender || ""}</Small>
                  </Td>
                  <Td data-label="Status:">
                    <Badge $bg={badgeColor}>
                      {(a.status || "Pending").toUpperCase()}
                    </Badge>
                  </Td>
                  <Td data-label="Actions:" style={{ textAlign: "right" }}>
                    {isPending && (
                      <ActionButton
                        $bg="#2563eb"
                        onClick={() => acceptAppointment(a._id)}
                      >
                        Accept
                      </ActionButton>
                    )}

                    {isAccepted &&
                      !isRejected &&
                      !isDone &&
                      (a.mode === "online" ? (
                        <ActionButton
                          $bg="#7c3aed"
                          onClick={() => canStartMeeting(a) && startMeeting(a)}
                          disabled={!canStartMeeting(a)}
                          title={
                            canStartMeeting(a)
                              ? "Click to start the meeting"
                              : (() => {
                                  const now = new Date().getTime();
                                  const apptTime = new Date(a.date).getTime();
                                  const minutesUntil = Math.floor(
                                    (apptTime - now) / (1000 * 60)
                                  );
                                  return minutesUntil > 2
                                    ? `Meeting available in ${minutesUntil} minutes`
                                    : "Meeting time has passed";
                                })()
                          }
                        >
                          Start Meeting
                        </ActionButton>
                      ) : (
                        <ActionButton $bg="#6b7280" disabled>
                          On Clinic
                        </ActionButton>
                      ))}

                    {isDone && (
                      <ActionButton $bg="#10b981" disabled>
                        Done
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
          userRole="doctor"
          userName={`Dr. ${doctorName}`}
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
};

export default DoctorPanel;
