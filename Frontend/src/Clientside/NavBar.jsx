import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaTrashAlt,
  FaCamera,
  FaUser,
} from "react-icons/fa";
import BrandLogo from "../components/BrandLogo";
import ThreeScene from "./Home/ThreeScene.jsx";
import ProfileEdit from "./ProfileEdit.jsx";

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

const Logo = styled.div`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
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

const NavBar = ({
  onNavigateToLogin,
  onOpenAppointment,
  isLoggedIn,
  onLogout,
  onNavigateToHome,
  userRole,
  onNavigateToDoctor,
  onNavigateToLab,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'logout' | 'delete'
  const avatarRef = useRef(null);
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(
    (typeof window !== "undefined" &&
      window.__APP_USER__ &&
      window.__APP_USER__.avatarUrl) ||
      null,
  );
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Sync avatarUrl from window.__APP_USER__ when it changes (e.g., after login)
  useEffect(() => {
    const syncAvatar = () => {
      if (window.__APP_USER__ && window.__APP_USER__.avatarUrl) {
        setAvatarUrl(window.__APP_USER__.avatarUrl);
      }
    };
    // Initial sync
    syncAvatar();
    // Listen for custom event when user data updates
    window.addEventListener("userDataUpdated", syncAvatar);
    return () => window.removeEventListener("userDataUpdated", syncAvatar);
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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
              <BrandLogo size={44} showText />
            </Logo>
          </Brand>

          {/* Minimal bar for doctors: only show quick actions + logout */}
          {userRole === "doctor" ? (
            <NavLinks style={{ justifyContent: "flex-end" }}>
              <NavLink
                href="/doctor"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  onNavigateToDoctor?.();
                }}
              >
                My Appointments
              </NavLink>
              <AuthButtons>
                <LoginButton
                  as="button"
                  onClick={() => {
                    setConfirmAction("logout");
                    setConfirmOpen(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    color: "#0ea5e9",
                    borderColor: "#0ea5e9",
                  }}
                >
                  <FaSignOutAlt style={{ marginRight: 8, color: "#0ea5e9" }} />
                  <span style={{ color: "#0ea5e9" }}>Logout</span>
                </LoginButton>
              </AuthButtons>
            </NavLinks>
          ) : (
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
              {isLoggedIn && userRole === "lab" && (
                <NavLink
                  href="/lab"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    if (!isLoggedIn) onNavigateToLogin?.(true);
                    else onNavigateToLab?.();
                  }}
                >
                  Lab Portal
                </NavLink>
              )}
              {isLoggedIn && (
                <NavLink
                  href="/patient-records"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    try {
                      window.__NAV_TO__ && window.__NAV_TO__("patientrecords");
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  My Records
                </NavLink>
              )}
              <NavLink
                href="/doctors"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  try {
                    window.location.href = "#/doctors";
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Our Doctors
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
                  <div style={{ position: "relative" }} ref={avatarRef}>
                    <button
                      onClick={() => setAvatarOpen((v) => !v)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        background:
                          "linear-gradient(135deg,#0ea5e9 0%,#4f46e5 100%)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        boxShadow: "0 6px 18px rgba(79,70,229,0.28)",
                        border: "2px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                      }}
                      aria-label="User menu"
                    >
                      {avatarUrl ? (
                        <img
                          src={
                            avatarUrl.startsWith("http")
                              ? avatarUrl
                              : `http://localhost:5000${avatarUrl}`
                          }
                          alt="avatar"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <>
                          <FaUserCircle size={18} style={{ marginRight: 6 }} />
                          <span style={{ fontSize: 12, fontWeight: 800 }}>
                            {(() => {
                              try {
                                const u = (window && window.__APP_USER__) || {};
                                if (u && u.name)
                                  return u.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("");
                              } catch (e) {
                                console.error(e);
                              }
                              return "U";
                            })()}
                          </span>
                        </>
                      )}
                    </button>

                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const f = e.target.files && e.target.files[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            const dataUrl = reader.result;
                            const token = window.__APP_TOKEN__;
                            const resp = await fetch("/api/auth/avatar", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: token ? `Bearer ${token}` : "",
                              },
                              body: JSON.stringify({ image: dataUrl }),
                            });
                            const body = await resp.json().catch(() => ({}));
                            if (!resp.ok) {
                              const reason =
                                body && body.message
                                  ? body.message
                                  : "Upload failed";
                              setToast({
                                message: `Upload failed: ${reason}`,
                                type: "error",
                              });
                              setTimeout(() => setToast(null), 4000);
                              throw new Error(reason);
                            }
                            setAvatarUrl(body.avatarUrl);
                            window.__APP_USER__ = window.__APP_USER__ || {};
                            window.__APP_USER__.avatarUrl = body.avatarUrl;
                            window.dispatchEvent(new Event("userDataUpdated"));
                            setToast({
                              message: "Photo uploaded successfully",
                              type: "success",
                            });
                            setTimeout(() => setToast(null), 3000);
                          } catch (err) {
                            console.error(err);
                          }
                        };
                        reader.readAsDataURL(f);
                      }}
                    />

                    {avatarOpen && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          marginTop: 8,
                          background: "white",
                          color: "#111827",
                          boxShadow: "0 8px 24px rgba(2,6,23,0.16)",
                          borderRadius: 10,
                          overflow: "hidden",
                          minWidth: 180,
                        }}
                      >
                        <button
                          onClick={() => {
                            setProfileEditOpen(true);
                            setAvatarOpen(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 14px",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <FaUser style={{ color: "#0ea5e9" }} />
                            <span style={{ color: "#0ea5e9" }}>
                              Edit Profile
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setConfirmAction("delete");
                            setConfirmOpen(true);
                            setAvatarOpen(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 14px",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <FaTrashAlt style={{ color: "#0ea5e9" }} />
                            <span style={{ color: "#0ea5e9" }}>
                              {" "}
                              Delete Account
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setAvatarOpen(false);
                            try {
                              fileInputRef.current &&
                                fileInputRef.current.click();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 14px",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <FaCamera style={{ color: "#0ea5e9" }} />
                            <span style={{ color: "#0ea5e9" }}>
                              Change Photo
                            </span>
                          </span>
                        </button>
                        <hr style={{ margin: 0 }} />
                        <button
                          onClick={() => {
                            setConfirmAction("logout");
                            setConfirmOpen(true);
                            setAvatarOpen(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 14px",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <FaSignOutAlt style={{ color: "#0ea5e9" }} />
                            <span style={{ color: "#0ea5e9" }}> Logout</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </AuthButtons>
            </NavLinks>
          )}

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
            {isLoggedIn && userRole === "user" && (
              <NavLink
                href="/patient-records"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  try {
                    window.__NAV_TO__ && window.__NAV_TO__("patientrecords");
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                My Records
              </NavLink>
            )}
            {isLoggedIn && userRole === "doctor" && (
              <NavLink
                href="/doctor"
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  onNavigateToDoctor?.();
                }}
              >
                My Panel
              </NavLink>
            )}
            <NavLink
              href="/doctors"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                try {
                  window.location.href = "#/doctors";
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Our Doctors
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setProfileEditOpen(true);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.06)",
                      background: "white",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#0ea5e9",
                        fontWeight: 700,
                      }}
                    >
                      <FaUser style={{ color: "#0ea5e9" }} /> Edit Profile
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmAction("delete");
                      setConfirmOpen(true);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.06)",
                      background: "white",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#0ea5e9",
                        fontWeight: 700,
                      }}
                    >
                      <FaTrashAlt style={{ color: "#0ea5e9" }} /> Delete Account
                    </span>
                  </button>
                  <LoginButton
                    as="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmAction("logout");
                      setConfirmOpen(true);
                    }}
                    style={{
                      color: "#0ea5e9",
                      borderColor: "#0ea5e9",
                      width: "100%",
                    }}
                  >
                    <FaSignOutAlt
                      style={{ marginRight: 8, color: "#0ea5e9" }}
                    />
                    <span style={{ color: "#0ea5e9" }}>Logout</span>
                  </LoginButton>
                </div>
              )}
            </div>
          </MobileMenu>
        )}
      </Navbar>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 12000,
          }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              width: 420,
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {confirmAction === "delete" ? "Delete account?" : "Logout?"}
            </h3>
            <p style={{ color: "#374151" }}>
              {confirmAction === "delete"
                ? "Are you sure you want to permanently delete your account? This action cannot be undone."
                : "Are you sure you want to logout?"}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 18,
              }}
            >
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid #0ea5e9",
                  color: "#0ea5e9",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (confirmAction === "logout") {
                      // call logout handler
                      onLogout?.();
                    } else if (confirmAction === "delete") {
                      // call delete account API then logout
                      const token = window.__APP_TOKEN__;
                      const resp = await fetch("/api/auth/delete", {
                        method: "DELETE",
                        headers: {
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                      });
                      if (!resp.ok) {
                        const body = await resp
                          .json()
                          .catch(() => ({ message: "Delete failed" }));
                        throw new Error(body.message || "Delete failed");
                      }
                      // success, call onLogout to clear client state
                      onLogout?.();
                    }
                  } catch (err) {
                    console.error("Account action failed", err);
                    alert(err?.message || "Action failed");
                  } finally {
                    setConfirmOpen(false);
                  }
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                }}
              >
                {confirmAction === "delete" ? "Delete Account" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Profile Edit Modal */}
      <ProfileEdit
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
      />

      {/* Toast notifications */}
      {toast && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 24,
            zIndex: 13000,
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: toast.type === "success" ? "#ecfdf5" : "#fff1f2",
            border: `1px solid ${toast.type === "success" ? "#34d399" : "#f87171"}`,
            color: toast.type === "success" ? "#065f46" : "#7f1d1d",
            padding: "10px 14px",
            borderRadius: 10,
            boxShadow: "0 8px 20px rgba(2,6,23,0.12)",
            minWidth: 220,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {toast.type === "success" ? "✓" : "⚠"}
          </div>
          <div style={{ fontSize: 14 }}>{toast.message}</div>
        </div>
      )}
    </>
  );
};

export default NavBar;
