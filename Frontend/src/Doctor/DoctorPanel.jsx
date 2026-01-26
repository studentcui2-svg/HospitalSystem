import React, { useEffect, useState, useRef } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaBars,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";
import styled from "styled-components";
import { jsonFetch } from "../utils/api";
import VideoCall from "../Clientside/VideoCall";
import IncomingCallModal from "../Clientside/IncomingCallModal";
import ChatFloatingButton from "./ChatFloatingButton";
import io from "socket.io-client";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    padding-top: 4rem; /* Space for fixed hamburger */
  }
`;

const HamburgerButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 0;
  right: ${(props) => (props.$isOpen ? "0" : "-100%")};
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  transition: right 0.3s ease;
  z-index: 999;
  padding: 1.5rem;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const MenuTitle = styled.h3`
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
`;

const CloseMenuButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(5px);
  }

  &:active {
    transform: translateX(3px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const MenuOverlay = styled.div`
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;

  @media (min-width: 769px) {
    display: none;
  }
`;

const Header = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: titleGlow 3s ease-in-out infinite;

  @keyframes titleGlow {
    0%,
    100% {
      filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 16px rgba(118, 75, 162, 0.8));
    }
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const WelcomeText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TableCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow:
    0 20px 60px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
  animation: cardFadeIn 0.8s ease-out;

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 70%
    );
    animation: cardFloat 8s ease-in-out infinite;
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(40px, -40px) rotate(180deg);
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }
`;

const TableWrapper = styled.div`
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  overflow-x: auto;
  overflow-y: visible;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(102, 126, 234, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  background: transparent;
  border-radius: 0;
  font-size: 0.875rem;

  @media (max-width: 767px) {
    display: block;
    border: none;
    min-width: unset;

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
  padding: 0.875rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 700;
  color: white;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 3px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Tr = styled.tr`
  transition: all 0.3s ease;
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background: linear-gradient(
      90deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%
    );
    transform: scale(1.005);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    display: block;
    background: white;
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    }
  }
`;

const Td = styled.td`
  padding: 0.75rem 0.625rem;
  vertical-align: middle;
  color: #1f2937;
  font-size: 0.875rem;

  @media (max-width: 767px) {
    display: block;
    padding: 0.6rem 0;
    text-align: left;
    border-bottom: none;

    &::before {
      content: attr(data-label);
      font-weight: 700;
      color: #667eea;
      margin-right: 0.5rem;
      display: inline-block;
      min-width: 120px;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
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

const FilterToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  flex-wrap: wrap;

  @media (max-width: 968px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;

  @media (max-width: 968px) {
    width: 100%;
    min-width: unset;
  }

  &::before {
    content: "🔍";
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.1rem;
  }
`;

const SearchInput = styled.input`
  padding: 0.85rem 1rem 0.85rem 2.8rem;
  border-radius: 10px;
  border: none;
  font-size: 0.95rem;
  width: 100%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 968px) {
    width: 100%;
    justify-content: space-between;
  }

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }
`;

const FilterButton = styled.button`
  padding: 0.7rem 1.4rem;
  border: 2px solid
    ${(props) => (props.$active ? "#fff" : "rgba(255, 255, 255, 0.3)")};
  background: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.15)"};
  color: ${(props) => (props.$active ? "#667eea" : "#fff")};
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  white-space: nowrap;

  &:hover {
    background: ${(props) =>
      props.$active ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.25)"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  color: #fff;
  background: ${(p) => p.$bg || "#6b7280"};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px
    ${(p) => (p.$bg ? `${p.$bg}40` : "rgba(107, 114, 128, 0.25)")};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px
      ${(p) => (p.$bg ? `${p.$bg}60` : "rgba(107, 114, 128, 0.4)")};
  }
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  color: white;
  margin-left: 8px;
  background: ${(p) =>
    p.$bg || "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"};
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px
    ${(p) => (p.$bg ? `${p.$bg}40` : "rgba(79, 70, 229, 0.3)")};
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px
      ${(p) => (p.$bg ? `${p.$bg}60` : "rgba(79, 70, 229, 0.5)")};
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  @media (max-width: 767px) {
    display: block;
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
`;

const Small = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const ProfileBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(102, 126, 234, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  animation: profileFadeIn 0.6s ease-out;

  @keyframes profileFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 70%
    );
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(-30px, -30px) rotate(180deg);
    }
  }

  form {
    position: relative;
    z-index: 1;

    @media (max-width: 767px) {
      flex-direction: column !important;
      align-items: stretch !important;

      > div {
        width: 100%;
      }
    }
  }
`;

const ProfileHeader = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const ProfileLabel = styled.div`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  opacity: 0.9;
  margin-bottom: 0.4rem;
  font-weight: 600;
`;

const ProfileValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PasswordFormWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;

  @media (max-width: 767px) {
    margin-bottom: 0.75rem;
  }
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 1.25rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.8);
    background: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  transition: all 0.2s ease;
  border-radius: 8px;

  &:hover {
    background: rgba(107, 114, 128, 0.1);
    color: #4b5563;
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const PasswordFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2.5rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: 0.9rem 2rem;
  }
