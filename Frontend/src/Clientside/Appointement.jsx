import React, { useState, useMemo, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaVenusMars,
  FaHospital,
  FaUserMd,
  FaGlobe,
  FaClock,
  FaMapMarkerAlt,
  FaHistory,
  FaCheck,
  FaLock,
  FaDownload,
} from "react-icons/fa";
import { Zap, Activity, ShieldCheck } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";

// --- 1. Advanced Animations ---
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

// --- 2. Styled Components (Glassmorphism + 3D) ---
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  perspective: 2000px;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const ModalBox = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5);
  padding: 3rem;
  color: white;
  transform-style: preserve-3d;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 24px;
    max-height: 92vh;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 20px;
    max-height: 95vh;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
`;

const StepDot = styled.div`
  height: 6px;
  width: 40px;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(90deg, #6366f1, #a855f7)"
      : "rgba(255,255,255,0.1)"};
  border-radius: 10px;
  transition: all 0.4s ease;

  @media (max-width: 768px) {
    width: 32px;
    height: 5px;
  }

  @media (max-width: 480px) {
    width: 24px;
    height: 4px;
  }
`;

const GlassInput = styled.input`
  width: 100%;
  padding: 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.9rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const PreviewCard = styled.div`
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(168, 85, 247, 0.1)
  );
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1.2rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

const ActionButton = styled(motion.button)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 18px;
  font-weight: 800;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${pulse} 3s infinite;

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1rem;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 0.9rem 1.5rem;
    font-size: 0.95rem;
    width: 100%;
    justify-content: center;
  }
`;

