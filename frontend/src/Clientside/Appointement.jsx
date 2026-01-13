import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaVenusMars,
  FaUserMd,
  FaGlobe,
  FaHistory,
  FaHospital,
} from "react-icons/fa";
import { jsonFetch } from "../utils/api";

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 12px;
  padding: clamp(1rem, 2.5vw, 2rem);
  width: 92%;
  max-width: 760px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(15, 23, 42, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
`;

const ModalTitle = styled.h2`
  color: #0d6efd;
  margin: 0;
  font-size: 1.6rem;
  letter-spacing: -0.02em;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: rgba(34, 34, 34, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: 6px;

  &:hover {
    background: rgba(13, 110, 253, 0.06);
    color: #0d6efd;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.35rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.95rem;
`;

const RequiredStar = styled.span`
  color: #e53935;
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  border: 1px solid ${(props) => (props.hasError ? "#f44336" : "#e6e9ef")};
  border-radius: 8px;
  font-size: 0.98rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#f44336" : "#0d6efd")};
    box-shadow: 0 6px 18px rgba(13, 110, 253, 0.08);
  }
`;

const Select = styled.select`
  padding: 0.85rem 1rem;
  border: 1px solid ${(props) => (props.hasError ? "#f44336" : "#e6e9ef")};
  border-radius: 8px;
  font-size: 0.98rem;
  background: white;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#f44336" : "#0d6efd")};
    box-shadow: 0 6px 18px rgba(13, 110, 253, 0.08);
  }
`;

const TextArea = styled.textarea`
  padding: 0.9rem 1rem;
  border: 1px solid ${(props) => (props.hasError ? "#f44336" : "#e6e9ef")};
  border-radius: 8px;
  font-size: 0.98rem;
  min-height: 110px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#f44336" : "#0d6efd")};
    box-shadow: 0 6px 18px rgba(13, 110, 253, 0.08);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const ErrorMessage = styled.span`
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, #0d6efd, #4f46e5);
  color: white;
  border: none;
  padding: 0.95rem 1.6rem;
  border-radius: 10px;
  font-size: 1.02rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.12);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 26px rgba(79, 70, 229, 0.14);
  }

  &:disabled {
    background: #c7d2fe;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// Toast Animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Toast = styled.div`
  background: ${(props) => (props.type === "success" ? "#4caf50" : "#e53935")};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${(props) => (props.isClosing ? slideOut : slideIn)} 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 300px;
  cursor: pointer;
`;

const ToastIcon = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
`;

const PreviewBox = styled.div`
  background: #ffffff;
  border: 1px solid #e6e9ee;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  margin-top: 0.6rem;
  box-shadow: 0 4px 14px rgba(20, 20, 40, 0.04);
  color: #111;
`;

const IconSmall = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: rgba(17, 24, 39, 0.7);
  font-size: 0.95rem;
`;

// Validation Regex Patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  mobile: /^\+?[\d\s-]{10,}$/,
  nic: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$|^[0-9]{13}$/,
  name: /^[A-Za-z\s]{2,50}$/,
  date: /^\d{2}\/\d{2}\/\d{4}$/,
};

// Error Messages
const ERROR_MESSAGES = {
  required: "This field is required",
  invalidEmail: "Please enter a valid email address",
  invalidMobile: "Please enter a valid mobile number",
  invalidNIC: "Please enter a valid NIC format (XXXXX-XXXXXXX-X or 13 digits)",
  invalidName: "Name should contain only letters and spaces (2-50 characters)",
  invalidDate: "Please enter date in DD/MM/YYYY format",
  futureDate: "Appointment date must be in the future",
};

const AppointmentModal = ({ isOpen, onClose, showSuccess, showError }) => {
  // Build timezone list: prefer Intl.supportedValuesOf('timeZone') when available,
  // otherwise fall back to a curated list of major IANA time zones.
  const allTimezones = useMemo(() => {
    try {
      if (
        typeof Intl !== "undefined" &&
        typeof Intl.supportedValuesOf === "function"
      ) {
        const tz = Intl.supportedValuesOf("timeZone");
        if (Array.isArray(tz) && tz.length > 0) return tz;
      }
    } catch (e) {
      console.warn(
        "Intl.supportedValuesOf('timeZone') not supported, using fallback list.",
        e
      );
      // ignore and use fallback
    }

    return [
      "UTC",
      "Europe/London",
      "Europe/Dublin",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Madrid",
      "Europe/Rome",
      "Europe/Amsterdam",
      "Europe/Zurich",
      "Europe/Stockholm",
      "Europe/Moscow",
      "Africa/Cairo",
      "Africa/Johannesburg",
      "Asia/Dubai",
      "Asia/Jerusalem",
      "Asia/Tehran",
      "Asia/Kuwait",
      "Asia/Karachi",
      "Asia/Kolkata",
      "Asia/Kathmandu",
      "Asia/Dhaka",
      "Asia/Colombo",
      "Asia/Bangkok",
      "Asia/Jakarta",
      "Asia/Singapore",
      "Asia/Kuala_Lumpur",
      "Asia/Shanghai",
      "Asia/Hong_Kong",
      "Asia/Tokyo",
      "Asia/Seoul",
      "Australia/Sydney",
      "Australia/Melbourne",
      "Pacific/Auckland",
      "Pacific/Honolulu",
      "America/Anchorage",
      "America/Los_Angeles",
      "America/Denver",
      "America/Chicago",
      "America/New_York",
      "America/Toronto",
      "America/Halifax",
      "America/Sao_Paulo",
      "America/Buenos_Aires",
      "America/Mexico_City",
      "America/Bogota",
      "America/Lima",
      "Atlantic/Reykjavik",
    ];
  }, []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);

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

  const formatForInput = (date) => {
    if (!date) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // When timezone changes, prefill the appointment datetime with current time (rounded)
  useEffect(() => {
    if (!formData.timezone) return;
    try {
      const tz = formData.timezone;
      // Get the current date/time parts in the target timezone
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());

      const map = {};
      parts.forEach((p) => {
        if (p.type && p.value) map[p.type] = p.value;
      });

      const year = Number(map.year);
      const month = Number(map.month);
      const day = Number(map.day);
      const hour = Number(map.hour);
      const minute = Number(map.minute);

      // Construct a Date using these components as LOCAL time so the input shows the timezone's clock
      const displayDate = new Date(year, month - 1, day, hour, minute, 0, 0);

      // Round minutes to nearest 5
      const mins = Math.ceil(displayDate.getMinutes() / 5) * 5;
      displayDate.setMinutes(mins, 0, 0);

      setFormData((prev) => ({
        ...prev,
        appointmentDateTime: formatForInput(displayDate),
      }));
    } catch (err) {
      console.log(err);
      // Fallback to current local time rounding
      const now = new Date();
      const mins = Math.ceil(now.getMinutes() / 5) * 5;
      now.setMinutes(mins, 0, 0);
      setFormData((prev) => ({
        ...prev,
        appointmentDateTime: formatForInput(now),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.timezone]);

  // Using App-level toasts (showSuccess/showError) instead of modal-local toasts

  // Validation Functions
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) return ERROR_MESSAGES.required;
        if (!VALIDATION_PATTERNS.name.test(value))
          return ERROR_MESSAGES.invalidName;
        return "";

      case "email":
        if (!value.trim()) return ERROR_MESSAGES.required;
        if (!VALIDATION_PATTERNS.email.test(value))
          return ERROR_MESSAGES.invalidEmail;
        return "";

      case "mobileNumber":
        if (!value.trim()) return ERROR_MESSAGES.required;
        if (!VALIDATION_PATTERNS.mobile.test(value))
          return ERROR_MESSAGES.invalidMobile;
        return "";

      case "nic":
        if (!value.trim()) return ERROR_MESSAGES.required;
        if (!VALIDATION_PATTERNS.nic.test(value))
          return ERROR_MESSAGES.invalidNIC;
        return "";

      case "dateOfBirth":
        if (!value.trim()) return ERROR_MESSAGES.required;
        if (!VALIDATION_PATTERNS.date.test(value))
          return ERROR_MESSAGES.invalidDate;
        return "";

      case "appointmentDateTime": {
        if (!value) return ERROR_MESSAGES.required;
        // value is local datetime string from input[type=datetime-local]
        const appt = new Date(value);
        if (Number.isNaN(appt.getTime())) return ERROR_MESSAGES.invalidDate;
        if (appt <= new Date()) return ERROR_MESSAGES.futureDate;
        return "";
      }

      case "gender":
      case "department":
      case "doctor":
      case "visitedBefore":
        if (!value.trim()) return ERROR_MESSAGES.required;
        return "";

      case "address":
        if (!value.trim()) return ERROR_MESSAGES.required;
        if (value.trim().length < 10)
          return "Address must be at least 10 characters";
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (typeof showError === "function")
        showError("Please fix the errors in the form");
      else console.warn("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentName = `${formData.firstName || ""}${
        formData.lastName ? ` ${formData.lastName}` : ""
      }`.trim();

      const toIsoDate = (value) => {
        if (!value) return undefined;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
      };

      const payload = {
        patientName: appointmentName,
        patientEmail: formData.email,
        cnic: formData.nic,
        phone: formData.mobileNumber,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: toIsoDate(formData.dateOfBirth),
        department: formData.department,
        doctor: formData.doctor,
        date: toIsoDate(formData.appointmentDateTime),
        durationMinutes: Number(formData.durationMinutes) || 30,
        timezone: formData.timezone,
        visitedBefore: formData.visitedBefore === "yes",
        notes: `Booked online via website at ${new Date().toISOString()}`,
      };

      console.log("[APPOINTMENT MODAL] Submitting appointment", payload);
      await jsonFetch("/api/appointments", {
        method: "POST",
        body: payload,
      });

      const name = `${formData.firstName || ""}${
        formData.lastName ? " " + formData.lastName : ""
      }`.trim();
      if (typeof showSuccess === "function") {
        showSuccess(
          `Thank you ${name || "guest"} for booking your appointment!`
        );
      }

      // Reset form
      setFormData({
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

      onClose();
    } catch (err) {
      console.error(err);
      if (typeof showError === "function") {
        // Surface server-provided message when available
        const msg =
          err?.data?.message ||
          err.message ||
          "Failed to book appointment. Please try again.";
        showError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await jsonFetch("/api/doctors");
        console.log("[APPOINTMENT MODAL] Doctors fetched", response);
        setAvailableDoctors(response?.doctors || []);
      } catch (err) {
        console.error("[APPOINTMENT MODAL] Failed to load doctors", err);
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const doctorsByDepartment = useMemo(() => {
    return (availableDoctors || []).reduce((acc, doc) => {
      const dept = doc.department || "General";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(doc.name || doc.fullName || doc.doctorName || doc.email);
      return acc;
    }, {});
  }, [availableDoctors]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Precompute slot preview text to avoid inline IIFEs in JSX
  const slotText = useMemo(() => {
    if (!formData.appointmentDateTime) return null;
    try {
      const start = new Date(formData.appointmentDateTime);
      const end = new Date(
        start.getTime() + (Number(formData.durationMinutes) || 30) * 60000
      );
      const opts = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: formData.timezone || undefined,
      };
      const s = new Intl.DateTimeFormat(undefined, opts).format(start);
      const e = new Intl.DateTimeFormat(undefined, opts).format(end);
      return `Slot: ${s} to ${e}`;
    } catch (err) {
      console.error("Failed to compute slot text", err);
      return null;
    }
  }, [
    formData.appointmentDateTime,
    formData.durationMinutes,
    formData.timezone,
  ]);

  // Current time formatted in selected timezone (updates when timezone changes)
  const currentTimeInTz = useMemo(() => {
    try {
      const tz =
        formData.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        undefined;
      const opts = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: tz,
      };
      return new Intl.DateTimeFormat(undefined, opts).format(new Date());
    } catch (err) {
      console.error("Failed to compute current time in timezone", err);
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    }
  }, [formData.timezone]);

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Book an Appointment</ModalTitle>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit} noValidate>
            {/* Personal Information */}
            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaUser />
                  </IconSmall>
                  First Name <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.firstName}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.firstName}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaUser />
                  </IconSmall>
                  Last Name <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.lastName}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.lastName}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaEnvelope />
                  </IconSmall>
                  Email <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.email}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.email}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaPhone />
                  </IconSmall>
                  Mobile Number <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.mobileNumber}
                  placeholder="Enter mobile number"
                />
                {errors.mobileNumber && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.mobileNumber}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaIdCard />
                  </IconSmall>
                  NIC <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.nic}
                  placeholder="XXXXX-XXXXXXX-X or 13 digits"
                />
                {errors.nic && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.nic}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaCalendarAlt />
                  </IconSmall>
                  Date of Birth <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.dateOfBirth}
                  placeholder="DD/MM/YYYY"
                />
                {errors.dateOfBirth && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.dateOfBirth}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            {/* Appointment Details */}
            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaVenusMars />
                  </IconSmall>
                  Select Gender <RequiredStar>*</RequiredStar>
                </Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.gender}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                {errors.gender && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.gender}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaHospital />
                  </IconSmall>
                  Department <RequiredStar>*</RequiredStar>
                </Label>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.department}
                >
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                </Select>
                {errors.department && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.department}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaUserMd />
                  </IconSmall>
                  Select Doctor <RequiredStar>*</RequiredStar>
                </Label>
                <Select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.doctor}
                >
                  <option value="">Select Doctor</option>
                  {doctorsByDepartment[formData.department]?.length ? (
                    doctorsByDepartment[formData.department].map((doctor) => (
                      <option key={doctor} value={doctor}>
                        {doctor}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No doctors available
                    </option>
                  )}
                </Select>
                {errors.doctor && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.doctor}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaGlobe />
                  </IconSmall>
                  Timezone
                </Label>
                <Select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                >
                  <option value="">(Detect / Select timezone)</option>
                  {allTimezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaClock />
                  </IconSmall>
                  Duration (minutes) <RequiredStar>*</RequiredStar>
                </Label>
                <Select
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                >
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaCalendarAlt />
                  </IconSmall>
                  Appointment Date & Time <RequiredStar>*</RequiredStar>
                </Label>
                <Input
                  type="datetime-local"
                  name="appointmentDateTime"
                  value={formData.appointmentDateTime}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.appointmentDateTime}
                  placeholder="Select date and time"
                />
                {errors.appointmentDateTime && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.appointmentDateTime}
                  </ErrorMessage>
                )}
                <PreviewBox>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                    Current time in{" "}
                    {formData.timezone ||
                      Intl.DateTimeFormat().resolvedOptions().timeZone ||
                      "Local"}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
                    {currentTimeInTz}
                  </div>
                  {slotText && (
                    <div style={{ marginTop: 8, fontSize: 15, color: "#333" }}>
                      {slotText}
                    </div>
                  )}
                </PreviewBox>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaMapMarkerAlt />
                  </IconSmall>
                  Address <RequiredStar>*</RequiredStar>
                </Label>
                <TextArea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  hasError={!!errors.address}
                  placeholder="Enter your complete address"
                />
                {errors.address && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.address}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <IconSmall>
                    <FaHistory />
                  </IconSmall>
                  Have you visited before? <RequiredStar>*</RequiredStar>
                </Label>
                <RadioGroup>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name="visitedBefore"
                      value="yes"
                      checked={formData.visitedBefore === "yes"}
                      onChange={handleInputChange}
                    />
                    Yes
                  </RadioLabel>
                  <RadioLabel>
                    <RadioInput
                      type="radio"
                      name="visitedBefore"
                      value="no"
                      checked={formData.visitedBefore === "no"}
                      onChange={handleInputChange}
                    />
                    No
                  </RadioLabel>
                </RadioGroup>
                {errors.visitedBefore && (
                  <ErrorMessage>
                    <FaExclamationTriangle />
                    {errors.visitedBefore}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormRow>

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaCheck />
                  Booking Appointment...
                </>
              ) : (
                <>
                  <FaCheck />
                  GET APPOINTMENT
                </>
              )}
            </SubmitButton>
          </Form>
        </ModalContainer>
      </ModalOverlay>

      {/* toasts are displayed by App via react-toastify (showSuccess/showError) */}
    </>
  );
};

export default AppointmentModal;
