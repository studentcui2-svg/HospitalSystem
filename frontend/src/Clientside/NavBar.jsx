import React, { useState } from "react";
import styled from "styled-components";
import { FaSignOutAlt } from "react-icons/fa";
import ThreeScene from "./Home/ThreeScene.jsx";

export const NAV_HEIGHT = "72px";

const Navbar = styled.nav`
  height: ${NAV_HEIGHT};
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  padding: 0 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 1024px) {
    padding: 0 1.75rem;
  }

  @media (max-width: 768px) {
    padding: 0 1rem;
    flex-direction: row;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    padding: 0 0.75rem;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: #4f46e5;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1100;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: absolute;
  right: 0.75rem;
  top: calc(${NAV_HEIGHT} + 8px);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 1rem 1.25rem;

  @media (max-width: 768px) {
    display: block;
  }

  a {
    display: block;
    padding: 0.65rem 0.25rem;
    font-size: 1rem;
  }
`;

const Logo = styled.h1`
  color: #4f46e5;
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  cursor: pointer;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: center;
  flex: 1;
  justify-content: flex-end;

  @media (max-width: 1024px) {
    gap: 2rem;
  }

  @media (max-width: 768px) {
    gap: 1rem;
    display: none;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    width: 100%;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  justify-content: flex-start;
  margin-left: 0.75rem;
`;

const NavLink = styled.a`
  color: #4a5568;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0.5rem 0;

  &:hover {
    color: #4f46e5;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    gap: 0.8rem;
  }

  @media (max-width: 480px) {
    flex-direction: row;
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
  }
`;

const LoginButton = styled.a`
  background: transparent;
  color: #4f46e5;
  border: 2px solid #4f46e5;
  padding: 0.6rem 1.8rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4f46e5;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1.2rem;
    font-size: 0.85rem;
    flex: 1;
  }
`;

const SignupButton = styled.a`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.8rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1.2rem;
    font-size: 0.85rem;
    flex: 1;
  }
`;

const NavBar = ({
  onNavigateToLogin,
  onOpenAppointment,
  isLoggedIn,
  onLogout,
  onNavigateToHome,
  userRole,
  onNavigateToDoctor,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Navbar>
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.9,
          }}
        >
          <ThreeScene />
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Brand>
            <Logo
              onClick={() => {
                onNavigateToHome?.();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ZECARE
            </Logo>
          </Brand>

          <NavLinks>
            <NavLink
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                onNavigateToHome?.();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </NavLink>
            <NavLink
              href="/appointment"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (!isLoggedIn) {
                  onNavigateToLogin?.(true);
                } else {
                  onOpenAppointment?.();
                }
              }}
            >
              Appointment
            </NavLink>
            {isLoggedIn && userRole === "doctor" && (
              <NavLink
                href="/doctor"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  if (!isLoggedIn) onNavigateToLogin?.(true);
                  else onNavigateToDoctor?.();
                }}
              >
                Doctor Panel
              </NavLink>
            )}
            {isLoggedIn && (
              <NavLink
                href="/my-appointments"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  // navigate to My Appointments
                  try {
                    window.__NAV_TO__ && window.__NAV_TO__("myappointments");
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                My Appointments
              </NavLink>
            )}
            <NavLink
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About Us
            </NavLink>
            <AuthButtons>
              {!isLoggedIn ? (
                <LoginButton
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToLogin?.(true);
                  }}
                >
                  Login
                </LoginButton>
              ) : (
                <LoginButton
                  as="button"
                  onClick={onLogout}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <FaSignOutAlt style={{ marginRight: 8 }} /> Logout
                </LoginButton>
              )}
            </AuthButtons>
          </NavLinks>

          <MenuButton
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </MenuButton>
        </div>

        {menuOpen && (
          <MobileMenu>
            <NavLink
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                onNavigateToHome?.();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </NavLink>
            <NavLink
              href="/appointment"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (!isLoggedIn) {
                  onNavigateToLogin?.();
                } else {
                  onOpenAppointment?.();
                }
              }}
            >
              Appointment
            </NavLink>
            <NavLink
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About Us
            </NavLink>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {!isLoggedIn ? (
                <LoginButton
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    onNavigateToLogin?.();
                  }}
                >
                  Login
                </LoginButton>
              ) : (
                <LoginButton
                  as="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  <FaSignOutAlt style={{ marginRight: 8 }} /> Logout
                </LoginButton>
              )}
            </div>
          </MobileMenu>
        )}
      </Navbar>
    </>
  );
};

export default NavBar;
