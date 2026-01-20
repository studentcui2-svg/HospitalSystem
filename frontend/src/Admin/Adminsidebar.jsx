import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaTachometerAlt,
  FaUserMd,
  FaUserPlus,
  FaStethoscope,
  FaEnvelope,
  FaSignOutAlt,
  FaTimes,
  FaCalendarCheck,
  FaPalette,
} from "react-icons/fa";

const SidebarContainer = styled.div`
  width: 280px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  min-height: 100vh;
  overflow-y: auto;
  transition:
    transform 320ms ease,
    width 220ms ease;

  /* 2xl (>=1536px) */
  @media (min-width: 1536px) {
    width: 320px;
  }

  /* xl (>=1280px) */
  @media (min-width: 1280px) and (max-width: 1535px) {
    width: 300px;
  }

  /* lg (>=1024px) */
  @media (min-width: 1024px) and (max-width: 1279px) {
    width: 280px;
    transform: translateX(0);
  }

  /* md (>=768px) compact */
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 80px;
    transform: translateX(0);
  }

  /* sm and below: mobile overlay */
  @media (max-width: 767px) {
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-110%);
    will-change: transform;
    z-index: 1200;
    &.mobile-open {
      transform: translateX(0);
      box-shadow: 0 20px 50px rgba(2, 6, 23, 0.6);
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 767px) {
    display: none;
  }
`;

const LogoTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LogoSubtitle = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.2rem;
  cursor: pointer;
  display: none;

  @media (max-width: 767px) {
    display: block;
  }
`;

const MenuLabel = styled.span`
  display: inline-block;
  margin-left: 6px;
  @media (min-width: 768px) and (max-width: 1023px) {
    display: none;
  }
  @media (max-width: 767px) {
    display: inline-block;
    font-weight: 700;
  }
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 1.5rem 0;
`;

const MenuItem = styled.li`
  margin-bottom: 0.5rem;
`;

const MenuButton = styled.button`
  width: 100%;
  background: ${(props) =>
    props.$active ? "rgba(79, 70, 229, 0.2)" : "transparent"};
  color: ${(props) => (props.$active ? "#4F46E5" : "#D1D5DB")};
  border: none;
  padding: 1rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-right: ${(props) =>
    props.$active ? "3px solid #4F46E5" : "3px solid transparent"};

  &:hover {
    background: rgba(79, 70, 229, 0.1);
    color: #4f46e5;
  }

  @media (max-width: 767px) {
    padding: 1.2rem 1.5rem;
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    justify-content: center;
    gap: 0;
    padding: 0.9rem 0.4rem;
  }
`;

const MenuIcon = styled.div`
  font-size: 1.1rem;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileTopBar = styled.div`
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1100;

  @media (max-width: 767px) {
    display: flex;
  }
`;

const MobileTitle = styled.div`
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const MobileHamburger = styled.button`
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 1.25rem;
  padding: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Backdrop = styled.div`
  display: none;
  @media (max-width: 767px) {
    display: ${(p) => (p.$show ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1100;
  }
`;

const AdminSidebar = ({ activeSection, setActiveSection, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "doctors", label: "Doctors List", icon: FaUserMd },
    { id: "add-admin", label: "Add New Admin", icon: FaUserPlus },
    { id: "add-doctor", label: "Register Doctor", icon: FaStethoscope },
    { id: "appointments", label: "Appointments", icon: FaCalendarCheck },
    { id: "messages", label: "Messages", icon: FaEnvelope },
    { id: "landing", label: "Landing Page", icon: FaPalette },
  ];

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    if (mobileOpen) setMobileOpen(false);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <MobileTopBar>
        <MobileTitle>
          <LogoIcon style={{ width: 36, height: 36 }}>Z</LogoIcon>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>ZEECARE</div>
            <div style={{ fontSize: 11, color: "#cbd5e1" }}>Admin</div>
          </div>
        </MobileTitle>
        <MobileHamburger
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((s) => !s)}
        >
          {mobileOpen ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 12H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </MobileHamburger>
      </MobileTopBar>
      <Backdrop $show={mobileOpen} onClick={() => setMobileOpen(false)} />
      <SidebarContainer
        className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}
      >
        <SidebarHeader>
          <Logo>
            <LogoIcon>
              {/* show fallback initial if no logo image */}
              <img
                src="/logo.png"
                alt="logo"
                style={{ width: 36, height: 36, objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </LogoIcon>
            <LogoText>
              <LogoTitle>ZEECARE</LogoTitle>
              <LogoSubtitle>MEDICAL INSTITUTE</LogoSubtitle>
            </LogoText>
          </Logo>
          <CloseButton
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <FaTimes />
          </CloseButton>
        </SidebarHeader>

        <SidebarMenu>
          {menuItems.map((item) => (
            <MenuItem key={item.id}>
              <MenuButton
                $active={activeSection === item.id}
                onClick={() => handleMenuClick(item.id)}
              >
                <MenuIcon>
                  <item.icon />
                </MenuIcon>
                <MenuLabel>{item.label}</MenuLabel>
              </MenuButton>
            </MenuItem>
          ))}

          <MenuItem>
            <MenuButton
              onClick={() => {
                if (typeof onLogout === "function") onLogout();
                if (mobileOpen) setMobileOpen(false);
              }}
            >
              <MenuIcon>
                <FaSignOutAlt />
              </MenuIcon>
              <MenuLabel>Logout</MenuLabel>
            </MenuButton>
          </MenuItem>
        </SidebarMenu>
      </SidebarContainer>
    </>
  );
};

export default AdminSidebar;
