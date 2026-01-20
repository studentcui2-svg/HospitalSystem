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
  Cpu,
  Globe,
  Fingerprint,
  Zap,
  Dna,
  Activity,
  KeyRound,
  X,
} from "lucide-react";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";

const GOOGLE_CLIENT_ID =
  "35647668228-lot2tsnrosci6ldh48t949pj9o0nn9rm.apps.googleusercontent.com";

/**
 * 3D ADVANCED MED-TECH INTERFACE (ZERO EXTERNAL CSS DEPENDENCIES):
 * 1. Three.js Engine: Optimized BufferGeometry DNA helix with dynamic vertex shaders.
 * 2. Native CSS Styling: Replaced styled-components with a high-performance <style> block.
 * 3. 3D Interaction: Full-frame parallax responding to specialist's cursor movement.
 * 4. Cyber-Medical Aesthetics: "Dark-Ops" hospital UI with neon cyan and deep indigo.
 */

const App = ({
  onSwitchToSignup = () => {},
  onNavigateToHome = () => {},
  onLogin = (data) => console.log("Login Success", data),
  showError = (msg) => toast.error(msg),
}) => {
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStep, setFpStep] = useState("email");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  // --- Three.js 3D Background Logic ---
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

    // DNA Structure
    const particlesCount = 4000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const t = i / 120;
      const spiral = i % 2 === 0 ? 1 : -1;

      posArray[i3] = Math.cos(t) * 3 * spiral;
      posArray[i3 + 1] = t - 18;
      posArray[i3 + 2] = Math.sin(t) * 3 * spiral;

      colorArray[i3] = 0.1;
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
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial,
    );
    scene.add(particlesMesh);

    // Floating Ring Element
    const ringGeo = new THREE.TorusGeometry(12, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    camera.position.z = 10;
    camera.position.y = 2;

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0025;
      particlesMesh.position.y += Math.sin(Date.now() * 0.0008) * 0.006;
      ring.rotation.z -= 0.001;

      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 4 + 2 - camera.position.y) * 0.05;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await jsonFetch("/api/auth/login", {
        method: "POST",
        body: { email: formData.email, password: formData.password },
      });
      if (typeof onLogin === "function") onLogin(response);
    } catch (err) {
      console.error("[LOGIN] Failed", err);
      const errorMsg = err?.message || "Login failed. Please try again.";
      setError(errorMsg);
      if (typeof showError === "function") showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in callback
  const handleGoogleResponse = React.useCallback(
    async (response, createIfMissing = false) => {
      if (!response || !response.credential) return;
      setLoading(true);
      try {
        const payload = await jsonFetch("/api/auth/google", {
          method: "POST",
          body: { idToken: response.credential, createIfMissing },
        });
        if (typeof onLogin === "function") onLogin(payload);
      } catch (err) {
        console.error("Google sign-in error", err);
        const msg =
          err?.message || err?.details?.message || "Google sign-in failed";
        if (err && err.status === 404) {
          toast.error(
            "No account found for this Google account. Please sign up first.",
          );
          onSwitchToSignup?.();
        } else {
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [onLogin, onSwitchToSignup],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res) => handleGoogleResponse(res, false),
      });
      // render a compact button inside this component
      const el = document.getElementById("google-signin-button");
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
        });
      }
    } catch (e) {
      console.warn("Google Identity not available", e);
    }
  }, [handleGoogleResponse]);

  const sendForgotEmail = async () => {
    if (!fpEmail) {
      const msg = "Enter your email";
      setError(msg);
      if (showError) showError(msg);
      return;
    }
    setFpLoading(true);
    try {
      await jsonFetch("/api/auth/forgot", {
        method: "POST",
        body: { email: fpEmail },
      });
      toast.success("OTP sent to your email");
      setFpStep("otp");
      setError("");
    } catch (err) {
      console.error("Forgot email failed", err);
      const msg = err?.message || "Failed to send OTP";
      setError(msg);
      if (showError) showError(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const verifyForgotOtp = async () => {
    if (!fpOtp || fpOtp.length !== 4) {
      const msg = "Enter the 4-digit OTP";
      setError(msg);
      if (showError) showError(msg);
      return;
    }
    setFpLoading(true);
    try {
      await jsonFetch("/api/auth/verify-reset", {
        method: "POST",
        body: { email: fpEmail, otp: fpOtp },
      });
      toast.success("OTP verified");
      setFpStep("reset");
      setError("");
    } catch (err) {
      console.error("Verify OTP failed", err);
      const msg = err?.message || "Invalid or expired OTP";
      setError(msg);
      if (showError) showError(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const submitResetPassword = async () => {
    if (!fpNewPassword || !fpConfirmPassword) {
      const msg = "Enter and confirm new password";
      setError(msg);
      if (showError) showError(msg);
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      if (showError) showError(msg);
      return;
    }
    setFpLoading(true);
    try {
      await jsonFetch("/api/auth/reset-password", {
        method: "POST",
        body: { email: fpEmail, otp: fpOtp, password: fpNewPassword },
      });
      toast.success("Password updated successfully! You can now login.");
      setForgotOpen(false);
      setFpStep("email");
      setFpEmail("");
      setFpOtp("");
      setFpNewPassword("");
      setFpConfirmPassword("");
      setError("");
    } catch (err) {
      console.error("Reset password failed", err);
      const msg = err?.message || "Failed to update password";
      setError(msg);
      if (showError) showError(msg);
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="med-page-container">
      <style>{`
        .med-page-container {
          min-height: 100vh;
          width: 100%;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: white;
        }

        .med-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .med-glass-hub {
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr;
          position: relative;
          z-index: 10;
          background: rgba(2, 6, 23, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
        }

        @media (min-width: 1024px) {
          .med-glass-hub {
            grid-template-columns: 1fr 1fr;
          }
        }

        .med-info-panel {
          padding: 60px;
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.3), transparent);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .med-auth-panel {
          padding: 60px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .med-logo-box {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 50px;
        }

        .med-logo-icon {
          width: 50px;
          height: 50px;
          background: #0ea5e9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(14, 165, 233, 0.5);
        }

        .med-title {
          font-size: 56px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 24px;
        }

        .med-title span {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .med-input-group {
          margin-bottom: 25px;
        }

        .med-label {
          display: block;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #38bdf8;
          margin-bottom: 10px;
          margin-left: 5px;
        }

        .med-input-box {
          position: relative;
        }

        .med-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 18px 20px 18px 55px;
          border-radius: 15px;
          color: white;
          font-size: 16px;
          outline: none;
          transition: all 0.3s;
          box-sizing: border-box;
        }

        .med-input:focus {
          border-color: #0ea5e9;
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.1);
        }

        .med-input-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
          transition: color 0.3s;
        }

        .med-input:focus + .med-input-icon {
          color: #0ea5e9;
        }

        .med-btn {
          width: 100%;
          padding: 20px;
          background: #0ea5e9;
          border: none;
          border-radius: 15px;
          color: white;
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          margin-top: 10px;
        }

        .med-btn:hover {
          background: #0284c7;
          box-shadow: 0 0 40px rgba(14, 165, 233, 0.4);
          transform: translateY(-2px);
        }

        .med-btn:active {
          transform: translateY(0);
        }

        .med-shimmer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          transition: 0.5s;
        }

        .med-btn:hover .med-shimmer {
          animation: shimmer-anim 1.5s infinite;
        }

        @keyframes shimmer-anim {
          100% { transform: translateX(100%); }
        }

        .med-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 15px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
          animation: slide-down 0.3s ease;
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .med-stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 40px;
        }

        .med-stat-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }

        .med-stat-label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          color: #38bdf8;
          opacity: 0.6;
        }

        .med-stat-value {
          font-size: 24px;
          font-weight: 900;
          margin-top: 5px;
        }

        .rotate-anim {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <canvas ref={canvasRef} className="med-canvas" />

      <div className="med-glass-hub">
        {/* Left Side: Tech Info */}
        <div className="med-info-panel">
          <div>
            <div className="med-logo-box">
              <div className="med-logo-icon">
                <Stethoscope size={28} color="white" />
              </div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "2px",
                }}
              >
                ZEE <span style={{ color: "#0ea5e9" }}>CARE</span>
              </h1>
            </div>

            <h2 className="med-title">
              Next-Gen <br />
              <span>Bio-Link</span> <br />
              Protocol
            </h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "18px",
                lineHeight: "1.6",
                maxWidth: "350px",
              }}
            >
              Authorized access only. Real-time neural synchronization for
              hospital personnel.
            </p>

            <div className="med-stat-grid">
              <div className="med-stat-card">
                <div className="med-stat-label">Neural Sync</div>
                <div className="med-stat-value">98.2%</div>
              </div>
              <div className="med-stat-card">
                <div className="med-stat-label">System Load</div>
                <div className="med-stat-value">12%</div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "11px",
              color: "#64748b",
              fontWeight: "bold",
            }}
          >
            <Activity size={14} className="rotate-anim" /> SECURE LINK
            ESTABLISHED // NODE: X-09
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="med-auth-panel">
          <div style={{ maxWidth: "400px", margin: "0 auto", width: "100%" }}>
            <button
              onClick={onNavigateToHome}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "2px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "30px",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} /> Exit Perimeter
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "40px",
              }}
            >
              <Fingerprint size={32} color="#0ea5e9" />
              <h3 style={{ fontSize: "32px", fontWeight: 900, margin: 0 }}>
                Verify
              </h3>
            </div>

            {error && (
              <div className="med-error">
                <AlertCircle color="#ef4444" size={20} />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#fecaca",
                  }}
                >
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="med-input-group">
                <label className="med-label">Medical ID</label>
                <div className="med-input-box">
                  <Mail className="med-input-icon" size={20} />
                  <input
                    type="email"
                    className="med-input"
                    placeholder="staff@medcore.bio"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="med-input-group">
                <label className="med-label">Access Token</label>
                <div className="med-input-box">
                  <Lock className="med-input-icon" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="med-input"
                    placeholder="••••••••••••"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "30px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "4px",
                    }}
                  />{" "}
                  Remember
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setFpStep("email");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0ea5e9",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Recover Key
                </button>
              </div>

              <button className="med-btn" type="submit" disabled={loading}>
                <div className="med-shimmer" />
                {loading ? (
                  <Loader2 className="rotate-anim" size={20} />
                ) : (
                  <>
                    Authorize Entry <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                marginTop: "30px",
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase",
                color: "#64748b",
                letterSpacing: "1px",
              }}
            >
              Unauthorized Access is Prohibited. <br />
              <button
                onClick={onSwitchToSignup}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0ea5e9",
                  fontWeight: 900,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Request Credentials
              </button>
            </p>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div
                id="google-signin-button"
                style={{ display: "inline-block" }}
              />
              <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                Or sign in with Google
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          onClick={() => {
            setForgotOpen(false);
            setFpStep("email");
            setError("");
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5000,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "480px",
              maxWidth: "100%",
              background: "rgba(13,17,23,0.95)",
              backdropFilter: "blur(30px)",
              padding: "36px",
              borderRadius: "24px",
              border: "1px solid rgba(14, 165, 233, 0.2)",
              boxShadow: "0 0 60px rgba(14, 165, 233, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <KeyRound size={28} color="#0ea5e9" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "#e6f1ff",
                  }}
                >
                  Recovery Key
                </h3>
              </div>
              <button
                onClick={() => {
                  setForgotOpen(false);
                  setFpStep("email");
                  setError("");
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {fpStep === "email" && (
              <div>
                <p
                  style={{
                    color: "#8b949e",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  Enter your registered email to receive a 4-digit OTP for
                  password recovery.
                </p>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      color: "#38bdf8",
                      marginBottom: "10px",
                    }}
                  >
                    Medical ID
                  </label>
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f0f6fc",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => {
                      setForgotOpen(false);
                      setFpStep("email");
                      setError("");
                    }}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#e6f1ff",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendForgotEmail}
                    disabled={fpLoading}
                    style={{
                      padding: "12px 20px",
                      background: fpLoading ? "#0284c7" : "#0ea5e9",
                      border: "none",
                      borderRadius: "12px",
                      color: "white",
                      cursor: fpLoading ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      fontSize: "13px",
                      opacity: fpLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {fpLoading && <Loader2 className="rotate-anim" size={16} />}
                    {fpLoading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </div>
            )}

            {fpStep === "otp" && (
              <div>
                <p
                  style={{
                    color: "#8b949e",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  Enter the 4-digit code sent to{" "}
                  <strong style={{ color: "#38bdf8" }}>{fpEmail}</strong>.
                </p>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      color: "#38bdf8",
                      marginBottom: "10px",
                    }}
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={fpOtp}
                    onChange={(e) =>
                      setFpOtp(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                      )
                    }
                    placeholder="0000"
                    maxLength={4}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f0f6fc",
                      fontSize: "32px",
                      textAlign: "center",
                      letterSpacing: "20px",
                      outline: "none",
                      boxSizing: "border-box",
                      fontWeight: 900,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={() => {
                      setFpStep("email");
                      setError("");
                    }}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#e6f1ff",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    Back
                  </button>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={sendForgotEmail}
                      disabled={fpLoading}
                      style={{
                        padding: "12px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#e6f1ff",
                        cursor: fpLoading ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: "13px",
                        opacity: fpLoading ? 0.6 : 1,
                      }}
                    >
                      Resend
                    </button>
                    <button
                      onClick={verifyForgotOtp}
                      disabled={fpLoading}
                      style={{
                        padding: "12px 20px",
                        background: fpLoading ? "#0284c7" : "#0ea5e9",
                        border: "none",
                        borderRadius: "12px",
                        color: "white",
                        cursor: fpLoading ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: "13px",
                        opacity: fpLoading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {fpLoading && (
                        <Loader2 className="rotate-anim" size={16} />
                      )}
                      {fpLoading ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fpStep === "reset" && (
              <div>
                <p
                  style={{
                    color: "#8b949e",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                >
                  Set a new password for{" "}
                  <strong style={{ color: "#38bdf8" }}>{fpEmail}</strong>.
                </p>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      color: "#38bdf8",
                      marginBottom: "10px",
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f0f6fc",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "2px",
                      color: "#38bdf8",
                      marginBottom: "10px",
                    }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f0f6fc",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => {
                      setFpStep("otp");
                      setError("");
                    }}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#e6f1ff",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={submitResetPassword}
                    disabled={fpLoading}
                    style={{
                      padding: "12px 20px",
                      background: fpLoading ? "#0284c7" : "#0ea5e9",
                      border: "none",
                      borderRadius: "12px",
                      color: "white",
                      cursor: fpLoading ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      fontSize: "13px",
                      opacity: fpLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {fpLoading && <Loader2 className="rotate-anim" size={16} />}
                    {fpLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
