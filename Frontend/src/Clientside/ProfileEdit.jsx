import React, { useState, useEffect } from "react";
import { motion as M, AnimatePresence } from "framer-motion";
import { X, User, Phone, IdCard, Calendar, Users, Save } from "lucide-react";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";

// Responsive styles
const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.85)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
    padding: "20px",
  },
  container: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "600px",
    color: "white",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  getContainerPadding: () => {
    if (window.innerWidth < 640) return "1.5rem";
    return "2rem";
  },
  title: {
    fontWeight: "900",
    marginBottom: "1.5rem",
    background: "linear-gradient(to right, #38bdf8, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  getTitleSize: () => {
    if (window.innerWidth < 640) return "1.5rem";
    return "1.8rem";
  },
  inputContainer: {
    marginBottom: "1.2rem",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  getLabelSize: () => {
    if (window.innerWidth < 640) return "0.7rem";
    return "0.75rem";
  },
  input: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },
  getInputPadding: () => {
    if (window.innerWidth < 640) return "0.75rem";
    return "0.9rem";
  },
  getInputFontSize: () => {
    if (window.innerWidth < 640) return "0.95rem";
    return "1rem";
  },
};

const ProfileEdit = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    phone: "",
    nic: "",
    gender: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const response = await jsonFetch("/api/auth/me");
      if (response && response.user) {
        const user = response.user;
        setFormData({
          name: user.name || "",
          fatherName: user.fatherName || "",
          phone: user.phone || "",
          nic: user.nic || "",
          gender: user.gender || "",
          dateOfBirth: user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().split("T")[0]
            : "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-format CNIC with dashes
    if (name === "nic") {
      const numbers = value.replace(/\D/g, "");
      let formatted = "";

      if (numbers.length <= 5) {
        formatted = numbers;
      } else if (numbers.length <= 12) {
        formatted = numbers.slice(0, 5) + "-" + numbers.slice(5);
      } else {
        formatted =
          numbers.slice(0, 5) +
          "-" +
          numbers.slice(5, 12) +
          "-" +
          numbers.slice(12, 13);
      }

      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await jsonFetch("/api/auth/profile", {
        method: "PUT",
        body: formData,
      });

      if (response && response.ok) {
        toast.success("Profile updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <M.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={modalStyles.overlay}
        onClick={onClose}
      >
        <M.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            ...modalStyles.container,
            padding: modalStyles.getContainerPadding(),
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
            }}
          >
            <X size={20} />
          </button>

          <h2
            style={{
              ...modalStyles.title,
              fontSize: modalStyles.getTitleSize(),
            }}
          >
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={modalStyles.inputContainer}>
              <label
                style={{
                  ...modalStyles.label,
                  fontSize: modalStyles.getLabelSize(),
                }}
              >
                <User size={14} style={{ display: "inline", marginRight: 6 }} />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  ...modalStyles.input,
                  padding: modalStyles.getInputPadding(),
                  fontSize: modalStyles.getInputFontSize(),
                }}
              />
            </div>

            <div style={modalStyles.inputContainer}>
              <label
                style={{
                  ...modalStyles.label,
                  fontSize: modalStyles.getLabelSize(),
                }}
              >
                <User size={14} style={{ display: "inline", marginRight: 6 }} />
                Father Name
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                style={{
                  ...modalStyles.input,
                  padding: modalStyles.getInputPadding(),
                  fontSize: modalStyles.getInputFontSize(),
                }}
              />
            </div>

            <div style={modalStyles.inputContainer}>
              <label
                style={{
                  ...modalStyles.label,
                  fontSize: modalStyles.getLabelSize(),
                }}
              >
                <Phone
                  size={14}
                  style={{ display: "inline", marginRight: 6 }}
                />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="03001234567"
                style={{
                  ...modalStyles.input,
                  padding: modalStyles.getInputPadding(),
                  fontSize: modalStyles.getInputFontSize(),
                }}
              />
            </div>

            <div style={modalStyles.inputContainer}>
              <label
                style={{
                  ...modalStyles.label,
                  fontSize: modalStyles.getLabelSize(),
                }}
              >
                <IdCard
                  size={14}
                  style={{ display: "inline", marginRight: 6 }}
                />
                CNIC Number
              </label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="35102-6522122-9"
                maxLength="15"
                style={{
                  ...modalStyles.input,
                  padding: modalStyles.getInputPadding(),
                  fontSize: modalStyles.getInputFontSize(),
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: windowWidth < 640 ? "1fr" : "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.2rem",
              }}
            >
              <div>
                <label
                  style={{
                    ...modalStyles.label,
                    fontSize: modalStyles.getLabelSize(),
                  }}
                >
                  <Calendar
                    size={14}
                    style={{ display: "inline", marginRight: 6 }}
                  />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={{
                    ...modalStyles.input,
                    padding: modalStyles.getInputPadding(),
                    fontSize: modalStyles.getInputFontSize(),
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    ...modalStyles.label,
                    fontSize: modalStyles.getLabelSize(),
                  }}
                >
                  <Users
                    size={14}
                    style={{ display: "inline", marginRight: 6 }}
                  />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    ...modalStyles.input,
                    padding: modalStyles.getInputPadding(),
                    fontSize: modalStyles.getInputFontSize(),
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: loading
                  ? "rgba(99, 102, 241, 0.5)"
                  : "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "1rem",
              }}
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </M.div>
      </M.div>
    </AnimatePresence>
  );
};

export default ProfileEdit;
