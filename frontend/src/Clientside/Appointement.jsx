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
} from "react-icons/fa";
import { Zap, Activity, ShieldCheck } from "lucide-react";
import PaymentModal from "./PaymentModal";

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
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  justify-content: center;
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
`;

// --- 3. The Main Component Logic ---
const AppointmentModal = ({ isOpen, onClose, showSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    nic: "",
    dateOfBirth: "",
    gender: "",
    appointmentDateTime: "",
    department: "Pediatrics",
    doctor: "",
    durationMinutes: 30,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    address: "",
    visitedBefore: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount] = useState(50); // Default $50 for appointment
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetch("/api/doctors");
        console.log("[DOCTORS API] Response status:", response.status);

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const text = await response.text();
        console.log("[DOCTORS API] Raw response:", text);

        if (!text) {
          console.error("[DOCTORS API] Empty response");
          return;
        }

        const data = JSON.parse(text);
        console.log("[DOCTORS API] Parsed response:", data);

        if (data.ok && data.doctors) {
          console.log("[DOCTORS API] Fetched doctors:", data.doctors);
          setAllDoctors(data.doctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Filter doctors based on selected department
  const filteredDoctors = useMemo(() => {
    const filtered = allDoctors.filter(
      (doctor) =>
        doctor.department &&
        doctor.department.toLowerCase() === formData.department.toLowerCase()
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Show payment modal instead of direct submission
    setShowPayment(true);
    setIsSubmitting(false);
  };

  const handlePaymentSuccess = () => {
    showSuccess("Appointment Booked & Payment Completed!");
    setShowPayment(false);
    onClose();
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
                {/* STEP 1: PERSONAL DETAILS */}
                {step === 1 && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
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
                        EMAIL ADDRESS
                      </label>
                      <GlassInput
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 0.8fr",
                        gap: "1.5rem",
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
                          CNIC / NIC
                        </label>
                        <GlassInput
                          name="nic"
                          value={formData.nic}
                          onChange={handleInputChange}
                          placeholder="12345-6789012-3"
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
                          }}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: CLINIC DETAILS */}
                {step === 2 && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
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
                          DEPARTMENT
                        </label>
                        <GlassInput
                          as="select"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                        >
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
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
                          DOCTOR
                        </label>
                        <GlassInput
                          as="select"
                          name="doctor"
                          value={formData.doctor}
                          onChange={handleInputChange}
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
                              {doc.name}
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
                        SCHEDULE DATETIME
                      </label>
                      <GlassInput
                        type="datetime-local"
                        name="appointmentDateTime"
                        value={formData.appointmentDateTime}
                        onChange={handleInputChange}
                      />
                    </div>

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
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    >
                      {isSubmitting ? "Syncing Data..." : "Lock Appointment"}{" "}
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
                formData.durationMinutes * 60000
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
    </>
  );
};

export default AppointmentModal;