// --- 3. The Main Component Logic ---
const AppointmentModal = ({ isOpen, onClose, showSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    email: "",
    mobileNumber: "",
    nic: "",
    age: "",
    gender: "",
    appointmentDateTime: "",
    department: "Pediatrics",
    doctor: "",
    durationMinutes: 30,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    address: "",
    visitedBefore: "",
    // appointment mode: 'online' or 'physical'
    mode: "online",
    // for physical appointments: 'online' payment or 'on-site' pay at clinic
    paymentPreference: "online",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
  const [paymentAmount] = useState(50); // Default $50 for appointment
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState(null);
  const [lockedAppointment, setLockedAppointment] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [cnicLookupLoading, setCnicLookupLoading] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [showPatientInfo, setShowPatientInfo] = useState(false);

  // derive unique departments from fetched doctors
  const departments = useMemo(() => {
    const set = new Set();
    allDoctors.forEach((d) => {
      if (d.department) set.add(d.department);
    });
    return Array.from(set);
  }, [allDoctors]);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const data = await jsonFetch("/api/doctors");
        if (data && data.doctors) setAllDoctors(data.doctors);
      } catch (error) {
        console.error("[DOCTORS API] Error fetching doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Load logged-in user data when modal opens
  useEffect(() => {
    const loadUserData = async () => {
      if (!isOpen) return;

      try {
        const token = localStorage.getItem("app_token");
        if (!token) {
          toast.error("Please login to book an appointment");
          onClose();
          return;
        }

        const response = await jsonFetch("/api/auth/me");
        if (response && response.user) {
          const user = response.user;

          // Calculate age from dateOfBirth
          let age = "";
          if (user.dateOfBirth) {
            const birthDate = new Date(user.dateOfBirth);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              calculatedAge--;
            }
            age = calculatedAge.toString();
          }

          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            fatherName: user.fatherName || "",
            email: user.email || "",
            mobileNumber: user.phone || "",
            nic: user.nic || "",
            age: age,
            gender: user.gender || "",
          }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Please complete your profile before booking");
      }
    };

    loadUserData();
  }, [isOpen, onClose]);

  // when departments load, set default department if not already set
  useEffect(() => {
    if (departments.length > 0) {
      setFormData((prev) =>
        prev.department ? prev : { ...prev, department: departments[0] },
      );
    }
  }, [departments]);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.doctor || !formData.appointmentDateTime) {
        setBookedSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const selectedDate = new Date(formData.appointmentDateTime);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const response = await jsonFetch(
          `/api/appointments?doctor=${encodeURIComponent(formData.doctor)}&all=true`,
        );

        if (response && response.appointments) {
          // Filter appointments for the selected date
          const dayAppointments = response.appointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            return aptDate >= startOfDay && aptDate <= endOfDay;
          });

          setBookedSlots(dayAppointments);
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [formData.doctor, formData.appointmentDateTime]);

  // Generate time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!formData.appointmentDateTime) return [];

    const slots = [];
    const selectedDate = new Date(formData.appointmentDateTime);
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    selectedDate.setHours(0, 0, 0, 0); // Start at 00:00 (midnight)

    for (let i = 0; i < 48; i++) {
      // 48 slots = 24 hours * 2 slots/hour (00:00 to 23:30)
      const slotStart = new Date(selectedDate.getTime() + i * 30 * 60000);

      const slotEnd = new Date(
        slotStart.getTime() + (formData.durationMinutes || 30) * 60000,
      );

      // Check if this slot has passed (for today only)
      const isPast = isToday && slotStart < now;

      // Check if this slot overlaps with any booked appointment
      const isBooked = bookedSlots.some((apt) => {
        const aptStart = new Date(apt.date);
        const aptEnd = new Date(
          apt.end || aptStart.getTime() + (apt.durationMinutes || 30) * 60000,
        );
        return (
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd)
        );
      });

      slots.push({
        time: slotStart,
        display: slotStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isBooked,
        isPast,
      });
    }

    return slots;
  }, [formData.appointmentDateTime, formData.durationMinutes, bookedSlots]);

  // Filter doctors based on selected department
  const filteredDoctors = useMemo(() => {
    const filtered = allDoctors.filter(
      (doctor) =>
        doctor.department &&
        doctor.department.toLowerCase() === formData.department.toLowerCase(),
    );
    console.log("[FILTERED DOCTORS]", {
      allDoctors,
      selectedDepartment: formData.department,
      filtered,
    });
    return filtered;
  }, [allDoctors, formData.department]);

  // Time Logic
  const currentTimeInTz = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: formData.timezone,
      }).format(new Date());
    } catch {
      return "--:--";
    }
  }, [formData.timezone]);

  const isPhysicalOnSite =
    formData.mode === "physical" && formData.paymentPreference === "on-site";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle CNIC lookup
  const handleCnicLookup = async (cnicValue) => {
    // Remove dashes and spaces for lookup
    const cleanCnic = cnicValue.replace(/[-\s]/g, "");

    // Only lookup if CNIC is 13 digits
    if (cleanCnic.length !== 13) {
      setPatientHistory(null);
      setShowPatientInfo(false);
      return;
    }

    try {
      setCnicLookupLoading(true);
      console.log("[CNIC LOOKUP] Searching for:", cleanCnic);

      const response = await jsonFetch(
        `/api/appointments/patient/cnic/${cleanCnic}`,
      );

      console.log("[CNIC LOOKUP] Response:", response);

      if (response.found && response.patient) {
        // Auto-fill patient data
        setFormData((prev) => ({
          ...prev,
          firstName: response.patient.firstName || "",
          lastName: response.patient.lastName || "",
          fatherName: response.patient.fatherName || "",
          email: response.patient.email || "",
          mobileNumber: response.patient.mobileNumber || "",
          address: response.patient.address || "",
          gender: response.patient.gender || "",
          age: response.patient.age || "",
          visitedBefore: "yes", // Automatically set to yes since patient exists
        }));

        setPatientHistory(response.history);
        setShowPatientInfo(true);
        toast.success(
          `Welcome back! Found ${response.history.totalAppointments} previous appointment(s)`,
        );
      } else {
        // No patient found
        setPatientHistory(null);
        setShowPatientInfo(false);
        toast.info("No previous records found. Please fill in your details.");
      }
    } catch (error) {
      console.error("[CNIC LOOKUP] Error:", error);
      setPatientHistory(null);
      setShowPatientInfo(false);

      // Handle different error scenarios
      if (error.status === 404) {
        toast.info("New patient! Please fill in your details below.");
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Unable to verify CNIC. Please try again.");
      }
    } finally {
      setCnicLookupLoading(false);
    }
  };

  const handleCnicChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, nic: value });

    // Clean CNIC and check length
    const cleanValue = value.replace(/[-\s]/g, "");

    // Reset state if CNIC is incomplete
    if (cleanValue.length < 13) {
      setPatientHistory(null);
      setShowPatientInfo(false);
      setCnicLookupLoading(false);
      return;
    }

    // Trigger lookup when we have 13 digits
    if (cleanValue.length === 13) {
      handleCnicLookup(value);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for time conflicts and past times before submitting
    if (formData.appointmentDateTime) {
      const selectedStart = new Date(formData.appointmentDateTime);
      const selectedEnd = new Date(
        selectedStart.getTime() + (formData.durationMinutes || 30) * 60000,
      );

      // Check if time is in the past
      const now = new Date();
      const selectedDate = new Date(formData.appointmentDateTime.split("T")[0]);
      const isToday = selectedDate.toDateString() === now.toDateString();

      if (isToday && selectedStart < now) {
        toast.error(
          "Cannot book appointments in the past. Please select a future time.",
        );
        setIsSubmitting(false);
        return;
      }

      // Check for conflicts
      const hasConflict = bookedSlots.some((apt) => {
        const aptStart = new Date(apt.date);
        const aptEnd = new Date(
          apt.end || aptStart.getTime() + (apt.durationMinutes || 30) * 60000,
        );
        return (
          (selectedStart >= aptStart && selectedStart < aptEnd) ||
          (selectedEnd > aptStart && selectedEnd <= aptEnd) ||
          (selectedStart <= aptStart && selectedEnd >= aptEnd)
        );
      });

      if (hasConflict) {
        toast.error(
          "Selected time slot conflicts with an existing appointment. Please choose a different time.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const appointmentPayload = {
        patientName: `${formData.firstName} ${formData.lastName}`,
        fatherName: formData.fatherName,
        patientEmail: formData.email,
        phone: formData.mobileNumber,
        cnic: formData.nic,
        department: formData.department,
        doctor: formData.doctor,
        address: formData.address,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        notes: `Duration: ${formData.durationMinutes} mins`,
        visitedBefore: formData.visitedBefore === "yes",
        date: new Date(formData.appointmentDateTime),
        durationMinutes: formData.durationMinutes,
        timezone: formData.timezone,
        // persist the selected appointment type and payment preference
        mode: formData.mode,
        paymentPreference: formData.paymentPreference,
        amount: paymentAmount,
      };

      const res = await jsonFetch("/api/appointments", {
        method: "POST",
        body: appointmentPayload,
      });

      if (res && res.appointment && res.appointment._id) {
        setCreatedAppointmentId(res.appointment._id);
        // Decide whether to show online payment modal:
        // - Online appointments: require online payment
        // - Physical appointments: only show payment modal if paymentPreference === 'online'
        const needsPayment =
          appointmentPayload.mode === "online" ||
          appointmentPayload.paymentPreference === "online";

        if (needsPayment) {
          setShowPayment(true);
          // Keep the booking modal open while payment is processed.
          // The user can close the booking modal manually or it will
          // be closed when the appointment is locked/completed.
          // notify other parts of the app that an appointment was created (pending payment)
          try {
            window.dispatchEvent(
              new CustomEvent("appointments:changed", {
                detail: { appointment: res.appointment, action: "create" },
              }),
            );
          } catch (e) {
            console.log(e);
          }
        } else {
          // No online payment required (pay on-site). Try to open invoice preview if provided.
          try {
            const invoice = res.appointment && res.appointment.invoice;
            let html = invoice && invoice.html;
            // If backend didn't provide full HTML, build a simple invoice matching PaymentModal style
            if (!html) {
              const ap = res.appointment;
              const invNum =
                invoice && invoice.invoiceNumber
                  ? invoice.invoiceNumber
                  : `INV-${Date.now()}`;
              const amountText =
                (invoice && invoice.amountDue) || paymentAmount;
              html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${invNum}</title><style>body{font-family:Arial,sans-serif;color:#111;margin:24px} .h{color:#4f46e5;font-weight:700} .box{border:1px solid #e5e7eb;padding:16px;border-radius:8px}</style></head><body><h2 class="h">PAYMENT INVOICE</h2><p><strong>Invoice:</strong> ${invNum}</p><div class="box"><h3>Patient</h3><p><strong>Name:</strong> ${
                ap.patientName || "-"
              }<br/><strong>Email:</strong> ${
                ap.patientEmail || "-"
              }<br/><strong>Phone:</strong> ${
                ap.phone || "-"
              }</p><h3>Appointment</h3><p><strong>Department:</strong> ${
                ap.department || "-"
              }<br/><strong>Doctor:</strong> ${
                ap.doctor || "-"
              }<br/><strong>Scheduled:</strong> ${new Date(
                ap.date,
              ).toLocaleString()}</p><h3>Payment</h3><p><strong>Amount Due:</strong> USD ${Number(
                amountText,
              ).toFixed(2)}<br/><strong>Status:</strong> ${
                invoice && invoice.status ? invoice.status : "unpaid"
              }<br/><strong>Note:</strong> ${
                invoice && invoice.note
                  ? invoice.note
                  : "Pay on-site. Not paid at booking."
              }</p></div><p style="margin-top:18px;color:#6b7280">Please present this invoice at reception.</p></body></html>`;
            }

            // show invoice inside the app as a modal and mark appointment locked
            setInvoiceHtml(html);
            setLockedAppointment(true);
            setShowInvoiceModal(true);
            // notify other parts of the app that an appointment was created and locked
            try {
              window.dispatchEvent(
                new CustomEvent("appointments:changed", {
                  detail: { appointment: res.appointment, action: "create" },
                }),
              );
            } catch (e) {
              console.error(e);
            }
          } catch (e) {
            console.error("Failed to open invoice window", e);
          }

          if (typeof showSuccess === "function")
            showSuccess("Appointment Booked — pay at clinic on arrival");
          else toast.success("Appointment Booked — pay at clinic on arrival");
        }
      } else {
        console.error("Failed to create appointment", res);
      }
    } catch (err) {
      console.error("Create appointment error:", err);
      if (err && err.status === 409) {
        const msg = err.data?.message || "Selected slot is already booked";
        toast.error(msg);
        setLockedAppointment(false);
        setShowInvoiceModal(false);
      } else {
        toast.error(err.message || "Failed to create appointment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (typeof showSuccess === "function")
      showSuccess("Appointment Booked & Payment Completed!");
    else toast.success("Appointment Booked & Payment Completed!");
    setShowPayment(false);
    onClose();
  };

  const downloadInvoicePdf = () => {
    if (!invoiceHtml) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(invoiceHtml);
    w.document.close();
    // Give the window a moment to render, then trigger print dialog
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch (e) {
        console.error("Print failed", e);
      }
    }, 400);
  };

  const closeInvoice = () => {
    setShowInvoiceModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <Overlay
            key="appointment-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <ModalBox
              key="appointment-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, rotateX: 20, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotateX: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h2 style={{ fontSize: "2rem", fontWeight: 900 }}>
                  <span style={{ color: "#6366f1" }}>Fast</span> Booking
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  <FaTimes />
                </motion.button>
              </div>

              <StepIndicator>
                <StepDot $active={step >= 1} />
                <StepDot $active={step >= 2} />
                <StepDot $active={step >= 3} />
              </StepIndicator>

              <form onSubmit={handleSubmit}>
                {/* STEP 1: CNIC VERIFICATION & PERSONAL DETAILS */}
                {step < 3 ? (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    {/* CNIC Input - Always shown first */}
                    <div style={{ marginBottom: "2rem" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          color: "#94a3b8",
                        }}
                      >
                        <FaIdCard style={{ color: "#6366f1" }} />
                        ENTER YOUR CNIC / NIC
                        {cnicLookupLoading && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#6366f1",
                              fontWeight: 600,
                            }}
                          >
                            🔍 Verifying...
                          </span>
                        )}
                      </label>
                      <div
                        style={{
                          position: "relative",
                          display: "flex",
                          gap: "12px",
                        }}
                      >
                        <GlassInput
                          name="nic"
                          value={formData.nic}
                          onChange={handleCnicChange}
                          placeholder="Enter 13-digit CNIC (e.g., 12345-6789012-3)"
                          readOnly
                          style={{
                            borderColor: showPatientInfo
                              ? "rgba(34, 197, 94, 0.5)"
                              : undefined,
                            fontSize: "1.1rem",
                            padding: "1.3rem",
                            cursor: "not-allowed",
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      {showPatientInfo && patientHistory && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "16px",
                            background:
                              "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
                            border: "2px solid rgba(34, 197, 94, 0.4)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "#86efac",
                                marginBottom: "6px",
                              }}
                            >
                              ✓ Welcome Back, Returning Patient!
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "#d1fae5",
                                display: "flex",
                                gap: "16px",
                              }}
                            >
                              <span>
                                📋 {patientHistory.totalAppointments} Total
                                Appointments
                              </span>
                              <span>
                                ✅ {patientHistory.completedVisits} Completed
                                Visits
                              </span>
                              <span>
                                📅 Last Visit:{" "}
                                {new Date(
                                  patientHistory.lastVisit,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Auto-filled patient info - collapsible/readonly style */}
                    {showPatientInfo ? (
                      <div
                        style={{
                          marginBottom: "2rem",
                          padding: "20px",
                          background: "rgba(99, 102, 241, 0.08)",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1rem",
                              color: "#a5b4fc",
                              fontWeight: 700,
                            }}
                          >
                            📋 Your Information (Auto-Filled)
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowPatientInfo(false)}
                            style={{
                              background: "none",
                              border: "1px solid rgba(255,255,255,0.2)",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Edit Info
                          </button>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div>
                            <span style={{ color: "#64748b" }}>Name:</span>{" "}
                            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                              {formData.firstName} {formData.lastName}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>
                              Father's Name:
                            </span>{" "}
                            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                              {formData.fatherName}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Email:</span>{" "}
                            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                              {formData.email}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Phone:</span>{" "}
                            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                              {formData.mobileNumber}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Gender:</span>{" "}
                            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                              {formData.gender}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Age:</span>{" "}
                            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                              {formData.age} years
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Show full form if not auto-filled or user wants to edit */
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1.5rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                color: "#94a3b8",
                              }}
                            >
                              FIRST NAME
                            </label>
                            <GlassInput
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="John"
                              readOnly
                              style={{ cursor: "not-allowed", opacity: 0.7 }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                color: "#94a3b8",
                              }}
                            >
                              LAST NAME
                            </label>
                            <GlassInput
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Doe"
                              readOnly
                              style={{ cursor: "not-allowed", opacity: 0.7 }}
                            />
                          </div>
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontSize: "0.8rem",
                              fontWeight: 800,
                              color: "#94a3b8",
                            }}
                          >
                            FATHER NAME
                          </label>
                          <GlassInput
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            placeholder="Father's full name"
                            readOnly
                            style={{ cursor: "not-allowed", opacity: 0.7 }}
                          />
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontSize: "0.8rem",
                              fontWeight: 800,
                              color: "#94a3b8",
                            }}
                          >
                            EMAIL ADDRESS
                          </label>
                          <GlassInput
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            readOnly
                            style={{ cursor: "not-allowed", opacity: 0.7 }}
                          />
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontSize: "0.8rem",
                              fontWeight: 800,
                              color: "#94a3b8",
                            }}
                          >
                            CONTACT NUMBER
                          </label>
                          <GlassInput
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            placeholder="+92-300-1234567"
                            readOnly
                            style={{ cursor: "not-allowed", opacity: 0.7 }}
                          />
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1.5rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                color: "#94a3b8",
                              }}
                            >
                              AGE
                            </label>
                            <GlassInput
                              name="age"
                              type="number"
                              value={formData.age}
                              onChange={handleInputChange}
                              placeholder="25"
                              min="0"
                              max="150"
                              readOnly
                              style={{ cursor: "not-allowed", opacity: 0.7 }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                color: "#94a3b8",
                              }}
                            >
                              GENDER
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              style={{
                                width: "100%",
                                padding: "1.1rem",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "16px",
                                color: "white",
                                cursor: "not-allowed",
                                opacity: 0.7,
                              }}
                              disabled
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : null}

                {/* STEP 2: APPOINTMENT DETAILS (Department, Doctor, Mode, Date/Time) */}
                {step === 2 && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    {/* Show patient summary if auto-filled */}
                    {showPatientInfo && (
                      <div
                        style={{
                          marginBottom: "2rem",
                          padding: "16px",
                          background:
                            "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          borderRadius: "12px",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#c7d2fe" }}>
                          <strong style={{ color: "#a5b4fc" }}>
                            Booking for:
                          </strong>{" "}
                          {formData.firstName} {formData.lastName} |{" "}
                          <strong>CNIC:</strong> {formData.nic}
                        </div>
                      </div>
                    )}

                    <h3
                      style={{
                        margin: "0 0 1.5rem 0",
                        fontSize: "1.3rem",
                        color: "#a5b4fc",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <FaCalendarAlt style={{ color: "#6366f1" }} />
                      Select Appointment Details
                    </h3>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          color: "#94a3b8",
                        }}
                      >
                        🏥 APPOINTMENT TYPE
                      </label>
                      <select
                        name="mode"
                        value={formData.mode}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "1.1rem",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "16px",
                          color: "white",
                          fontSize: "1rem",
                        }}
                      >
                        <option value="online">🎥 Online (Video Call)</option>
                        <option value="physical">
                          🏥 Physical (In-Clinic Visit)
                        </option>
                      </select>
                    </div>

                    {/* If physical, let patient choose payment preference */}
                    {formData.mode === "physical" && (
                      <div style={{ marginBottom: "1rem" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: "#94a3b8",
                          }}
                        >
                          PAYMENT OPTION
                        </label>
                        <div style={{ display: "flex", gap: 12 }}>
                          <label style={{ display: "flex", gap: 8 }}>
                            <input
                              type="radio"
                              name="paymentPreference"
                              value="online"
                              checked={formData.paymentPreference === "online"}
                              onChange={handleInputChange}
                            />
                            Pay Online
                          </label>
                          <label style={{ display: "flex", gap: 8 }}>
                            <input
                              type="radio"
                              name="paymentPreference"
                              value="on-site"
                              checked={formData.paymentPreference === "on-site"}
                              onChange={handleInputChange}
                            />
                            Pay On-site (at clinic)
                          </label>
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1.5rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: "#94a3b8",
                          }}
                        >
                          🏥 DEPARTMENT
                        </label>
                        <GlassInput
                          as="select"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          style={{ fontSize: "1rem" }}
                        >
                          {departments.length === 0 ? (
                            <>
                              <option value="">Select Department</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="Cardiology">Cardiology</option>
                              <option value="Neurology">Neurology</option>
                            </>
                          ) : (
                            <>
                              <option value="">Select Department</option>
                              {departments.map((dep) => (
                                <option key={dep} value={dep}>
                                  {dep}
                                </option>
                              ))}
                            </>
                          )}
                        </GlassInput>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: "#94a3b8",
                          }}
                        >
                          👨‍⚕️ DOCTOR
                        </label>
                        <GlassInput
                          as="select"
                          name="doctor"
                          value={formData.doctor}
                          onChange={handleInputChange}
                          style={{ fontSize: "1rem" }}
                        >
                          <option value="">
                            {loadingDoctors
                              ? "Loading doctors..."
                              : filteredDoctors.length > 0
                                ? "Select a Doctor"
                                : "No doctors available"}
                          </option>
                          {filteredDoctors.map((doc) => (
                            <option key={doc._id} value={doc.name}>
                              Dr. {doc.name}
                            </option>
                          ))}
                        </GlassInput>
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          color: "#94a3b8",
                        }}
                      >
                        📅 DATE & TIME SELECT DATE
                      </label>
                      <GlassInput
                        type="date"
                        name="appointmentDateTime"
                        value={
                          formData.appointmentDateTime
                            ? formData.appointmentDateTime.split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            setFormData({
                              ...formData,
                              appointmentDateTime: `${dateValue}T08:00`,
                            });
                          } else {
                            setFormData({
                              ...formData,
                              appointmentDateTime: "",
                            });
                          }
                        }}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {formData.appointmentDateTime && (
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: "#94a3b8",
                          }}
                        >
                          SELECT TIME SLOT {loadingSlots && "(Loading...)"}
                        </label>
                        {/* Legend */}
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            marginBottom: "10px",
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "3px",
                                background:
                                  "linear-gradient(135deg, #10b981, #059669)",
                              }}
                            ></div>
                            <span>Available</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "3px",
                                background:
                                  "linear-gradient(135deg, #ef4444, #dc2626)",
                              }}
                            ></div>
                            <span>Booked</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "3px",
                                background:
                                  "linear-gradient(135deg, #6b7280, #4b5563)",
                              }}
                            ></div>
                            <span>Past</span>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(100px, 1fr))",
                            gap: "10px",
                            maxHeight: "300px",
                            overflowY: "auto",
                            padding: "10px",
                            background: "rgba(255, 255, 255, 0.03)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {timeSlots.map((slot, index) => {
                            // Fix the isSelected comparison to handle local datetime properly
                            const slotLocalString = (() => {
                              const d = new Date(slot.time);
                              const year = d.getFullYear();
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0",
                              );
                              const day = String(d.getDate()).padStart(2, "0");
                              const hours = String(d.getHours()).padStart(
                                2,
                                "0",
                              );
                              const minutes = String(d.getMinutes()).padStart(
                                2,
                                "0",
                              );
                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            })();

                            const isSelected =
                              formData.appointmentDateTime === slotLocalString;

                            return (
                              <button
                                key={index}
                                type="button"
                                disabled={slot.isBooked || slot.isPast}
                                onClick={() => {
                                  const localDateTime = new Date(slot.time);
                                  const year = localDateTime.getFullYear();
                                  const month = String(
                                    localDateTime.getMonth() + 1,
                                  ).padStart(2, "0");
                                  const day = String(
                                    localDateTime.getDate(),
                                  ).padStart(2, "0");
                                  const hours = String(
                                    localDateTime.getHours(),
                                  ).padStart(2, "0");
                                  const minutes = String(
                                    localDateTime.getMinutes(),
                                  ).padStart(2, "0");
                                  const localString = `${year}-${month}-${day}T${hours}:${minutes}`;

                                  setFormData({
                                    ...formData,
                                    appointmentDateTime: localString,
                                  });
                                }}
                                style={{
                                  padding: "12px 8px",
                                  borderRadius: "10px",
                                  border: isSelected
                                    ? "2px solid #6366f1"
                                    : "1px solid rgba(255, 255, 255, 0.2)",
                                  background: slot.isPast
                                    ? "linear-gradient(135deg, #6b7280, #4b5563)"
                                    : slot.isBooked
                                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                      : isSelected
                                        ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                                        : "linear-gradient(135deg, #10b981, #059669)",
                                  color: "white",
                                  cursor:
                                    slot.isBooked || slot.isPast
                                      ? "not-allowed"
                                      : "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  opacity:
                                    slot.isBooked || slot.isPast ? 0.6 : 1,
                                  transition: "all 0.2s",
                                  boxShadow: isSelected
                                    ? "0 4px 12px rgba(99, 102, 241, 0.4)"
                                    : "none",
                                }}
                                onMouseEnter={(e) => {
                                  if (!slot.isBooked && !slot.isPast) {
                                    e.currentTarget.style.transform =
                                      "scale(1.05)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 12px rgba(16, 185, 129, 0.4)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!slot.isBooked && !slot.isPast) {
                                    e.currentTarget.style.transform =
                                      "scale(1)";
                                    e.currentTarget.style.boxShadow = isSelected
                                      ? "0 4px 12px rgba(99, 102, 241, 0.4)"
                                      : "none";
                                  }
                                }}
                              >
                                {slot.display}
                                {slot.isPast && (
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      marginTop: "2px",
                                    }}
                                  >
                                    Past
                                  </div>
                                )}
                                {slot.isBooked && (
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      marginTop: "2px",
                                    }}
                                  >
                                    Booked
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            marginTop: "12px",
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "4px",
                                background:
                                  "linear-gradient(135deg, #10b981, #059669)",
                              }}
                            />
                            Available
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "4px",
                                background:
                                  "linear-gradient(135deg, #ef4444, #dc2626)",
                              }}
                            />
                            Booked
                          </div>
                        </div>

                        {/* Custom Time Toggle */}
                        <div style={{ marginTop: "16px" }}>
                          <button
                            type="button"
                            onClick={() => setUseCustomTime(!useCustomTime)}
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "10px",
                              border: "2px solid #6366f1",
                              background: useCustomTime
                                ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                                : "rgba(99, 102, 241, 0.1)",
                              color: useCustomTime ? "white" : "#6366f1",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              transition: "all 0.3s",
                            }}
                          >
                            {useCustomTime
                              ? "📅 Use Preset Slots"
                              : "🕐 Choose Any Time"}
                          </button>
                        </div>

                        {/* Custom Time Input with Conflict Check */}
                        {useCustomTime && (
                          <div style={{ marginTop: "16px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "12px",
                                fontSize: "0.8rem",
                                fontWeight: 800,
                                color: "#94a3b8",
                              }}
                            >
                              ENTER CUSTOM TIME
                            </label>
                            {(() => {
                              // Check if selected custom time conflicts with bookings OR is in the past
                              const checkTimeConflict = () => {
                                if (!formData.appointmentDateTime)
                                  return { hasConflict: false, isPast: false };

                                const selectedStart = new Date(
                                  formData.appointmentDateTime,
                                );
                                const selectedEnd = new Date(
                                  selectedStart.getTime() +
                                    (formData.durationMinutes || 30) * 60000,
                                );

                                // Check if time is in the past
                                const now = new Date();
                                const selectedDate = new Date(
                                  formData.appointmentDateTime.split("T")[0],
                                );
                                const isToday =
                                  selectedDate.toDateString() ===
                                  now.toDateString();
                                const isPast = isToday && selectedStart < now;

                                // Check for booking conflicts
                                const hasConflict = bookedSlots.some((apt) => {
                                  const aptStart = new Date(apt.date);
                                  const aptEnd = new Date(
                                    apt.end ||
                                      aptStart.getTime() +
                                        (apt.durationMinutes || 30) * 60000,
                                  );
                                  return (
                                    (selectedStart >= aptStart &&
                                      selectedStart < aptEnd) ||
                                    (selectedEnd > aptStart &&
                                      selectedEnd <= aptEnd) ||
                                    (selectedStart <= aptStart &&
                                      selectedEnd >= aptEnd)
                                  );
                                });

                                return { hasConflict, isPast };
                              };

                              const { hasConflict, isPast } =
                                checkTimeConflict();
                              const selectedTime = formData.appointmentDateTime
                                ? new Date(
                                    formData.appointmentDateTime,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "";
                              const endTime = formData.appointmentDateTime
                                ? new Date(
                                    new Date(
                                      formData.appointmentDateTime,
                                    ).getTime() +
                                      (formData.durationMinutes || 30) * 60000,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "";

                              return (
                                <>
                                  <GlassInput
                                    type="time"
                                    value={
                                      formData.appointmentDateTime
                                        ? (() => {
                                            const dt = new Date(
                                              formData.appointmentDateTime,
                                            );
                                            const hours = dt
                                              .getHours()
                                              .toString()
                                              .padStart(2, "0");
                                            const minutes = dt
                                              .getMinutes()
                                              .toString()
                                              .padStart(2, "0");
                                            return `${hours}:${minutes}`;
                                          })()
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const timeValue = e.target.value;
                                      const dateValue =
                                        formData.appointmentDateTime
                                          ? formData.appointmentDateTime.split(
                                              "T",
                                            )[0]
                                          : new Date()
                                              .toISOString()
                                              .split("T")[0];
                                      if (timeValue) {
                                        setFormData({
                                          ...formData,
                                          appointmentDateTime: `${dateValue}T${timeValue}`,
                                        });
                                      }
                                    }}
                                    disabled={hasConflict || isPast}
                                    style={{
                                      fontSize: "1.2rem",
                                      textAlign: "center",
                                      padding: "1.3rem",
                                      border:
                                        hasConflict || isPast
                                          ? "2px solid #ef4444"
                                          : "1px solid rgba(255, 255, 255, 0.1)",
                                      background:
                                        hasConflict || isPast
                                          ? "rgba(239, 68, 68, 0.1)"
                                          : "rgba(255, 255, 255, 0.05)",
                                      cursor:
                                        hasConflict || isPast
                                          ? "not-allowed"
                                          : "pointer",
                                      opacity: hasConflict || isPast ? 0.6 : 1,
                                    }}
                                  />

                                  {formData.appointmentDateTime && (
                                    <div
                                      style={{
                                        marginTop: "12px",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        background:
                                          hasConflict || isPast
                                            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))"
                                            : "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
                                        border:
                                          hasConflict || isPast
                                            ? "1px solid rgba(239, 68, 68, 0.4)"
                                            : "1px solid rgba(16, 185, 129, 0.4)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: "0.75rem",
                                          fontWeight: 700,
                                          color:
                                            hasConflict || isPast
                                              ? "#ef4444"
                                              : "#10b981",
                                          marginBottom: "6px",
                                        }}
                                      >
                                        {isPast
                                          ? "⏰ TIME HAS PASSED"
                                          : hasConflict
                                            ? "❌ TIME SLOT CONFLICT"
                                            : "✅ TIME SLOT AVAILABLE"}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.85rem",
                                          color: "white",
                                        }}
                                      >
                                        <strong>Duration:</strong>{" "}
                                        {selectedTime} - {endTime}
                                        <br />
                                        <strong>Length:</strong>{" "}
                                        {formData.durationMinutes || 30} minutes
                                      </div>
                                      {isPast && (
                                        <div
                                          style={{
                                            marginTop: "8px",
                                            fontSize: "0.75rem",
                                            color: "#fca5a5",
                                          }}
                                        >
                                          ⚠️ This time has already passed.
                                          Please choose a future time.
                                        </div>
                                      )}
                                      {hasConflict && !isPast && (
                                        <div
                                          style={{
                                            marginTop: "8px",
                                            fontSize: "0.75rem",
                                            color: "#fca5a5",
                                          }}
                                        >
                                          ⚠️ This time overlaps with an existing
                                          appointment. Please choose a different
                                          time.
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                            <div
                              style={{
                                marginTop: "12px",
                                fontSize: "0.7rem",
                                color: "#94a3b8",
                                textAlign: "center",
                              }}
                            >
                              💡 Select any time - system will check for
                              conflicts automatically
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <PreviewCard>
                      <div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            color: "#6366f1",
                          }}
                        >
                          SYSTEM TIME ({formData.timezone})
                        </div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                          {currentTimeInTz}
                        </div>
                      </div>
                      <Activity color="#6366f1" size={32} />
                    </PreviewCard>
                  </motion.div>
                )}

                {/* STEP 3: FINAL CONFIRMATION */}
                {step === 3 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: "center" }}
                  >
                    <ShieldCheck
                      size={80}
                      color="#10b981"
                      style={{ marginBottom: "1.5rem" }}
                    />
                    <h3>Ready to Book?</h3>
                    <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
                      Review your details. By clicking "Lock Appointment", you
                      confirm that the provided medical data is accurate.
                    </p>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        padding: "1.5rem",
                        borderRadius: "20px",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Patient:</span>
                        <span style={{ fontWeight: 700 }}>
                          {formData.firstName} {formData.lastName}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Dept:</span>
                        <span style={{ fontWeight: 700 }}>
                          {formData.department}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "3rem",
                  }}
                >
                  {step > 1 && (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "1rem 2rem",
                        borderRadius: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Back
                    </motion.button>
                  )}
                  {step < 3 ? (
                    <ActionButton
                      type="button"
                      onClick={nextStep}
                      style={{ marginLeft: "auto" }}
                    >
                      Next Phase <Zap size={18} fill="currentColor" />
                    </ActionButton>
                  ) : (
                    <ActionButton
                      type="submit"
                      disabled={isSubmitting || lockedAppointment}
                      style={{ width: "100%" }}
                    >
                      {isSubmitting ? (
                        "Syncing Data..."
                      ) : lockedAppointment ? (
                        <>
                          Locked <FaLock />
                        </>
                      ) : isPhysicalOnSite ? (
                        "Lock Payment"
                      ) : (
                        "Lock Appointment"
                      )}{" "}
                      <FaCheck />
                    </ActionButton>
                  )}
                </div>
              </form>
            </ModalBox>
          </Overlay>
        )}
      </AnimatePresence>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          appointmentId={createdAppointmentId}
          appointmentData={{
            patientName: `${formData.firstName} ${formData.lastName}`,
            patientEmail: formData.email,
            phone: formData.mobileNumber,
            cnic: formData.nic,
            department: formData.department,
            doctor: formData.doctor,
            address: formData.address,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            notes: `Duration: ${formData.durationMinutes} mins`,
            visitedBefore: formData.visitedBefore === "yes",
            date: new Date(formData.appointmentDateTime),
            end: new Date(
              new Date(formData.appointmentDateTime).getTime() +
                formData.durationMinutes * 60000,
            ),
          }}
          amount={paymentAmount}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPayment(false);
            setStep(1);
          }}
        />
      )}

      {showInvoiceModal && (
        <AnimatePresence mode="wait">
          <Overlay
            key="invoice-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeInvoice}
          >
            <ModalBox
              key="invoice-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              style={{ maxWidth: 800 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>Invoice Preview</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={closeInvoice}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  <FaTimes />
                </motion.button>
              </div>

              <div
                style={{ marginTop: 12, maxHeight: "60vh", overflow: "auto" }}
              >
                {invoiceHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: invoiceHtml }}
                    style={{ background: "white", color: "#111", padding: 16 }}
                  />
                ) : (
                  <div>No invoice available</div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <ActionButton type="button" onClick={downloadInvoicePdf}>
                  <FaDownload />
                  &nbsp;Download PDF
                </ActionButton>
                <ActionButton type="button" onClick={closeInvoice}>
                  Close
                </ActionButton>
              </div>
            </ModalBox>
          </Overlay>
        </AnimatePresence>
      )}
    </>
  );
};

export default AppointmentModal;
