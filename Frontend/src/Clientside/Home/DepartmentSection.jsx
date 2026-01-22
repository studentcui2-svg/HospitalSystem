import React, { useRef, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { jsonFetch } from "../../utils/api";
import SectionWithScene from "../SectionWithScene.jsx";
import {
  Baby,
  Activity,
  Heart,
  Brain,
  Stethoscope,
  Thermometer,
  ShieldPlus,
  Zap,
} from "lucide-react";

// Generate an icon component or emoji based on department name
const generateIconForName = (name = "") => {
  const key = (name || "").toLowerCase();
  if (key.includes("cardio") || key.includes("heart")) return Heart;
  if (key.includes("neuro") || key.includes("brain")) return Brain;
  if (key.includes("pedi") || key.includes("child")) return Baby;
  if (key.includes("derm") || key.includes("skin")) return ShieldPlus;
  if (key.includes("ortho") || key.includes("bone") || key.includes("joint"))
    return Activity;
  if (
    key.includes("diagn") ||
    key.includes("lab") ||
    key.includes("scan") ||
    key.includes("test")
  )
    return Thermometer;
  if (
    key.includes("clinic") ||
    key.includes("hospital") ||
    key.includes("general")
  )
    return Stethoscope;
  // fallback
  return Stethoscope;
};

// Safely render icon values which may be: emoji string, React element, component function, or memo/forwardRef object
const renderIcon = (icon) => {
  if (!icon && icon !== 0) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "string")
    return <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>;
  try {
    return React.createElement(icon, { size: 45 });
  } catch {
    // fallback to rendering as text
    return <span style={{ fontSize: 28, lineHeight: 1 }}>{String(icon)}</span>;
  }
};

// --- Animations & Keyframes ---
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

// --- Styled Components ---
const DepartmentsContainer = styled.section`
  background: radial-gradient(circle at 50% 50%, #fdfdff 0%, #e2e8f0 100%);
  padding: 8rem 2rem;
  overflow: hidden;
  perspective: 2000px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 40px;
  padding: 3.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  position: relative;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.4);
  }
`;

const MagneticIconWrapper = styled(motion.div)`
  width: 110px;
  height: 110px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$gradient};
  color: white;
  font-size: 3rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px ${(props) => props.$shadow};
  cursor: pointer;
  z-index: 5;
`;

const StatusChip = styled.div`
  position: absolute;
  top: 25px;
  left: 25px;
  background: rgba(255, 255, 255, 0.8);
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 800;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  animation: ${pulse} 2s infinite;
`;

const DeptTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 0.8rem;
  letter-spacing: -1px;
`;

const MagneticButton = styled(motion.button)`
  margin-top: auto;
  width: 100%;
  padding: 1.2rem;
  border-radius: 20px;
  border: none;
  background: #0f172a;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
`;

// --- Magnetic Component Logic ---
const MagneticCard = ({ dept, index }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useTransform(dy, [-100, 100], [10, -10]);
  const rotateY = useTransform(dx, [-100, 100], [-10, 10]);

  return (
    <GlassCard
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <StatusChip>
        <div
          style={{
            width: 8,
            height: 8,
            background: "#10b981",
            borderRadius: "50%",
          }}
        />
        LIVE CLINIC
      </StatusChip>

      <MagneticIconWrapper
        $gradient={dept.gradient}
        $shadow={dept.shadow}
        style={{ x: dx, y: dy, translateZ: 60 }}
        whileHover={{ scale: 1.1 }}
      >
        {renderIcon(dept.icon)}
      </MagneticIconWrapper>

      <DeptTitle>{dept.name}</DeptTitle>
      <p
        style={{
          color: "#64748b",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        {dept.desc}
      </p>

      <MagneticButton
        whileHover={{ scale: 1.05, background: "#4f46e5" }}
        whileTap={{ scale: 0.95 }}
      >
        Book Now <Zap size={18} fill="currentColor" />
      </MagneticButton>
    </GlassCard>
  );
};

const DepartmentsSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Add cache-busting parameter to force fresh data
        const res = await jsonFetch(`/api/site-content?t=${Date.now()}`);
        if (res?.data?.services && Array.isArray(res.data.services)) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.warn("Failed to load services from API, using defaults", err);
      }
    };
    fetchServices();
  }, []);

  // Default departments if API fails
  const defaultDepartments = [
    {
      name: "Pediatrics",
      icon: Baby,
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      shadow: "rgba(37, 99, 235, 0.3)",
      desc: "Gentle healthcare for your little ones.",
    },
    {
      name: "Cardiology",
      icon: Heart,
      gradient: "linear-gradient(135deg, #ef4444, #b91c1c)",
      shadow: "rgba(239, 68, 68, 0.3)",
      desc: "Advanced heart care and diagnostics.",
    },
    {
      name: "Neurology",
      icon: Brain,
      gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      shadow: "rgba(139, 92, 246, 0.3)",
      desc: "Expert care for brain and nervous system.",
    },
    {
      name: "Orthopedics",
      icon: Activity,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadow: "rgba(245, 158, 11, 0.3)",
      desc: "Modern solutions for bone and joint health.",
    },
    {
      name: "Dermatology",
      icon: ShieldPlus,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      shadow: "rgba(16, 185, 129, 0.3)",
      desc: "Clinical and aesthetic skin treatments.",
    },
    {
      name: "Diagnostics",
      icon: Thermometer,
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      shadow: "rgba(6, 182, 212, 0.3)",
      desc: "Precise lab testing and full-body scans.",
    },
  ];

  // Map API services to department format
  const departments =
    services.length > 0
      ? services.map((service, idx) => {
          // resolve icon: prioritize API-provided icon (emoji string or component),
          // otherwise auto-generate from the service name
          let resolvedIcon = null;
          if (service.icon) {
            if (typeof service.icon === "string") resolvedIcon = service.icon;
            else resolvedIcon = service.icon;
          } else {
            resolvedIcon = generateIconForName(service.name);
          }

          return {
            name: service.name,
            icon: resolvedIcon,
            gradient: [
              "linear-gradient(135deg, #ef4444, #b91c1c)",
              "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              "linear-gradient(135deg, #f59e0b, #d97706)",
            ][idx % 3],
            shadow: [
              "rgba(239, 68, 68, 0.3)",
              "rgba(139, 92, 246, 0.3)",
              "rgba(245, 158, 11, 0.3)",
            ][idx % 3],
            desc: service.description || service.desc || "",
          };
        })
      : defaultDepartments;

  return (
    <SectionWithScene opacity={0.95}>
      <DepartmentsContainer id="departments">
        <motion.div
          style={{ textAlign: "center", marginBottom: "6rem" }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2
            style={{
              fontSize: "3.5rem",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-2px",
            }}
          >
            World Class <span style={{ color: "#4f46e5" }}>Clinics</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.2rem" }}>
            Pioneering healthcare with digital precision.
          </p>
        </motion.div>

        <Grid>
          {departments.map((dept, idx) => (
            <MagneticCard key={idx} dept={dept} index={idx} />
          ))}
        </Grid>
      </DepartmentsContainer>
    </SectionWithScene>
  );
};

export default DepartmentsSection;
