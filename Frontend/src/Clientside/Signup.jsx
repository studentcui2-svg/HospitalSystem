import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  Loader2,
  Fingerprint,
  User,
  IdCard,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  UserCircle,
} from "lucide-react";

/**
 * 3D ADVANCED MED-TECH SIGNUP INTERFACE (FIXED & REFINED):
 * 1. Fixed ESLint Warnings: Integrated 'showError', 'showSuccess' and 'err' variables.
 * 2. Optimized Placement: Command-center alignment with high-density visual data.
 * 3. 3D Engine: Interactive DNA Helix using modern BufferGeometry.
 * 4. Zero Tailwind: Native CSS-in-JS and <style> architecture.
 */

const App = ({
  onSwitchToLogin = () => {},
  onNavigateToHome = () => {},
  showSuccess = (msg) => console.log("Success:", msg),
  showError = (msg) => console.log("Error:", msg),
  onLogin = (response) => console.log("Logged In:", response),
}) => {
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    nic: "",
    dateOfBirth: "",
    gender: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // --- Three.js Background Logic ---
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 4500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const t = i / 140;
      const spiral = i % 2 === 0 ? 1 : -1;

      posArray[i3] = Math.cos(t) * 4 * spiral;
      posArray[i3 + 1] = t - 22;
      posArray[i3 + 2] = Math.sin(t) * 4 * spiral;

      colorArray[i3] = 0.02;
      colorArray[i3 + 1] = 0.6 + Math.random() * 0.4;
      colorArray[i3 + 2] = 1.0;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colorArray, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial,
    );
    scene.add(particlesMesh);

    camera.position.z = 14;
    camera.position.y = 1;

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.002;
      particlesMesh.position.y += Math.sin(Date.now() * 0.0007) * 0.005;

      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 5 + 1 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const GOOGLE_CLIENT_ID =
    "35647668228-lot2tsnrosci6ldh48t949pj9o0nn9rm.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window === "undefined" || !window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (res) => {
          if (!res || !res.credential) return;
          setLoading(true);
          try {
            const resp = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idToken: res.credential,
                createIfMissing: true,
              }),
            });
            const data = await resp.json();
            if (!resp.ok)
              throw new Error(data.message || "Google signup failed");
            // store token and call onLogin
            if (data.token) {
              localStorage.setItem("app_token", data.token);
              window.__APP_TOKEN__ = data.token;
            }
            if (data.user) window.__APP_USER__ = data.user;
            showSuccess("Signed up and logged in with Google");
            onLogin(data);
          } catch (err) {
            console.error("Google signup error", err);
            showError(err?.message || "Google signup failed");
          } finally {
            setLoading(false);
          }
        },
      });
      const el = document.getElementById("google-signup-button");
      if (el)
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
        });
    } catch (e) {
      console.warn("Google Identity not available", e);
    }
  }, [onLogin, showError, showSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-format CNIC with dashes: 35102-6522122-9
    if (name === "nic") {
      const numbers = value.replace(/\D/g, ""); // Remove non-digits
      let formatted = "";

      if (numbers.length <= 5) {
        formatted = numbers;
      } else if (numbers.length <= 12) {
        formatted = numbers.slice(0, 5) + "-" + numbers.slice(5);
      } else {
        formatted =
          numbers.slice(0, 5) +
          "-" +
          numbers.slice(5, 12) +
          "-" +
          numbers.slice(12, 13);
      }

      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (localError) setLocalError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      const msg = "Passwords do not match. Please check and try again.";
      setLocalError(msg);
      showError(msg);
      return;
    }
    setLoading(true);
    setLocalError("");
    try {
      // Call actual signup API
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          fatherName: formData.fatherName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          nic: formData.nic,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (data.emailSent) {
        setOtpSent(true);
        showSuccess(
          "OTP sent to your email. Please check your inbox (and spam folder).",
        );
      } else {
        showError(
          "Account created but email could not be sent. Please contact support.",
        );
      }
    } catch (err) {
      const errMsg = err?.message || "Network error. Please try again.";
      setLocalError(errMsg);
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    try {
      // Call actual OTP verification API
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: otpInput,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Store token and user info
      if (data.token) {
        localStorage.setItem("app_token", data.token);
        window.__APP_TOKEN__ = data.token;
        if (data.user) {
          window.__APP_USER__ = data.user;
        }
      }

      showSuccess("Account verified successfully! Logging you in...");
      onLogin(data);
    } catch (err) {
      const errMsg = err?.message || "Invalid or expired OTP.";
      setLocalError(errMsg);
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setLocalError("");
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setResendCooldown(60); // 60 second cooldown
      showSuccess("New OTP sent to your email. Please check your inbox.");
    } catch (err) {
      const errMsg = err?.message || "Failed to resend OTP. Please try again.";
      setLocalError(errMsg);
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="med-signup-root">
      <style>{`
        .med-signup-root {
          min-height: 100vh;
          width: 100%;
          background: #010409;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #e6edf3;
        }
        .med-canvas { position: absolute; inset: 0; z-index: 1; opacity: 0.8; }
        .med-card-frame {
          width: 100%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr;
          position: relative;
          z-index: 10;
          background: rgba(13, 17, 23, 0.6);
          backdrop-filter: blur(50px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8);
        }
        @media (min-width: 1024px) {
          .med-card-frame { grid-template-columns: 480px 1fr; }
        }
        .med-left-panel {
          padding: 80px 60px;
          background: linear-gradient(165deg, rgba(30, 64, 175, 0.3), rgba(0, 0, 0, 0.4));
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .med-right-form {
          padding: 60px 80px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (max-width: 640px) {
          .med-right-form { padding: 40px 30px; }
          .med-left-panel { padding: 40px; }
        }
        .med-branding { display: flex; align-items: center; gap: 16px; margin-bottom: 60px; }
        .med-logo-hex {
          width: 54px;
          height: 54px;
          background: #0ea5e9;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 35px rgba(14, 165, 233, 0.4);
          transform: rotate(-5deg);
        }
        .med-headline { font-size: 58px; font-weight: 950; line-height: 0.95; margin-bottom: 25px; letter-spacing: -2px; }
        .med-headline span { background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .med-sub-desc { color: #8b949e; font-size: 19px; line-height: 1.6; max-width: 340px; margin-bottom: 50px; }
        .med-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        @media (max-width: 640px) { .med-input-row { grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; } }
        .med-field-box { margin-bottom: 24px; }
        .med-tag { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2.5px; color: #38bdf8; margin-bottom: 12px; display: block; opacity: 0.9; }
        .med-input-container { position: relative; transition: transform 0.2s ease; }
        .med-input-container:focus-within { transform: translateY(-2px); }
        .med-text-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 20px 20px 58px;
          border-radius: 18px;
          color: #f0f6fc;
          font-size: 16px;
          font-weight: 500;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }
        .med-text-input:focus {
          border-color: #0ea5e9;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 25px rgba(14, 165, 233, 0.15);
        }
        .med-input-icon {
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.25);
          transition: color 0.3s ease;
          pointer-events: none;
        }
        .med-text-input:focus + .med-input-icon { color: #38bdf8; }
        .med-submit-btn {
          width: 100%;
          padding: 24px;
          background: #0ea5e9;
          border: none;
          border-radius: 20px;
          color: white;
          font-size: 15px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 15px;
          position: relative;
          overflow: hidden;
        }
        .med-submit-btn:hover {
          background: #0284c7;
          box-shadow: 0 20px 40px rgba(14, 165, 233, 0.4);
          transform: translateY(-4px);
        }
        .med-submit-btn:active { transform: translateY(0); }
        .med-glow-loader { animation: spin 2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .med-error-msg {
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.2);
          padding: 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 30px;
          color: #ffa198;
          font-size: 14px;
          font-weight: 600;
        }
        .med-exit-link {
          background: none;
          border: none;
          color: #7d8590;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .med-exit-link:hover { color: #38bdf8; }
        .med-status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #484f58;
          font-family: 'JetBrains Mono', monospace;
        }
        .med-pulse-dot {
          width: 8px;
          height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          animation: pulse-fx 2s infinite;
        }
        @keyframes pulse-fx {
          0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
          100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
      `}</style>

      <canvas ref={canvasRef} className="med-canvas" />

      <div className="med-card-frame">
        <div className="med-left-panel">
          <div>
            <div className="med-branding">
              <div className="med-logo-hex">
                <Stethoscope size={30} color="white" />
              </div>
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: 950,
                  letterSpacing: "1px",
                  margin: 0,
                }}
              >
                ZEE<span style={{ color: "#0ea5e9" }}>CARE</span>
              </h1>
            </div>

            <h2 className="med-headline">
              Next-Gen <br />
              <span>Bio-Link</span> <br />
              Protocol
            </h2>
            <p className="med-sub-desc">
              Authorized access only. Real-time neural synchronization for
              hospital personnel.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#e6edf3",
                  }}
                >
                  Neural Sync
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#38bdf8",
                  }}
                >
                  98.2%
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#e6edf3",
                  }}
                >
                  System Load
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#38bdf8",
                  }}
                >
                  12%
                </span>
              </div>
            </div>
          </div>

          <div className="med-status-indicator">
            <div className="med-pulse-dot" />
            SECURE LINK ESTABLISHED // NODE: X-09
          </div>
        </div>

        <div className="med-right-form">
          <div style={{ width: "100%", maxWidth: "640px", margin: "0 auto" }}>
            <button onClick={onNavigateToHome} className="med-exit-link">
              <ArrowLeft size={16} /> Global Return
            </button>

            {!otpSent ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    marginBottom: "45px",
                  }}
                >
                  <Fingerprint size={42} color="#0ea5e9" />
                  <h3
                    style={{
                      fontSize: "36px",
                      fontWeight: 950,
                      margin: 0,
                      letterSpacing: "-1px",
                    }}
                  >
                    New Identity
                  </h3>
                </div>

                {localError && (
                  <div className="med-error-msg">
                    <AlertCircle size={22} /> {localError}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="med-input-row">
                    <div className="med-field-box">
                      <label className="med-tag">Full Name</label>
                      <div className="med-input-container">
                        <UserCircle className="med-input-icon" size={22} />
                        <input
                          type="text"
                          name="fullName"
                          className="med-text-input"
                          placeholder="Enter your full name"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="med-field-box">
                      <label className="med-tag">Father Name</label>
                      <div className="med-input-container">
                        <User className="med-input-icon" size={22} />
                        <input
                          type="text"
                          name="fatherName"
                          className="med-text-input"
                          placeholder="Enter father name"
                          required
                          value={formData.fatherName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="med-input-row">
                    <div className="med-field-box">
                      <label className="med-tag">Email Address</label>
                      <div className="med-input-container">
                        <Mail className="med-input-icon" size={22} />
                        <input
                          type="email"
                          name="email"
                          className="med-text-input"
                          placeholder="your@email.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="med-field-box">
                      <label className="med-tag">Phone Number</label>
                      <div className="med-input-container">
                        <Activity className="med-input-icon" size={22} />
                        <input
                          type="tel"
                          name="phone"
                          className="med-text-input"
                          placeholder="03001234567"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="med-input-row">
                    <div className="med-field-box">
                      <label className="med-tag">CNIC Number</label>
                      <div className="med-input-container">
                        <IdCard className="med-input-icon" size={22} />
                        <input
                          type="text"
                          name="nic"
                          className="med-text-input"
                          placeholder="35102-6522122-9"
                          required
                          maxLength="15"
                          value={formData.nic}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="med-input-row">
                    <div className="med-field-box">
                      <label className="med-tag">Password</label>
                      <div className="med-input-container">
                        <Lock className="med-input-icon" size={22} />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="med-text-input"
                          placeholder="Enter password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "18px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#484f58",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="med-field-box">
                      <label className="med-tag">Confirm Password</label>
                      <div className="med-input-container">
                        <Lock className="med-input-icon" size={22} />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="med-text-input"
                          placeholder="Re-enter password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "18px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#484f58",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="med-input-row">
                    <div className="med-field-box">
                      <label className="med-tag">Date of Birth</label>
                      <div className="med-input-container">
                        <Calendar className="med-input-icon" size={22} />
                        <input
                          type="date"
                          name="dateOfBirth"
                          className="med-text-input"
                          required
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="med-field-box">
                      <label className="med-tag">Gender</label>
                      <div className="med-input-container">
                        <Users className="med-input-icon" size={22} />
                        <select
                          name="gender"
                          className="med-text-input"
                          style={{ appearance: "none", cursor: "pointer" }}
                          required
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    className="med-submit-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={26} className="med-glow-loader" />
                    ) : (
                      <>
                        Sign Up <ChevronRight size={22} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  className="med-logo-hex"
                  style={{ margin: "0 auto 30px", transform: "rotate(0)" }}
                >
                  <Zap size={28} color="white" />
                </div>
                <h3
                  style={{
                    fontSize: "40px",
                    fontWeight: 950,
                    marginBottom: "20px",
                    letterSpacing: "-1px",
                  }}
                >
                  Sync Required
                </h3>
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "20px",
                    marginBottom: "50px",
                    lineHeight: "1.6",
                  }}
                >
                  Input the 6-digit decryption key sent to <br />
                  <strong style={{ color: "#38bdf8" }}>{formData.email}</strong>
                </p>

                <form onSubmit={handleVerify}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "50px",
                    }}
                  >
                    <input
                      type="text"
                      className="med-text-input"
                      style={{
                        textAlign: "center",
                        width: "360px",
                        fontSize: "42px",
                        fontWeight: 900,
                        letterSpacing: "14px",
                        padding: "30px",
                      }}
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) =>
                        setOtpInput(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                    />
                  </div>
                  <button
                    className="med-submit-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={26} className="med-glow-loader" />
                    ) : (
                      "Verify Identity"
                    )}
                  </button>
                </form>

                <div style={{ marginTop: "30px", textAlign: "center" }}>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: resendCooldown > 0 ? "#6b7280" : "#38bdf8",
                      fontWeight: 700,
                      cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      textDecoration: "underline",
                      opacity: resendCooldown > 0 ? 0.5 : 1,
                    }}
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Didn't receive OTP? Resend Email"}
                  </button>
                </div>

                <button
                  onClick={() => setOtpSent(false)}
                  style={{
                    marginTop: "20px",
                    background: "none",
                    border: "none",
                    color: "#38bdf8",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    letterSpacing: "2.5px",
                  }}
                >
                  Modify Identity Data
                </button>
              </div>
            )}

            <p
              style={{
                textAlign: "center",
                marginTop: "50px",
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#484f58",
                letterSpacing: "2px",
              }}
            >
              Existing Node?{" "}
              <button
                onClick={onSwitchToLogin}
                style={{
                  background: "none",
                  border: "none",
                  color: "#38bdf8",
                  fontWeight: 800,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Authenticate Session
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