`;

const RecordsLinkButton = styled.button`
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:hover::before {
    width: 200px;
    height: 200px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 767px) {
    width: 100%;
    margin-top: 0.5rem;
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
  const [patientResponses, setPatientResponses] = useState({});
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const callTimeoutRef = useRef(null);

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
            profileRes.profile.name || profileRes.profile.email || "",
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
      doctorName,
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
            appointmentId,
          );
          setIncomingCall({
            appointmentId,
            callerRole,
            callerName,
          });
        }
      },
    );

    // When a call is accepted by patient (for calls we initiate)
    newSocket.on("call-accepted", ({ appointmentId, accepterRole }) => {
      console.log("[DoctorPanel] call-accepted", appointmentId, accepterRole);
      // clear any pending timeout for this call
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    });

    // Quick-response from patient for missed-call auto prompt
    newSocket.on("quick-response", ({ appointmentId, response }) => {
      console.log("[DoctorPanel] quick-response", appointmentId, response);
      setPatientResponses((s) => ({ ...s, [appointmentId]: response }));
    });

    // Listen for payment status updates so doctor UI updates in real-time
    newSocket.on("payment-updated", ({ appointmentId, paymentStatus }) => {
      console.log(
        "[DoctorPanel] payment-updated",
        appointmentId,
        paymentStatus,
      );
      // refresh appointments list to reflect new payment status
      refreshAppointments().catch((err) =>
        console.error(
          "[DoctorPanel] failed to refresh after payment update",
          err,
        ),
      );
    });

    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      if (newSocket) newSocket.disconnect();
    };
  }, [appointments, doctorName]);

  // Clear pending call timeout when activeCall ends (doctor stopped/call ended)
  useEffect(() => {
    if (!activeCall && callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  }, [activeCall]);

  const filterAppointmentsByPeriod = (appointmentsList) => {
    let filtered = appointmentsList;

    // Filter by search query (name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((appointment) => {
        const patientName = (appointment.patientName || "").toLowerCase();
        const patientEmail = (appointment.patientEmail || "").toLowerCase();
        return patientName.includes(query) || patientEmail.includes(query);
      });
    }

    // Filter by date period
    if (filterPeriod === "all") return filtered;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return filtered.filter((appointment) => {
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
  };

  const sortAppointments = (appointmentsList) => {
    return [...appointmentsList].sort((a, b) => {
      // Sort by date (earliest first)
      return new Date(a.date) - new Date(b.date);
    });
  };

  const filteredAndSortedAppointments = sortAppointments(
    filterAppointmentsByPeriod(appointments),
  );

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
          s.map((a) => (a._id === id ? res.appointment : a)),
        );
      }
    } catch (err) {
      console.error("[DoctorPanel] Accept failed", err);
    }
  };

  const refreshAppointments = async () => {
    try {
      const res = await jsonFetch(`/api/doctor/appointments`);
      if (res && res.appointments) setAppointments(res.appointments);
    } catch (err) {
      console.error("[DoctorPanel] Failed to refresh appointments", err);
    }
  };

  const downloadInvoice = (appt) => {
    if (!appt.invoice || !appt.invoice.html) {
      alert("No invoice available");
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
    setActiveCall({
      appointmentId: appt._id,
      patientName: appt.patientName,
      isInitiator: true, // Doctor is initiating the call
    });

    // emit initiate event so the patient gets called
    if (socket) {
      socket.emit("initiate-call", {
        appointmentId: appt._id,
        callerRole: "doctor",
        callerName: `${doctorName}`,
      });
    }

    // start a 1 minute timeout. If patient doesn't accept, cut the call
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    callTimeoutRef.current = setTimeout(() => {
      console.log(
        "[DoctorPanel] call timeout, marking missed and sending auto-prompt",
        appt._id,
      );

      // End the local active call state
      setActiveCall(null);

      // Emit missed-call so server can record/notify
      if (socket) {
        socket.emit("missed-call", {
          appointmentId: appt._id,
          callerRole: "doctor",
        });

        // Send auto prompt with quick-reply options
        socket.emit("auto-prompt", {
          appointmentId: appt._id,
          message: "Please pickup call",
          options: ["Ok now", "I am busy", "After 5 minutes"],
        });
      }

      callTimeoutRef.current = null;
    }, 60 * 1000);
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
      {/* Hamburger Menu Button - Mobile Only */}
      <HamburgerButton onClick={() => setMenuOpen(true)}>
        <FaBars />
      </HamburgerButton>

      {/* Mobile Menu Overlay */}
      <MenuOverlay $isOpen={menuOpen} onClick={() => setMenuOpen(false)} />

      {/* Mobile Menu Sidebar */}
      <MobileMenu $isOpen={menuOpen}>
        <MenuHeader>
          <MenuTitle>Doctor Menu</MenuTitle>
          <CloseMenuButton onClick={() => setMenuOpen(false)}>
            <FaTimes />
          </CloseMenuButton>
        </MenuHeader>

        <MenuItem
          onClick={() => {
            setMenuOpen(false);
            // Scroll to appointments section
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <FaCalendarAlt />
          My Appointments
        </MenuItem>
      </MobileMenu>

      <Header>🏥 Doctor Panel</Header>
      <WelcomeText>
        Welcome
        {doctorName
          ? doctorName.toLowerCase().startsWith("dr.") ||
            doctorName.toLowerCase().startsWith("dr ")
            ? `, ${doctorName}`
            : `, Dr. ${doctorName}`
          : ""}
        ! Here are your upcoming appointments.
      </WelcomeText>

      {loading && <WelcomeText>⏳ Loading...</WelcomeText>}

      {profile && (
        <ProfileBox>
          <ProfileHeader>
            <ProfileLabel>✉️ Email Address</ProfileLabel>
            <ProfileValue>{profile.email}</ProfileValue>
          </ProfileHeader>

          <ProfileHeader style={{ marginBottom: "1.25rem" }}>
            <ProfileLabel>🔐 Password Status</ProfileLabel>
            <ProfileValue>
              {profile.hasPassword ? "✓ Password Set" : "⚠️ No Password"}
            </ProfileValue>
          </ProfileHeader>

          <PasswordFormWrapper>
            <form onSubmit={handleChangePassword}>
              <PasswordFormGrid>
                {profile.hasPassword && (
                  <PasswordInputWrapper>
                    <PasswordInput
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <EyeButton
                      type="button"
                      onClick={() => setShowCurrentPassword((s) => !s)}
                      aria-label={
                        showCurrentPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </EyeButton>
                  </PasswordInputWrapper>
                )}
                <PasswordInputWrapper>
                  <PasswordInput
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password (min 6)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <EyeButton
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </EyeButton>
                </PasswordInputWrapper>
                <SubmitButton type="submit" disabled={changing}>
                  {changing
                    ? "⏳ Saving..."
                    : profile.hasPassword
                      ? "🔄 Change"
                      : "✨ Set"}
                </SubmitButton>
              </PasswordFormGrid>
            </form>
          </PasswordFormWrapper>
        </ProfileBox>
      )}

      <FilterToolbar>
        <SearchWrapper>
          <SearchInput
            type="text"
            placeholder="Search by patient name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>
        <FilterButtons>
          <FilterButton
            $active={filterPeriod === "all"}
            onClick={() => setFilterPeriod("all")}
          >
            All
          </FilterButton>
          <FilterButton
            $active={filterPeriod === "today"}
            onClick={() => setFilterPeriod("today")}
          >
            Today
          </FilterButton>
          <FilterButton
            $active={filterPeriod === "week"}
            onClick={() => setFilterPeriod("week")}
          >
            This Week
          </FilterButton>
          <FilterButton
            $active={filterPeriod === "month"}
            onClick={() => setFilterPeriod("month")}
          >
            Monthly
          </FilterButton>
        </FilterButtons>
      </FilterToolbar>

      {filteredAndSortedAppointments.length === 0 && !loading && (
        <WelcomeText style={{ textAlign: "center", marginTop: "2rem" }}>
          📭 No appointments found.
        </WelcomeText>
      )}

      {filteredAndSortedAppointments.length > 0 && (
        <TableCard>
          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Patient</Th>
                  <Th>Father Name</Th>
                  <Th>Date / Time</Th>
                  <Th>Mode</Th>
                  <Th>Time Remaining</Th>
                  <Th>Status</Th>
                  <Th>Remarks</Th>
                  <Th style={{ textAlign: "right" }}>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {filteredAndSortedAppointments.map((a) => {
                  // Determine if online payment is pending using normalized fields
                  const invoicePending =
                    a.invoice &&
                    (a.invoice.status === "pending" ||
                      a.invoice.status === "unpaid");
                  const paymentPending =
                    a.payment && a.payment.status === "pending";
                  const needsPayment = paymentPending || invoicePending;
                  const status = (a.status || "Pending").toLowerCase();

                  // Calculate age from dateOfBirth if not stored
                  let calculatedAge = a.age;
                  if (!calculatedAge && a.dateOfBirth) {
                    const birthDate = new Date(a.dateOfBirth);
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

                  // Calculate time-related values first
                  const now = new Date();
                  const appointmentDate = new Date(a.date);
                  const appointmentEndDate = new Date(
                    appointmentDate.getTime() +
                      (a.durationMinutes || 30) * 60 * 1000,
                  );
                  const appointmentTimePassed = now > appointmentEndDate;
                  const isMeetingTimeNear =
                    now >= appointmentDate && now <= appointmentEndDate;
                  const minutesUntilAppointment =
                    (appointmentDate - now) / (1000 * 60);

                  // Auto-mark as done if accepted and time has passed
                  const isDone =
                    status === "completed" ||
                    status === "done" ||
                    (status === "accepted" && appointmentTimePassed);
                  const isRejected = status === "rejected";
                  const isPending = status === "pending";
                  const isAccepted =
                    status === "accepted" && !appointmentTimePassed;
                  const isOnline = a.mode === "online";

                  let timeRemaining = "-";
                  let remarks = "-";

                  if (isDone) {
                    remarks = "Successful Done";
                    timeRemaining = "Completed";
                  } else if (isRejected) {
                    remarks = "Rejected";
                    timeRemaining = "N/A";
                  } else if (isPending) {
                    remarks = needsPayment
                      ? "Payment Pending"
                      : "Waiting for Approval";
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

                  let badgeColor = "#f59e0b"; // amber for pending
                  if (isAccepted) badgeColor = "#10b981"; // green
                  if (isRejected) badgeColor = "#ef4444"; // red
                  if (isDone) badgeColor = "#6b7280"; // gray

                  return (
                    <Tr key={a._id}>
                      <Td data-label="Patient:">
                        <div style={{ fontWeight: 800 }}>{a.patientName}</div>
                        <Small>{a.patientEmail}</Small>
                        <Small>{a.phone || a.patientPhone || "No phone"}</Small>
                        <Small>{a.gender || ""}</Small>
                        {a.cnic && <Small>CNIC: {a.cnic}</Small>}
                        {calculatedAge !== null &&
                          calculatedAge !== undefined && (
                            <Small>Age: {calculatedAge} years</Small>
                          )}
                        {patientResponses[a._id] && (
                          <Small style={{ marginTop: 6 }}>
                            Response: {patientResponses[a._id]}
                          </Small>
                        )}
                      </Td>
                      <Td data-label="Father Name:">
                        <div style={{ fontWeight: 700 }}>
                          {a.fatherName || "-"}
                        </div>
                      </Td>
                      <Td data-label="Date / Time:">
                        <div style={{ fontWeight: 700 }}>
                          {new Date(a.date).toLocaleString()}
                        </div>
                        <Small>{a.durationMinutes || 30} mins</Small>
                      </Td>
                      <Td data-label="Mode:">
                        <Badge $bg={isOnline ? "#7c3aed" : "#f59e0b"}>
                          {isOnline ? "ONLINE" : "CLINIC"}
                        </Badge>
                      </Td>
                      <Td data-label="Time Remaining:">
                        <div
                          style={{
                            fontWeight: 700,
                            color: isMeetingTimeNear ? "#ef4444" : "#111827",
                          }}
                        >
                          {timeRemaining}
                        </div>
                      </Td>
                      <Td data-label="Status:">
                        <Badge $bg={badgeColor}>
                          {(a.status || "Pending").toUpperCase()}
                        </Badge>
                      </Td>
                      <Td data-label="Remarks:">
                        <div
                          style={{
                            fontWeight: 600,
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
                      <Td data-label="Actions:" style={{ textAlign: "right" }}>
                        {isPending && !needsPayment && (
                          <ActionButton
                            $bg="#2563eb"
                            onClick={() => acceptAppointment(a._id)}
                          >
                            Accept
                          </ActionButton>
                        )}

                        {needsPayment &&
                          (a.invoice && a.invoice.html ? (
                            <ActionButton
                              $bg="#2563eb"
                              onClick={() => downloadInvoice(a)}
                            >
                              Invoice
                            </ActionButton>
                          ) : (
                            <ActionButton $bg="#9ca3af" disabled>
                              Payment Pending
                            </ActionButton>
                          ))}

                        {isAccepted &&
                          !isRejected &&
                          !isDone &&
                          (a.mode === "online" ? (
                            <ActionButton
                              $bg="#7c3aed"
                              onClick={() =>
                                !needsPayment &&
                                canStartMeeting(a) &&
                                startMeeting(a)
                              }
                              disabled={!canStartMeeting(a) || needsPayment}
                              title={
                                needsPayment
                                  ? "Payment pending — please complete payment first"
                                  : canStartMeeting(a)
                                    ? "Click to start the meeting"
                                    : (() => {
                                        const now = new Date().getTime();
                                        const apptTime = new Date(
                                          a.date,
                                        ).getTime();
                                        const minutesUntil = Math.floor(
                                          (apptTime - now) / (1000 * 60),
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

                        {/* Patient Records Link - Always visible */}
                        <RecordsLinkButton
                          onClick={() => {
                            const identifier =
                              a.patientEmail ||
                              a.phone ||
                              a.cnic ||
                              a.patientName;
                            window.location.hash = `#/doctor/patient/${encodeURIComponent(identifier)}`;
                          }}
                          title="View complete patient medical records"
                        >
                          📋 Records
                        </RecordsLinkButton>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        </TableCard>
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

      {/* WhatsApp-style Floating Chat Button */}
      <ChatFloatingButton />
    </Container>
  );
};

export default DoctorPanel;
