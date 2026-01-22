import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion"; // Added for advanced animations
import SectionWithScene from "../SectionWithScene.jsx";
import { FaAward, FaUsers, FaCalendarAlt, FaStar } from "react-icons/fa";
import CountUp from "../CountUp.jsx";

// --- Advanced Styled Components ---

const BiographyContainer = styled.section`
  padding: clamp(3rem, 6vw, 8rem) 2rem;
  background: #ffffff;
  overflow: hidden;
  perspective: 1500px; /* Essential for 3D effects */
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(2rem, 5vw, 6rem);
  align-items: center;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const SectionBadge = styled(motion.div)`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  padding: 0.6rem 1.6rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-weight: 900;
  margin-bottom: 1rem;
  color: #0f172a;
  line-height: 1.1;

  span {
    color: #4f46e5;
  }
`;

const HighlightText = styled(motion.div)`
  font-weight: 600;
  color: #4f46e5;
  font-size: 1.2rem;
  margin: 2rem 0;
  padding: 1.5rem 2rem;
  background: rgba(79, 70, 229, 0.03);
  border-radius: 20px;
  border-left: 5px solid #4f46e5;
  position: relative;

  &::after {
    content: '"';
    position: absolute;
    right: 20px;
    bottom: -10px;
    font-size: 4rem;
    opacity: 0.1;
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;
  padding: 2rem 1rem;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
    border-color: rgba(79, 70, 229, 0.2);
  }
`;

const ImageContent = styled(motion.div)`
  background: linear-gradient(145deg, #4f46e5 0%, #3b82f6 100%);
  border-radius: 40px;
  padding: 4rem 3rem;
  color: white;
  position: relative;
  box-shadow: 0 30px 60px rgba(79, 70, 229, 0.3);
  transform-style: preserve-3d; /* Allows child elements to pop out */
`;

const FloatingDecor = styled(motion.div)`
  position: absolute;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -20px;
  right: -20px;
  filter: blur(20px);
`;

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const card3DVariants = {
  hidden: { opacity: 0, rotateY: 25, x: 50 },
  visible: {
    opacity: 1,
    rotateY: -5,
    x: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

const BiographySection = () => {
  return (
    <SectionWithScene opacity={0.95}>
      <BiographyContainer id="about">
        <ContentWrapper
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* LEFT CONTENT */}
          <motion.div>
            <SectionBadge variants={itemVariants}>About ZeeCare</SectionBadge>
            <SectionTitle variants={itemVariants}>
              We are <span>pioneering</span> the future of healthcare.
            </SectionTitle>

            <motion.p
              variants={itemVariants}
              style={{ color: "#64748b", lineHeight: 1.8 }}
            >
              With two decades of medical excellence, we don't just treat
              patients; we care for families. Our integrated approach combines
              cutting-edge technology with deep human compassion.
            </motion.p>

            <HighlightText variants={itemVariants}>
              "Your health is our mission, and your trust is our greatest
              achievement."
            </HighlightText>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginTop: "2rem",
              }}
            >
              {[
                { label: "Happy Patients", end: 50000, suffix: "+" },
                { label: "Expert Doctors", end: 200, suffix: "+" },
                { label: "Years Experience", end: 20, suffix: "+" },
                { label: "Emergency Care", end: 24, suffix: "/7" },
              ].map((stat, i) => (
                <StatItem key={i} variants={itemVariants}>
                  <div
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 800,
                      color: "#4f46e5",
                    }}
                  >
                    <CountUp end={stat.end} duration={2000} />
                    {stat.suffix}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </StatItem>
              ))}
            </div>
          </motion.div>

          {/* RIGHT CONTENT - 3D CARD */}
          <ImageContent
            variants={card3DVariants}
            whileHover={{ rotateY: -10, rotateX: 5, scale: 1.02 }}
          >
            <FloatingDecor
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <div style={{ position: "relative", zIndex: 2 }}>
              <motion.div
                initial={{ backgroundColor: "#ffd93d" }}
                whileHover={{ scale: 1.1 }}
                style={{
                  padding: "0.8rem 2rem",
                  borderRadius: "50px",
                  color: "#0f172a",
                  fontWeight: 900,
                  display: "inline-block",
                  marginBottom: "2rem",
                }}
              >
                EST. 2004
              </motion.div>

              <h3
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  marginBottom: "1rem",
                }}
              >
                20+ Years of Excellence
              </h3>
              <p
                style={{
                  opacity: 0.9,
                  lineHeight: 1.8,
                  marginBottom: "2.5rem",
                }}
              >
                Setting the gold standard in clinical care and patient safety
                through continuous innovation and empathy.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                {[
                  { icon: <FaAward />, text: "Certified Excellence" },
                  { icon: <FaUsers />, text: "Patient-Centered" },
                  { icon: <FaCalendarAlt />, text: "24/7 Available" },
                  { icon: <FaStar />, text: "5-Star Rated" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 10 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "15px",
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <span style={{ color: "#ffd93d", fontSize: "1.2rem" }}>
                      {item.icon}
                    </span>
                    <span style={{ fontWeight: 600 }}>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </ImageContent>
        </ContentWrapper>
      </BiographyContainer>
    </SectionWithScene>
  );
};

export default BiographySection;
