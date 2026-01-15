import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaLock,
  FaUserShield,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { jsonFetch } from "../utils/api";

// --- Styled Components with 3D Depth ---

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  perspective: 1000px; /* Crucial for 3D effects */
`;

const Box = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  padding: 2rem;
  border-radius: 24px;
  width: 92%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transform-style: preserve-3d;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
  transform: translateZ(30px); /* Pushes icon forward in 3D space */
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #0f172a, #334155);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const InputGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 2px solid #f1f5f9;
  background: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
  margin-top: 1rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #f1f5f9;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const AdminGate = ({ isOpen, onClose, onSuccess, showError, showSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: String(email || "")
          .trim()
          .toLowerCase(),
        password: String(password || "").trim(),
      };
      const res = await jsonFetch("/api/auth/login", {
        method: "POST",
        body: payload,
      });

      if (res && (res.user || res.role || res.token)) {
        if (onSuccess) onSuccess(res);
        if (typeof showSuccess === "function") showSuccess("Admin Verified");
      } else {
        const msg = res?.message || "Invalid Credentials";
        if (typeof showError === "function") showError(msg);
      }
    } catch (err) {
      console.error("[ADMIN GATE] Login failed", err);
      const message = err?.message || err?.data?.message || "Login Failed";
      if (typeof showError === "function") showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Box
          initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>

          <Header>
            <IconWrapper>
              <FaUserShield />
            </IconWrapper>
            <Title>Secure Access</Title>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                marginTop: "0.5rem",
              }}
            >
              Please enter your administrator keys.
            </p>
          </Header>

          <form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>ADMIN EMAIL</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@system.com"
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>PASSWORD</Label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 4,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </InputGroup>

            <Button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </Button>
          </form>
        </Box>
      </Overlay>
    </AnimatePresence>
  );
};

export default AdminGate;
