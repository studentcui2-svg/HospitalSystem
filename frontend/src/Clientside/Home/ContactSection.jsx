import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import SectionWithScene from "../SectionWithScene.jsx";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";
import { jsonFetch } from "../../utils/api";

// --- Styled Components (Glassmorphism + 3D) ---

const ContactContainer = styled.section`
  /* Mesh gradient background to make the glass pop */
  background: radial-gradient(
      at 0% 0%,
      rgba(79, 70, 229, 0.15) 0,
      transparent 50%
    ),
    radial-gradient(at 100% 100%, rgba(126, 34, 206, 0.15) 0, transparent 50%),
    #f8fafc;
  padding: clamp(4rem, 8vw, 10rem) 2rem;
  overflow: hidden;
  perspective: 2000px;
`;

const GlassWrapper = styled(motion.div)`
  max-width: 1100px;
  margin: 0 auto;

  /* Glassmorphism Core */
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.7);

  border-radius: 40px;
  padding: clamp(2rem, 5vw, 5rem);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 4rem;
  transform-style: preserve-3d;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const InfoCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #4f46e5;
  }
`;

const IconBox = styled.div`
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
`;

const FormPane = styled.div`
  background: rgba(255, 255, 255, 0.7);
  padding: 2.5rem;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: 1.1rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 15px;
  background: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }
`;

const TextArea = styled(motion.textarea)`
  width: 100%;
  padding: 1.1rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 15px;
  background: white;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  border: none;
  padding: 1.2rem;
  border-radius: 18px;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(79, 70, 229, 0.3);
`;

// --- Logic & Component ---

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await jsonFetch("/api/messages", {
        method: "POST",
        body: { ...formData, phone: formData.mobileNumber },
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionWithScene opacity={0.95}>
      <ContactContainer id="contact">
        <GlassWrapper
          initial={{ opacity: 0, y: 50, rotateX: 5 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Left Side: Interactive Contact Info */}
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: "#0f172a",
                marginBottom: "1.5rem",
              }}
            >
              Get In <span style={{ color: "#4f46e5" }}>Touch</span>
            </motion.h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  icon: <FaPhone />,
                  label: "Phone",
                  val: "919-979-9999",
                  color: "#4f46e5",
                },
                {
                  icon: <FaEnvelope />,
                  label: "Email",
                  val: "zee5eb@gmail.com",
                  color: "#7e22ce",
                },
                {
                  icon: <FaMapMarkerAlt />,
                  label: "Location",
                  val: "Kanichi, Pakistan",
                  color: "#3b82f6",
                },
              ].map((item, i) => (
                <InfoCard
                  key={i}
                  whileHover={{ scale: 1.05, x: 10, rotateY: 5 }}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <IconBox style={{ background: item.color }}>
                    {item.icon}
                  </IconBox>
                  <div>
                    <h4
                      style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}
                    >
                      {item.label}
                    </h4>
                    <p style={{ margin: 0, color: "#64748b", fontWeight: 500 }}>
                      {item.val}
                    </p>
                  </div>
                </InfoCard>
              ))}
            </div>
          </div>

          {/* Right Side: The Form */}
          <FormPane>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                name="mobileNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
              <TextArea
                name="message"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                required
              />

              <SubmitButton
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : isSuccess ? (
                  <>
                    <FaCheckCircle /> Message Sent!
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </SubmitButton>
            </form>
          </FormPane>
        </GlassWrapper>
      </ContactContainer>
    </SectionWithScene>
  );
};

export default ContactSection;
