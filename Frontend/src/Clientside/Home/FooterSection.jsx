import React, { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components"; // Added css helper
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import SectionWithScene from "../SectionWithScene.jsx";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaChevronUp,
  FaHeartbeat,
  FaWaveSquare,
} from "react-icons/fa";

// --- 1. Define Keyframes First ---
const orbit = keyframes`
  from { transform: rotate(0deg) translateX(15px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
`;

const scanLine = keyframes`
  0% { top: -100%; }
  100% { top: 100%; }
`;

// --- 2. Create Styled Components (Move Animations Here) ---

// This fixes the error! We apply the animation inside the styled component, not inline.
const AnimatedHeart = styled(FaHeartbeat)`
  font-size: 2.5rem;
  color: #6366f1;
  /* Use the keyframe here */
  animation: ${orbit} 4s linear infinite;
`;

const FooterWrapper = styled.footer`
  background: #020617;
  padding: 100px 20px 40px;
  position: relative;
  overflow: hidden;
  perspective: 2000px;
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 35px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(99, 102, 241, 0.5),
      transparent
    );
    /* This is also safe because it is inside a styled template literal */
    animation: ${scanLine} 4s linear infinite;
    opacity: 0.3;
  }
`;

// ... keep other styled components (MouseGlow, MagneticBtn, etc.) same as before ...
const MouseGlow = styled(motion.div)`
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
`;

const MainGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 30px;
  position: relative;
  z-index: 2;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const MagneticBtn = styled(motion.button)`
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScrollTopBtn = styled(motion.div)`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 100;
`;

const MagneticElement = ({ children, strength = 0.5 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  const handleMouseMove = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((e.clientX - (left + width / 2)) * strength);
    y.set((e.clientY - (top + height / 2)) * strength);
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const FooterSection = ({ onBookAppointment }) => {
  const [showScroll, setShowScroll] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 300);
      mouseY.set(e.clientY - 300);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <SectionWithScene opacity={0.9}>
      <FooterWrapper>
        <MouseGlow style={{ left: mouseX, top: mouseY }} />

        <MainGrid>
          <GlassCard whileHover={{ rotateY: -10, rotateX: 5 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {/* Using the new Styled Component instead of inline style animation */}
              <AnimatedHeart />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src="/logo.png"
                  alt="ZeeCare"
                  style={{ width: 56, height: 56, objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "900",
                    letterSpacing: "-1px",
                    color: "#fff",
                  }}
                >
                  ZEECARE
                </h2>
              </div>
            </div>
            <p
              style={{
                color: "#94a3b8",
                lineHeight: "1.8",
                marginBottom: "30px",
              }}
            >
              Pioneering the next generation of precision medicine.
            </p>
            <MagneticElement strength={0.3}>
              <MagneticBtn
                onClick={onBookAppointment}
                whileHover={{ scale: 1.05 }}
              >
                <FaWaveSquare /> Rapid Appointment
              </MagneticBtn>
            </MagneticElement>
          </GlassCard>

          {/* ... Rest of the grid sections (Explore, Status, Support) same as before ... */}
          <GlassCard>
            <h3 style={{ color: "#6366f1", marginBottom: "20px" }}>
              Navigation
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {["Dashboard", "Clinics", "Specialists"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ x: 10, color: "#fff" }}
                  style={{ color: "#64748b", textDecoration: "none" }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: "#6366f1", marginBottom: "20px" }}>
              Live Status
            </h3>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                padding: "12px",
                borderRadius: "12px",
                color: "#10b981",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              ● SYSTEM OPERATIONAL
            </div>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: "#6366f1", marginBottom: "20px" }}>
              Reach Support
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                color: "#94a3b8",
              }}
            >
              <div>
                <FaPhoneAlt /> 919-979-9999
              </div>
              <div>
                <FaEnvelope /> care@zeecare.com
              </div>
            </div>
          </GlassCard>
        </MainGrid>

        <AnimatePresence>
          {showScroll && (
            <ScrollTopBtn
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <FaChevronUp />
            </ScrollTopBtn>
          )}
        </AnimatePresence>

        <div
          style={{
            textAlign: "center",
            marginTop: "80px",
            color: "#475569",
            fontSize: "0.8rem",
          }}
        >
          &copy; {new Date().getFullYear()} ZEECARE MEDICAL • VERSION 4.0.2
        </div>
      </FooterWrapper>
    </SectionWithScene>
  );
};

export default FooterSection;
