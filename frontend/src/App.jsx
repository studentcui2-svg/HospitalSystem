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

  // --- 4. Auth & State Handlers ---
  const handleLogin = (details) => {
    const role = details?.user?.role || details?.role || "user";
    setUserRole(role);
    setIsLoggedIn(true);

    if (details?.token) {
      localStorage.setItem("app_token", details.token);
      window.__APP_TOKEN__ = details.token;
    }

    toast.success(`Welcome back, ${role}!`);
    setCurrentPage(role === "admin" ? "admin" : "home");
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
      if (path === "/login") handleNavigation("login", "/login", true);
      else if (path === "/signup") handleNavigation("signup", "/signup", true);
      else if (path === "/admin") setIsAdminGateOpen(true);
      else setCurrentPage("home");
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
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

          {currentPage === "login" && (
            <LoginPage
              onNavigateToHome={navigateToHome}
              onLogin={handleLogin}
              standalone={isLoginStandalone}
            />
          )}

          {currentPage === "signup" && (
            <SignupPage
              onNavigateToHome={navigateToHome}
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

      <ToastContainer theme="colored" position="bottom-right" limit={3} />
    </AppContainer>
  );
};

export default App;
