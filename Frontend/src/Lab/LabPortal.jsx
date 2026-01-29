import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  FlaskConical,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Play,
  Upload,
  Search,
  MoreVertical,
  Activity,
  X,
  Plus,
} from "lucide-react";
import { jsonFetch, getApiBase } from "../utils/api";

// --- Custom Styled Engine ---
const styled =
  // eslint-disable-next-line no-unused-vars
  (Tag) =>
    (strings, ...exprs) => {
      const className = `styled-${Math.random().toString(36).slice(2, 7)}`;
      const styleStr = strings.reduce(
        (acc, str, i) => acc + str + (exprs[i] || ""),
        "",
      );

      if (!document.getElementById("styled-css-root")) {
        const styleTag = document.createElement("style");
        styleTag.id = "styled-css-root";
        document.head.appendChild(styleTag);
        // Add spin animation
        styleTag.sheet.insertRule(`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `);
      }
      document
        .getElementById("styled-css-root")
        .sheet.insertRule(`.${className} { ${styleStr} }`);

      return ({ className: customClass = "", ...props }) => (
        <Tag {...props} className={`${className} ${customClass}`} />
      );
    };

[
  "div",
  "header",
  "h1",
  "p",
  "button",
  "table",
  "th",
  "td",
  "span",
  "input",
  "textarea",
  "label",
  "a",
  "section",
].forEach((tag) => {
  styled[tag] = styled(tag);
});

// --- Styled Components ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: #fdfdff;
  padding: 32px;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  color: #0f172a;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #f1f5f9;
  padding: 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  margin-bottom: 32px;
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const Branding = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoBox = styled.div`
  width: 48px;
  height: 48px;
  background: #6366f1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);
`;

const NavButton = styled.button`
  background: #fff1f2;
  color: #e11d48;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e11d48;
    color: white;
  }
`;

const DashboardLayout = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const TableContainer = styled.section`
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 320px;

  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    &:focus {
      border-color: #6366f1;
    }
  }

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px 32px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f8fafc;
`;

const Td = styled.td`
  padding: 20px 32px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
`;

const StatusIndicator = styled.span`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const ActionBtn = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const LabPortal = () => {
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef();

  // Fetch tests function (reusable)
  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await jsonFetch("/api/lab");
      setTests(data.tests || []);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tests on mount
  useEffect(() => {
    fetchTests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("app_token");
    window.location.reload();
  };

  // Mark test as in progress (minimal working logic)
  const markInProgress = async (id) => {
    setLoading(true);
    try {
      await jsonFetch(`/api/lab/${id}`, {
        method: "PATCH",
        body: { status: "InProgress" },
      });
      setTests((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "InProgress" } : t)),
      );
    } catch (err) {
      console.error("Failed to update test status:", err);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler (minimal working logic)
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !uploadingId) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("report", file);

    try {
      const apiBase = getApiBase();
      const token = localStorage.getItem("app_token");
      const response = await fetch(`${apiBase}/api/lab/${uploadingId}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.ok) {
        alert(
          `Report uploaded successfully for test: ${data.labTest.testName}`,
        );
        // Refresh tests to get updated data
        fetchTests();
      } else {
        throw new Error(data.message || "Upload failed");
      }
      setUploadingId(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Branding>
          <LogoBox>
            <FlaskConical size={24} />
          </LogoBox>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>
              ZeeCare Lab
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Management Portal
            </p>
          </div>
        </Branding>
        <div style={{ display: "flex", gap: "12px" }}>
          <NavButton
            onClick={fetchTests}
            style={{
              background: "#dbeafe",
              color: "#1e40af",
            }}
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Refresh
          </NavButton>
          <NavButton onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </NavButton>
        </div>
      </Header>

      <DashboardLayout>
        <TableContainer>
          <TableHeader>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                Patient Tests
              </h2>
              <span
                style={{
                  background: "#f1f5f9",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                {tests.length} Total
              </span>
            </div>
            <SearchWrapper>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchWrapper>
          </TableHeader>

          <div style={{ overflowX: "auto" }}>
            <StyledTable>
              <thead>
                <tr>
                  <Th>Patient</Th>
                  <Th>Doctor</Th>
                  <Th>Test Type</Th>
                  <Th>Status</Th>
                  <Th style={{ textAlign: "right" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {tests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        padding: "64px",
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <Activity
                        size={40}
                        style={{ margin: "0 auto 16px", opacity: 0.2 }}
                      />
                      <p style={{ margin: 0, fontWeight: 500 }}>
                        No test records found
                      </p>
                    </td>
                  </tr>
                ) : (
                  tests.map((t) => (
                    <tr key={t._id}>
                      <Td>
                        <div style={{ fontWeight: 600 }}>{t.patientName}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {t.patientEmail}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ fontWeight: 600, color: "#6366f1" }}>
                          {t.doctorName || "N/A"}
                        </div>
                        {t.doctorEmail && (
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {t.doctorEmail}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <div style={{ fontWeight: 500 }}>{t.testName}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          ID: {t._id}
                        </div>
                      </Td>
                      <Td>
                        <StatusIndicator
                          style={{
                            background:
                              t.status === "Completed"
                                ? "#ecfdf5"
                                : t.status === "InProgress"
                                  ? "#eff6ff"
                                  : "#fff7ed",
                            color:
                              t.status === "Completed"
                                ? "#059669"
                                : t.status === "InProgress"
                                  ? "#2563eb"
                                  : "#d97706",
                          }}
                        >
                          {t.status}
                        </StatusIndicator>
                      </Td>
                      <Td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                          }}
                        >
                          {t.status === "Ordered" && (
                            <ActionBtn
                              style={{ background: "#6366f1", color: "white" }}
                              onClick={() => markInProgress(t._id)}
                            >
                              <Play size={14} fill="currentColor" /> Start
                            </ActionBtn>
                          )}
                          {t.status !== "Completed" && (
                            <ActionBtn
                              style={{
                                background: "#f1f5f9",
                                color: "#475569",
                              }}
                              onClick={() => {
                                setUploadingId(t._id);
                                setTimeout(() => {
                                  fileInputRef.current.click();
                                }, 0);
                              }}
                            >
                              <Upload size={14} /> Result
                            </ActionBtn>
                          )}
                          {t.report?.url && (
                            <ActionBtn
                              as="a"
                              href={t.report.url}
                              target="_blank"
                              style={{
                                background: "#0f172a",
                                color: "white",
                                textDecoration: "none",
                              }}
                            >
                              <FileText size={14} /> Report
                            </ActionBtn>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </StyledTable>
          </div>
        </TableContainer>
      </DashboardLayout>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="application/pdf,image/*"
      />
    </PageContainer>
  );
};

export default LabPortal;
