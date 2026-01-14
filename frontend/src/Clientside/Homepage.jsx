import React, { useEffect } from "react";
import styled from "styled-components";
import { motion, useScroll, useSpring } from "framer-motion";

// Section Imports
import HeroSection from "./Home/Hero";
import DepartmentsSection from "./Home/DepartmentSection";
import BiographySection from "./Home/BiographySection";
import ContactSection from "./Home/ContactSection";
import FooterSection from "./Home/FooterSection";
import { NAV_HEIGHT } from "./NavBar";
import Chatbot from "./Chatbot";

// --- 1. Global 3D Styled Components ---

const MainWrapper = styled.div`
  background: #020617; /* Matches the deep navy of your advanced components */
  color: #f8fafc;
  font-family: "Inter", sans-serif;
  overflow-x: hidden;
  position: relative;
  /* This perspective allows all child components to share a unified 3D space */
  perspective: 2000px;
`;

const ScrollProgress = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  transform-origin: 0%;
  z-index: 9999;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
`;

const GlobalBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: radial-gradient(
    circle at 2px 2px,
    rgba(99, 102, 241, 0.05) 1px,
    transparent 0
  );
  background-size: 60px 60px;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, transparent 0%, #020617 80%);
  }
`;

const SectionSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.1),
    transparent
  );
`;

// --- 2. The Enhanced Home Component ---

const Home = ({ onNavigateToLogin, onNavigateToSignup, onOpenAppointment }) => {
  // Track scroll progress for the top bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Smooth entry for the whole page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainWrapper>
      {/* 3D Progress Bar */}
      <ScrollProgress style={{ scaleX }} />

      {/* Global Background Particles/Grid */}
      <GlobalBackground />

      <motion.div
        style={{ paddingTop: NAV_HEIGHT, position: "relative", zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* HERO SECTION */}
        <HeroSection onBookAppointment={onOpenAppointment} />

        <SectionSeparator />

        {/* DEPARTMENTS SECTION */}
        <div id="departments">
          <DepartmentsSection />
        </div>

        <SectionSeparator />

        {/* ABOUT / BIOGRAPHY SECTION */}
        <div id="about">
          <BiographySection />
        </div>

        <SectionSeparator />

        {/* CONTACT SECTION */}
        <div id="contact">
          <ContactSection />
        </div>

        {/* FOOTER SECTION */}
        <FooterSection
          onBookAppointment={onOpenAppointment}
          onNavigateToLogin={onNavigateToLogin}
          onNavigateToSignup={onNavigateToSignup}
        />
      </motion.div>
      <Chatbot />
    </MainWrapper>
  );
};

export default Home;
