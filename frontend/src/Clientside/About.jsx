import React, { useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import SectionWithScene from "./SectionWithScene";
import {
  Target,
  Eye,
  Award,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sparkles,
  Activity,
  Zap,
  ShieldCheck,
  Microscope,
} from "lucide-react";

// --- 1. Advanced Keyframes (Properly defined) ---
const scan = keyframes`
  0% { top: -100%; }
  100% { top: 100%; }
`;

// --- 2. Styled Components ---

const AboutContainer = styled.section`
  padding: 120px 20px;
  background: #020617; /* Deepest dark for contrast */
  color: white;
  overflow: hidden;
  position: relative;
  perspective: 2000px;
`;

// Cyber-Medical Grid Background
const CyberGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 2px 2px,
    rgba(99, 102, 241, 0.1) 1px,
    transparent 0
  );
  background-size: 40px 40px;
  opacity: 0.5;
  pointer-events: none;
`;

const LayoutGrid = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 4rem;
  position: relative;
  z-index: 5;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const GlassPanel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 40px;
  padding: 3rem;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      transparent,
      rgba(99, 102, 241, 0.05),
      transparent
    );
    height: 100px;
    animation: ${scan} 6s linear infinite;
    pointer-events: none;
  }
`;

const SidebarGlass = styled(motion.aside)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 40px;
  padding: 3.5rem 2.5rem;
  height: fit-content;
  position: sticky;
  top: 100px;
  transform-style: preserve-3d;
  text-align: center;
`;

const FloatIcon = styled(motion.div)`
  position: absolute;
  color: rgba(99, 102, 241, 0.2);
  z-index: 1;
  pointer-events: none;
`;

// --- Magnetic Component Logic ---
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

const About = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax Logic
  const handleContainerMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const bgX = useTransform(mouseX, [0, 1920], [-30, 30]);
  const bgY = useTransform(mouseY, [0, 1080], [-30, 30]);

  return (
    <SectionWithScene>
      <AboutContainer onMouseMove={handleContainerMove}>
        <CyberGrid />

        {/* Floating Background Icons */}
        <FloatIcon
          style={{ top: "10%", left: "5%", x: bgX, y: bgY }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <Microscope size={120} />
        </FloatIcon>
        <FloatIcon
          style={{ bottom: "15%", right: "10%", x: bgY, y: bgX }}
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Activity size={100} />
        </FloatIcon>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: "center",
            marginBottom: "6rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <motion.div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#6366f1",
              fontSize: "0.8rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "1rem",
              border: "1px solid rgba(99,102,241,0.3)",
              padding: "5px 15px",
              borderRadius: "50px",
            }}
          >
            <Zap size={14} /> Medical Institute 4.0
          </motion.div>
          <h1
            style={{
              fontSize: "clamp(3rem, 7vw, 5rem)",
              fontWeight: 950,
              letterSpacing: "-4px",
            }}
          >
            The Future of{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ZeeCare
            </span>
          </h1>
        </motion.div>

        <LayoutGrid>
          <motion.div>
            {/* Enhanced Mission Panel */}
            <GlassPanel
              whileHover={{ rotateY: -8, rotateX: 5, translateZ: 20 }}
              style={{ x: useTransform(mouseX, [0, 1920], [-10, 10]) }}
            >
              <div
                style={{ display: "flex", gap: "30px", alignItems: "center" }}
              >
                <MagneticElement strength={0.4}>
                  <div
                    style={{
                      padding: "20px",
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      borderRadius: "24px",
                      boxShadow: "0 15px 30px rgba(99,102,241,0.4)",
                    }}
                  >
                    <Target size={40} color="white" />
                  </div>
                </MagneticElement>
                <div>
                  <h3
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Our Mission
                  </h3>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                    }}
                  >
                    Engineered precision healthcare. We utilize AI-driven
                    diagnostics to ensure every patient receives world-class
                    treatment, today.
                  </p>
                </div>
              </div>
            </GlassPanel>

            {/* Enhanced Vision Panel */}
            <GlassPanel
              whileHover={{ rotateY: -8, rotateX: 5, translateZ: 20 }}
              style={{ x: useTransform(mouseX, [0, 1920], [10, -10]) }}
            >
              <div
                style={{ display: "flex", gap: "30px", alignItems: "center" }}
              >
                <MagneticElement strength={0.4}>
                  <div
                    style={{
                      padding: "20px",
                      background: "linear-gradient(135deg, #a855f7, #7e22ce)",
                      borderRadius: "24px",
                      boxShadow: "0 15px 30px rgba(168,85,247,0.4)",
                    }}
                  >
                    <Eye size={40} color="white" />
                  </div>
                </MagneticElement>
                <div>
                  <h3
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Global Vision
                  </h3>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                    }}
                  >
                    To become the world's most trusted holographic medical
                    center, where technology meets the human heart.
                  </p>
                </div>
              </div>
            </GlassPanel>

            {/* Values Cloud */}
            <div style={{ marginTop: "4rem" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                {[
                  "Clinical Excellence",
                  "AI Diagnostics",
                  "Patient Safety",
                  "Full Transparency",
                  "Rapid Response",
                ].map((v, i) => (
                  <motion.div
                    key={i}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "#6366f1",
                      color: "#fff",
                    }}
                    style={{
                      padding: "12px 25px",
                      borderRadius: "50px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <ShieldCheck size={16} /> {v}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Cyber Sidebar */}
          <SidebarGlass
            whileHover={{ rotateY: -15, rotateX: 10 }}
            style={{ y: useTransform(mouseY, [0, 1080], [-20, 20]) }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: "rgba(99,102,241,0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2rem",
                border: "2px solid #6366f1",
              }}
            >
              <Globe size={40} color="#6366f1" />
            </div>
            <h4
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                marginBottom: "2.5rem",
              }}
            >
              ZeeCare Global
            </h4>

            <div
              style={{
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                color: "#cbd5e1",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Phone size={18} />
                </div>
                +92 919 979 9999
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mail size={18} />
                </div>
                hospital@zeecare.pk
              </div>
            </div>

            <MagneticElement strength={0.8}>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  background: "#6366f1",
                  boxShadow: "0 20px 40px rgba(99,102,241,0.5)",
                }}
                style={{
                  marginTop: "4rem",
                  width: "100%",
                  padding: "1.2rem",
                  borderRadius: "20px",
                  background: "transparent",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                  border: "2px solid #6366f1",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Launch Map <MapPin size={16} style={{ marginLeft: 8 }} />
              </motion.button>
            </MagneticElement>
          </SidebarGlass>
        </LayoutGrid>
      </AboutContainer>
    </SectionWithScene>
  );
};

export default About;
