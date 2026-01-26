import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled, { createGlobalStyle } from "styled-components";
import { motion as M, AnimatePresence } from "framer-motion";

// --- Components ---
import Home from "./Clientside/Homepage";
import LoginPage from "./Clientside/Login";
import SignupPage from "./Clientside/Signup";
import AppointmentModal from "./Clientside/Appointement";
import NavBar from "./Clientside/NavBar";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminGate from "./Clientside/AdminGate";
import DoctorPanel from "./Doctor/DoctorPanel";
import PatientDetail from "./Doctor/PatientDetail";
import MyAppointments from "./Clientside/MyAppointments";
import DoctorDirectory from "./Clientside/DoctorDirectory";
import PatientChatButton from "./Clientside/PatientChatButton";
import PatientAppointmentsTable from "./Clientside/PatientAppointmentsTable";

// --- 1. Global 3D & Glassmorphism Theme ---
const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --accent: #a855f7;
    --bg-deep: #020617;
    --text-main: #f8fafc;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.1);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg-deep);
    color: var(--text-main);
    overflow-x: hidden;
    line-height: 1.6;
    /* This allows the 3D perspective to work globally */
    perspective: 1500px;
  }

  html {
    scroll-behavior: smooth;
  }

  /* Custom Toast Styling to match Glassmorphism */
  .Toastify__toast {
    border-radius: 16px;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  position: relative;
`;

// --- 2. Animation Variants for Page Transitions ---
const pageVariants = {
  initial: { opacity: 0, x: -20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 20, scale: 1.02 },
};

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginStandalone, setIsLoginStandalone] = useState(false);
  const [isSignupStandalone, setIsSignupStandalone] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);
  const [patientIdentifier, setPatientIdentifier] = useState(null);

  // --- 3. Navigation Engine ---
  const handleNavigation = useCallback((page, path, standalone = false) => {
    setCurrentPage(page);
    if (page === "login") setIsLoginStandalone(standalone);
    if (page === "signup") setIsSignupStandalone(standalone);

    try {
      window.history.pushState({}, "", path);
    } catch (e) {
      console.error("Navigation error:", e);
    }
  }, []);

  const navigateToHome = () => handleNavigation("home", "/");
  const navigateToLogin = (standalone = true) =>
    handleNavigation("login", "/login", standalone);
  const navigateToSignup = (standalone = true) =>
    handleNavigation("signup", "/signup", standalone);
  const navigateToAdmin = () => setIsAdminGateOpen(true);
  const navigateToAppointment = () => {
    setCurrentPage("home");
    setIsAppointmentModalOpen(true);
  };

  const navigateToDoctorPanel = () => {
    handleNavigation("doctor", "/doctor");
  };

  const navigateToDoctorDirectory = useCallback(() => {
    handleNavigation("doctors", "/doctors");
  }, [handleNavigation]);

  const navigateToPatientRecords = useCallback(() => {
    handleNavigation("patientrecords", "/patient-records");
  }, [handleNavigation]);

  // expose a small global helper used by NavBar (mobile menu nav)
  useEffect(() => {
    try {
      window.__NAV_TO__ = (key) => {
        if (key === "doctors") navigateToDoctorDirectory();
        if (key === "patientrecords") navigateToPatientRecords();
      };
    } catch (e) {
      console.error(e);
    }
    return () => {
      try {
        delete window.__NAV_TO__;
      } catch (e) {
        console.error(e);
      }
    };
  }, [navigateToDoctorDirectory, navigateToPatientRecords]);

  // --- 4. Auth & State Handlers ---
  const handleLogin = (details) => {
    const role = details?.user?.role || details?.role || "user";
    setUserRole(role);
    setIsLoggedIn(true);

    if (details?.token) {
      localStorage.setItem("app_token", details.token);
      window.__APP_TOKEN__ = details.token;
      // expose the user object globally for components that need name/email
      window.__APP_USER__ = details.user || null;
      // Dispatch custom event so other components can react to user data changes
      window.dispatchEvent(new Event("userDataUpdated"));
    }

    toast.success(`Welcome back, ${role}!`);
    setCurrentPage(
      role === "admin" ? "admin" : role === "doctor" ? "doctor" : "home",
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("user");
    localStorage.removeItem("app_token");
    toast.info("Successfully logged out");
    setCurrentPage("home");
  };

  // Sync with URL for back/forward browser buttons
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // Check for hash-based routes first
      if (hash.startsWith("#/doctor/patient/")) {
        const identifier = decodeURIComponent(
          hash.replace("#/doctor/patient/", ""),
        );
        console.log("[APP] Setting patient identifier:", identifier);
        console.log("[APP] Hash:", hash);
        // Only update if identifier has changed
        setPatientIdentifier((prev) => {
          if (prev !== identifier) {
            console.log(
              "[APP] Identifier changed from",
              prev,
              "to",
              identifier,
            );
            return identifier;
          }
          return prev;
        });
        setCurrentPage("patientdetail");
        return;
      }

      if (hash === "#/doctor/panel" || hash === "#/doctor") {
        setCurrentPage("doctor");
        return;
      }

      if (hash === "#/doctors" || path === "/doctors") {
        setCurrentPage("doctors");
        return;
      }

      if (path === "/login") handleNavigation("login", "/login", true);
      else if (path === "/signup") handleNavigation("signup", "/signup", true);
      else if (path === "/admin") setIsAdminGateOpen(true);
      else if (path === "/doctor") handleNavigation("doctor", "/doctor");
      else if (path === "/doctors") handleNavigation("doctors", "/doctors");
      else setCurrentPage("home");
    };

    syncRoute(); // Run on mount
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, [handleNavigation]);

  const shouldShowNavbar = () => {
    if (currentPage === "admin") return false;
    if (currentPage === "login" && isLoginStandalone) return false;
    if (currentPage === "signup" && isSignupStandalone) return false;
    return true;
  };

  return (
    <AppContainer>
      <GlobalStyle />

      {/* 3D Progress & Navbar */}
      <AnimatePresence mode="wait">
        {shouldShowNavbar() && (
          <M.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            key="navbar-anim"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: 0,
              zIndex: 1200,
            }}
          >
            <NavBar
              onNavigateToLogin={navigateToLogin}
              onNavigateToSignup={navigateToSignup}
              onOpenAppointment={navigateToAppointment}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onNavigateToHome={navigateToHome}
              userRole={userRole}
              onNavigateToAdmin={navigateToAdmin}
              onNavigateToDoctor={navigateToDoctorPanel}
            />
          </M.div>
        )}
      </AnimatePresence>

      {/* --- Main Viewport with Page Transitions --- */}
      <AnimatePresence mode="wait">
        <M.main
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ paddingTop: shouldShowNavbar() ? "72px" : "0px" }}
        >
          {currentPage === "home" && (
            <Home
              onOpenAppointment={navigateToAppointment}
              userRole={userRole}
              isLoggedIn={isLoggedIn}
            />
          )}

          {currentPage === "doctor" && (
            <DoctorPanel onNavigateToHome={navigateToHome} />
          )}

          {currentPage === "patientdetail" && (
            <PatientDetail
              identifier={patientIdentifier}
              onBack={() => {
                window.location.hash = "#/doctor/panel";
                setCurrentPage("doctor");
              }}
            />
          )}

          {currentPage === "patientrecords" && <PatientAppointmentsTable />}

          {currentPage === "doctors" && <DoctorDirectory />}

          {currentPage === "login" && (
            <LoginPage
              onNavigateToHome={navigateToHome}
              onLogin={handleLogin}
              onSwitchToSignup={navigateToSignup}
              showError={(msg) => toast.error(msg)}
              standalone={isLoginStandalone}
            />
          )}

          {currentPage === "signup" && (
            <SignupPage
              onNavigateToHome={navigateToHome}
              onSwitchToLogin={navigateToLogin}
              showError={(msg) => toast.error(msg)}
              showSuccess={(msg) => toast.success(msg)}
              showInfo={(msg) => toast.info(msg)}
              standalone={isSignupStandalone}
            />
          )}

          {currentPage === "admin" && (
            <AdminDashboard
              onLogout={handleLogout}
              onNavigateToHome={navigateToHome}
            />
          )}
        </M.main>
      </AnimatePresence>

      {/* --- Global Interactive Elements --- */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />

      <AdminGate
        isOpen={isAdminGateOpen}
        onClose={() => setIsAdminGateOpen(false)}
        onSuccess={handleLogin}
      />

      {/* WhatsApp-style Floating Chat Button for Patients (shown on non-admin, non-doctor pages) */}
      {isLoggedIn &&
        userRole === "user" &&
        currentPage !== "admin" &&
        currentPage !== "doctor" && <PatientChatButton />}

      <ToastContainer theme="colored" position="bottom-right" limit={3} />
    </AppContainer>
  );
};

export default App;
