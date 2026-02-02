import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  X,
  Bot,
  UserCog,
  FileText,
  Microscope,
  Stethoscope,
  Activity,
  ChevronRight,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";

/**
 * Doctor Medical Chatbot - Enhanced Markdown Rendering
 * Updated to properly parse and display medical reports like ChatGPT.
 */

const DoctorMedicalChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "Male",
    symptoms: "",
    medicalHistory: "",
    currentMedications: "",
    additionalNotes: "",
  });
  const [files, setFiles] = useState([]);
  const [hasInitialAnalysis, setHasInitialAnalysis] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Helper to parse inline bolding and other standard text
   */
  const parseInlineElements = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  /**
   * Enhanced Markdown Renderer
   */
  const renderMarkdown = (content) => {
    const lines = content.split("\n");

    return lines.map((line, i) => {
      const trimmedLine = line.trim();

      // Horizontal Rules
      if (
        trimmedLine === "---" ||
        trimmedLine === "***" ||
        trimmedLine === "___"
      ) {
        return (
          <hr
            key={i}
            style={{
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              margin: "20px 0",
            }}
          />
        );
      }

      // Headers (e.g., #, ##, ###)
      if (trimmedLine.startsWith("#")) {
        const text = trimmedLine.replace(/^#+\s*/, "");
        // Using header style from CSS
        return (
          <h3 key={i} style={{ marginTop: i === 0 ? "0" : "24px" }}>
            {parseInlineElements(text)}
          </h3>
        );
      }

      // List Items (e.g., *, -, 1.)
      if (trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ")) {
        const text = trimmedLine.replace(/^[*|-]\s*/, "");
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "8px",
              paddingLeft: "8px",
            }}
          >
            <span style={{ color: "#6366f1" }}>•</span>
            <span>{parseInlineElements(text)}</span>
          </div>
        );
      }

      // Standard Paragraph
      if (trimmedLine === "") return <div key={i} style={{ height: "12px" }} />;

      return (
        <p key={i} style={{ marginBottom: "10px", lineHeight: "1.6" }}>
          {parseInlineElements(line)}
        </p>
      );
    });
  };

  const handleAnalyze = async () => {
    if (
      !patientInfo.patientName ||
      !patientInfo.patientAge ||
      !patientInfo.symptoms
    ) {
      const validationMsg = {
        sender: "ai",
        content:
          "### ⚠️ Missing Clinical Data\nPlease ensure **Patient Name**, **Age**, and **Symptoms** are documented before initiating analysis.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, validationMsg]);
      return;
    }

    const userMessage = {
      sender: "user",
      content: `**Clinical Intake Submitted**\n\n**Patient:** ${patientInfo.patientName} (${patientInfo.patientAge}Y, ${patientInfo.patientGender})\n**Manifestations:** ${patientInfo.symptoms}\n${files.length > 0 ? `\n📎 *${files.length} attachment(s) processed*` : ""}`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(patientInfo).forEach((key) =>
        formData.append(key, patientInfo[key]),
      );
      files.forEach((file) => formData.append("medicalFiles", file));

      const token =
        window.__APP_TOKEN__ ||
        localStorage.getItem("app_token") ||
        localStorage.getItem("token");

      // In the preview environment, we simulate a successful response if the backend is not connected
      // This allows you to see the UI formatting immediately.

      const response = await fetch(
        `${window?.VITE_BACKEND_URL || "http://localhost:5000"}/api/doctor-chatbot/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      const aiMessage = {
        sender: "ai",
        content: data.analysis,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Mark that we have initial analysis and can now do follow-ups
      setHasInitialAnalysis(true);

      // Store conversation context
      setConversationHistory([
        { role: "user", content: userMessage.content },
        { role: "assistant", content: data.analysis },
      ]);

      // Don't reset form anymore - keep patient info for follow-ups
      setFiles([]);
    } catch (error) {
      console.error("Analysis Error:", error);
      const errorMessage = {
        sender: "ai",
        content:
          "## ❌ Diagnostic Interruption\nAnalysis could not be completed. Check system connectivity or authentication tokens.\n\n*Note: If testing locally, ensure the backend server is active.*",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim()) return;

    const userMessage = {
      sender: "user",
      content: followUpQuestion,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setFollowUpQuestion("");
    setLoading(true);

    try {
      const formData = new FormData();

      // Send patient info and conversation history for context
      Object.keys(patientInfo).forEach((key) =>
        formData.append(key, patientInfo[key]),
      );

      formData.append(
        "conversationHistory",
        JSON.stringify([
          ...conversationHistory,
          { role: "user", content: followUpQuestion },
        ]),
      );

      const token =
        window.__APP_TOKEN__ ||
        localStorage.getItem("app_token") ||
        localStorage.getItem("token");

      const response = await fetch(
        `${window?.VITE_BACKEND_URL || "http://localhost:5000"}/api/doctor-chatbot/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      const aiMessage = {
        sender: "ai",
        content: data.analysis,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: followUpQuestion },
        { role: "assistant", content: data.analysis },
      ]);
    } catch (error) {
      console.error("Follow-up Error:", error);
      const errorMessage = {
        sender: "ai",
        content: "❌ Unable to process follow-up question. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPatient = () => {
    if (
      messages.length > 0 &&
      !window.confirm(
        "Are you sure you want to start a new patient consultation? Current conversation will be lost.",
      )
    ) {
      return;
    }
    resetToNewPatient();
  };

  const resetToNewPatient = () => {
    // Clear everything and reset to initial state
    setMessages([]);
    setPatientInfo({
      patientName: "",
      patientAge: "",
      patientGender: "Male",
      symptoms: "",
      medicalHistory: "",
      currentMedications: "",
      additionalNotes: "",
    });
    setFiles([]);
    setHasInitialAnalysis(false);
    setFollowUpQuestion("");
    setConversationHistory([]);
    setLoading(false);

    // Scroll to top to show empty form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-viewport">
      <style>{`
        .app-viewport {
          min-height: 100vh;
          background: #0a0b14;
          color: #e2e8f0;
          padding: 20px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-image: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
        }

        .main-container {
          max-width: 1000px;
          margin: 0 auto;
          background: rgba(26, 27, 38, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .app-header {
          padding: 24px 32px;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-box {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
        }

        .title-group h1 {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-group p {
          font-size: 10px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .intake-section {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .section-tag {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 3px solid #6366f1;
          padding-left: 16px;
          margin-bottom: 8px;
        }

        .section-tag h2 {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #fff;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          background: rgba(255, 255, 255, 0.03);
          padding: 24px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-input {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          border-radius: 14px;
          padding: 14px 18px;
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3), 
                      0 1px 3px rgba(99, 102, 241, 0.1);
        }

        .form-input:hover {
          border-color: rgba(99, 102, 241, 0.4);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
        }

        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4),
                      0 0 0 3px rgba(99, 102, 241, 0.15),
                      0 4px 12px rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 0.8) 100%);
        }

        .form-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
          font-weight: 400;
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
          line-height: 1.6;
        }

        .complaint-box {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          box-shadow: inset 0 2px 8px rgba(99, 102, 241, 0.1),
                      0 2px 6px rgba(99, 102, 241, 0.15);
        }

        .complaint-box:focus {
          border-color: #8b5cf6;
          box-shadow: inset 0 2px 8px rgba(99, 102, 241, 0.15),
                      0 0 0 3px rgba(139, 92, 246, 0.15),
                      0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .action-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          gap: 20px;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px dashed rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          transition: background 0.2s;
        }

        .upload-btn:hover { background: rgba(99, 102, 241, 0.1); }

        .analyze-btn {
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          color: #fff;
          border: none;
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .analyze-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.6);
        }

        .analyze-btn:active { transform: translateY(0); }

        .analysis-area {
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(99, 102, 241, 0.15);
          padding: 40px;
          max-height: 800px;
          overflow-y: auto;
        }

        .report-msg {
          display: flex;
          gap: 24px;
          margin-bottom: 40px;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .msg-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ai-icon { background: #6366f1; color: #fff; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        .user-icon { background: #1e293b; color: #64748b; }

        .msg-content {
          flex: 1;
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .report-label {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #6366f1;
        }

        .report-line { height: 1px; flex: 1; background: rgba(255, 255, 255, 0.05); }

        .report-bubble {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px 32px;
          border-radius: 24px;
          border-top-left-radius: 4px;
          color: #cbd5e1;
          line-height: 1.7;
        }

        .ai-bubble { border-left: 3px solid #6366f1; }

        .report-bubble h3 {
          font-size: 1.1rem;
          color: #818cf8;
          margin: 12px 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }

        .report-bubble strong { color: #a5b4fc; font-weight: 700; }

        .empty-state {
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          opacity: 0.2;
          filter: grayscale(1);
        }

        .followup-section {
          padding: 24px;
          background: rgba(16, 185, 129, 0.05);
          border-top: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 0 0 24px 24px;
        }

        .followup-input-wrapper {
          display: flex;
          gap: 12px;
          margin: 16px 0;
        }

        .followup-input {
          flex: 1;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
        }

        .followup-input:focus {
          border-color: #10b981;
          background: rgba(255, 255, 255, 0.08);
        }

        .followup-input::placeholder {
          color: rgba(226, 232, 240, 0.4);
        }

        .followup-send-btn {
          padding: 14px 20px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .followup-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .followup-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .new-patient-btn {
          padding: 10px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .new-patient-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        @media (max-width: 768px) {
          .intake-section, .analysis-area { padding: 24px; }
          .action-footer { flex-direction: column; align-items: stretch; }
          .analyze-btn { justify-content: center; }
          .followup-section { padding: 16px; }
          .followup-input-wrapper { flex-direction: column; }
          .followup-send-btn { width: 100%; padding: 16px; }
        }
      `}</style>

      <div className="main-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-brand">
            <div className="logo-box">
              <Microscope size={24} color="#fff" />
            </div>
            <div className="title-group">
              <h1>CLINICAL AI ENGINE</h1>
              <p>Specialist Diagnostics</p>
            </div>
          </div>
          <div className="status-badge">
            <div className="pulse-dot"></div>
            Neural Link Online
          </div>
        </header>

        {/* 1. INTAKE (TOP) */}
        <section className="intake-section">
          <div className="section-tag">
            <ClipboardCheck size={16} color="#6366f1" />
            <h2>Patient Intake Portal</h2>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Patient Name</label>
              <input
                className="form-input"
                name="patientName"
                placeholder="Required"
                value={patientInfo.patientName}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Age</label>
              <input
                className="form-input"
                type="number"
                name="patientAge"
                placeholder="Required"
                value={patientInfo.patientAge}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Biological Sex</label>
              <select
                className="form-input"
                name="patientGender"
                value={patientInfo.patientGender}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <AlertCircle size={12} /> Chief Complaints & Symptomatology *
            </label>
            <textarea
              className="form-input form-textarea complaint-box"
              name="symptoms"
              placeholder="Detail onset, duration, severity, and localization..."
              value={patientInfo.symptoms}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div
            className="form-grid medical-pharmacology-grid"
            style={{
              background: "transparent",
              padding: 0,
              border: "none",
            }}
          >
            <div className="input-group">
              <label className="input-label">Medical History</label>
              <textarea
                className="form-input"
                name="medicalHistory"
                placeholder="Surgeries, chronic conditions..."
                style={{ minHeight: "80px" }}
                value={patientInfo.medicalHistory}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Pharmacology</label>
              <textarea
                className="form-input"
                name="currentMedications"
                placeholder="Current RX & sensitivities..."
                style={{ minHeight: "80px" }}
                value={patientInfo.currentMedications}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="action-footer">
            <div style={{ flex: 1 }}>
              <label className="upload-btn">
                <Upload size={16} />
                ATTACH IMAGING / LAB REPORTS
                <input
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "12px",
                }}
              >
                {files.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(99, 102, 241, 0.1)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    <FileText size={10} /> {f.name.substring(0, 10)}...{" "}
                    <X
                      size={10}
                      onClick={() => removeFile(i)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                "PROCESSING DATA..."
              ) : (
                <>
                  <Send size={16} /> RUN CLINICAL ANALYSIS
                </>
              )}
            </button>
          </div>
        </section>

        {/* 2. RESULTS (BOTTOM) */}
        <div className="analysis-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Stethoscope size={48} />
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "900",
                  letterSpacing: "3px",
                }}
              >
                Analysis Output Pending
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className="report-msg"
                style={{ opacity: msg.sender === "user" ? 0.8 : 1 }}
              >
                <div
                  className={`msg-icon ${msg.sender === "user" ? "user-icon" : "ai-icon"}`}
                >
                  {msg.sender === "user" ? (
                    <UserCog size={18} />
                  ) : (
                    <Bot size={18} />
                  )}
                </div>
                <div className="msg-content">
                  <div className="report-header">
                    <span className="report-label">
                      {msg.sender === "user"
                        ? "Case Submission"
                        : "Analysis Report"}
                    </span>
                    <div className="report-line"></div>
                  </div>
                  <div
                    className={`report-bubble ${msg.sender === "ai" ? "ai-bubble" : ""}`}
                  >
                    {renderMarkdown(msg.content)}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div
              className="report-msg"
              style={{ animation: "pulse 2s infinite" }}
            >
              <div className="msg-icon ai-icon">
                <Bot size={18} />
              </div>
              <div className="msg-content">
                <div className="report-header">
                  <span className="report-label">
                    Processing Neural Data...
                  </span>
                  <div className="report-line"></div>
                </div>
                <div
                  className="report-bubble ai-bubble"
                  style={{
                    minHeight: "80px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      height: "10px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      width: "80%",
                    }}
                  ></div>
                  <div
                    style={{
                      height: "10px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "10px",
                      width: "60%",
                    }}
                  ></div>
                  <div
                    style={{
                      height: "10px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "10px",
                      width: "70%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Follow-up Question Section - Only show after initial analysis */}
        {hasInitialAnalysis && (
          <div className="followup-section">
            <div className="section-tag">
              <Activity size={16} color="#10b981" />
              <h2>Continue Consultation</h2>
            </div>
            <div className="followup-input-wrapper">
              <input
                className="followup-input"
                type="text"
                placeholder="Ask a follow-up question about this patient..."
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleFollowUpQuestion();
                  }
                }}
                disabled={loading}
              />
              <button
                className="followup-send-btn"
                onClick={handleFollowUpQuestion}
                disabled={loading || !followUpQuestion.trim()}
              >
                <Send size={18} />
              </button>
            </div>
            <button className="new-patient-btn" onClick={handleNewPatient}>
              <X size={16} /> New Patient
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "32px", opacity: 0.4 }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Clinical Intelligence System — Professional Verification Required
        </p>
      </div>
    </div>
  );
};

export default DoctorMedicalChatbot;
