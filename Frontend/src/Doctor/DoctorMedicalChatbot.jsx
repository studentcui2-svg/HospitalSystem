import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  FaPaperPlane,
  FaUpload,
  FaTimes,
  FaRobot,
  FaUserMd,
  FaFileMedical,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  max-height: none;
  max-width: 1400px;
  margin: 2rem auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  overflow: visible;

  @media (max-width: 768px) {
    min-height: 85vh;
    margin: 1rem;
    border-radius: 15px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 2rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const HeaderIcon = styled(FaRobot)`
  font-size: 2rem;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

const HeaderText = styled.div`
  flex: 1;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin: 0.3rem 0 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.2rem;
    }
    p {
      font-size: 0.8rem;
    }
  }
`;

const MessagesArea = styled.div`
  max-height: 400px;
  min-height: 300px;
  overflow-y: auto;
  padding: 2rem;
  background: #0f1419;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const Message = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${(props) =>
    props.$sender === "user" &&
    `
    flex-direction: row-reverse;
  `}
`;

const MessageIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;

  ${(props) =>
    props.$sender === "user"
      ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  `
      : `
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  `}
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 1.2rem 1.5rem;
  border-radius: 15px;
  word-wrap: break-word;

  ${(props) =>
    props.$sender === "user"
      ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 5px;
  `
      : `
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-bottom-left-radius: 5px;
  `}

  h1, h2, h3, h4, h5, h6 {
    color: ${(props) => (props.$sender === "user" ? "#fff" : "#667eea")};
    margin-top: 1.5rem;
    margin-bottom: 0.8rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.3rem;
    border-bottom: 2px solid
      ${(props) =>
        props.$sender === "user"
          ? "rgba(255,255,255,0.3)"
          : "rgba(102, 126, 234, 0.3)"};
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    color: ${(props) => (props.$sender === "user" ? "#fff" : "#8b9aff")};
  }

  strong {
    color: ${(props) => (props.$sender === "user" ? "#fff" : "#a5b4fc")};
    font-weight: 700;
  }

  p {
    margin: 0.8rem 0;
    line-height: 1.7;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.5rem 0;
    line-height: 1.6;
  }

  code {
    background: ${(props) =>
      props.$sender === "user"
        ? "rgba(0,0,0,0.2)"
        : "rgba(102, 126, 234, 0.1)"};
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: "Courier New", monospace;
  }

  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
  }

  blockquote {
    border-left: 4px solid
      ${(props) =>
        props.$sender === "user" ? "rgba(255,255,255,0.5)" : "#667eea"};
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    max-width: 85%;
    padding: 1rem;
    font-size: 0.9rem;

    h2 {
      font-size: 1.1rem;
    }
    h3 {
      font-size: 1rem;
    }
  }
`;

const InputSection = styled.div`
  background: #1a1a2e;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  max-height: 70vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    max-height: 65vh;
  }
`;

const PatientForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #a5b4fc;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  option {
    background: #16213e;
    color: white;
  }
`;

const FileUploadSection = styled.div`
  margin-bottom: 1rem;
`;

const FileUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
  min-height: 48px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.1rem;
  }

  input {
    display: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const FileList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const FileTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  color: #a5b4fc;
  border-radius: 20px;
  font-size: 0.85rem;

  svg {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #f5576c;
    }
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SendButton = styled.button`
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.3rem;
  padding: 1rem;

  span {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #a5b4fc;

  h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #667eea;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  ul {
    text-align: left;
    max-width: 600px;
    margin: 0 auto;
    list-style: none;
    padding: 0;

    li {
      padding: 0.8rem;
      margin: 0.5rem 0;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 8px;
      border-left: 4px solid #667eea;

      &::before {
        content: "✓ ";
        color: #667eea;
        font-weight: 700;
        margin-right: 0.5rem;
      }
    }
  }
`;

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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (
      !patientInfo.patientName ||
      !patientInfo.patientAge ||
      !patientInfo.symptoms
    ) {
      alert("Please fill in patient name, age, and symptoms");
      return;
    }

    const userMessage = {
      sender: "user",
      content: `**Patient Analysis Request**\n\n**Patient:** ${patientInfo.patientName}, ${patientInfo.patientAge} years, ${patientInfo.patientGender}\n\n**Symptoms:** ${patientInfo.symptoms}\n\n${patientInfo.medicalHistory ? `**Medical History:** ${patientInfo.medicalHistory}\n\n` : ""}${patientInfo.currentMedications ? `**Current Medications:** ${patientInfo.currentMedications}\n\n` : ""}${patientInfo.additionalNotes ? `**Additional Notes:** ${patientInfo.additionalNotes}\n\n` : ""}${files.length > 0 ? `**Attached Files:** ${files.length} medical document(s)` : ""}`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();

      // Append all patient information
      Object.keys(patientInfo).forEach((key) => {
        formData.append(key, patientInfo[key]);
      });

      // Append files
      files.forEach((file) => {
        formData.append("medicalFiles", file);
      });

      // Use the same token retrieval method as the rest of the app
      const token =
        window.__APP_TOKEN__ ||
        localStorage.getItem("app_token") ||
        localStorage.getItem("token");

      console.log("[Medical Chatbot] Token check:", {
        hasWindowToken: !!window.__APP_TOKEN__,
        hasAppToken: !!localStorage.getItem("app_token"),
        hasToken: !!localStorage.getItem("token"),
        tokenLength: token?.length,
      });

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/doctor-chatbot/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const aiMessage = {
        sender: "ai",
        content: response.data.analysis,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Reset form
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error analyzing medical case:", error);
      let errorMsg = "❌ **Error:** Unable to analyze the medical case. ";

      if (error.response?.status === 401) {
        errorMsg += "Authentication failed. Please logout and login again.";
      } else if (error.message.includes("No authentication token")) {
        errorMsg += "Please logout and login again to refresh your session.";
      } else if (error.response?.data?.message) {
        errorMsg += error.response.data.message;
      } else {
        errorMsg += "Please try again or check your connection.";
      }

      const errorMessage = {
        sender: "ai",
        content: errorMsg,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderIcon />
        <HeaderText>
          <h2>Medical AI Assistant</h2>
          <p>Comprehensive Patient Analysis & Treatment Planning</p>
        </HeaderText>
        <FaFileMedical style={{ fontSize: "1.5rem" }} />
      </ChatHeader>

      <MessagesArea>
        {messages.length === 0 ? (
          <WelcomeMessage>
            <h3>🩺 Advanced Medical Analysis System</h3>
            <p>
              Get comprehensive AI-powered medical insights for your patients
            </p>
            <ul>
              <li>Upload CT scans, lab reports, and X-rays</li>
              <li>Receive detailed disease diagnosis and etiology</li>
              <li>Get complete treatment plans with medications</li>
              <li>Severity assessment and complication risks</li>
              <li>Follow-up schedules and monitoring guidelines</li>
              <li>Patient education and warning signs</li>
            </ul>
          </WelcomeMessage>
        ) : (
          messages.map((msg, index) => (
            <Message key={index} $sender={msg.sender}>
              <MessageIcon $sender={msg.sender}>
                {msg.sender === "user" ? <FaUserMd /> : <FaRobot />}
              </MessageIcon>
              <MessageBubble $sender={msg.sender}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </MessageBubble>
            </Message>
          ))
        )}
        {loading && (
          <Message $sender="ai">
            <MessageIcon $sender="ai">
              <FaRobot />
            </MessageIcon>
            <MessageBubble $sender="ai">
              <LoadingDots>
                <span></span>
                <span></span>
                <span></span>
              </LoadingDots>
              Analyzing medical case... This may take a moment for comprehensive
              analysis.
            </MessageBubble>
          </Message>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>

      <InputSection>
        <PatientForm>
          <FormGroup>
            <Label>Patient Name *</Label>
            <Input
              type="text"
              name="patientName"
              value={patientInfo.patientName}
              onChange={handleInputChange}
              placeholder="Enter patient name"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Age *</Label>
            <Input
              type="number"
              name="patientAge"
              value={patientInfo.patientAge}
              onChange={handleInputChange}
              placeholder="Age in years"
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Gender</Label>
            <Select
              name="patientGender"
              value={patientInfo.patientGender}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </FormGroup>
        </PatientForm>

        <FormGroup style={{ marginBottom: "1rem" }}>
          <Label>Chief Complaints & Symptoms *</Label>
          <TextArea
            name="symptoms"
            value={patientInfo.symptoms}
            onChange={handleInputChange}
            placeholder="Describe patient symptoms, complaints, duration, severity..."
            disabled={loading}
          />
        </FormGroup>

        <PatientForm>
          <FormGroup>
            <Label>Medical History</Label>
            <TextArea
              name="medicalHistory"
              value={patientInfo.medicalHistory}
              onChange={handleInputChange}
              placeholder="Past medical conditions, surgeries, allergies..."
              disabled={loading}
              style={{ minHeight: "80px" }}
            />
          </FormGroup>
          <FormGroup>
            <Label>Current Medications</Label>
            <TextArea
              name="currentMedications"
              value={patientInfo.currentMedications}
              onChange={handleInputChange}
              placeholder="List current medications with dosages..."
              disabled={loading}
              style={{ minHeight: "80px" }}
            />
          </FormGroup>
        </PatientForm>

        <FormGroup style={{ marginBottom: "1rem" }}>
          <Label>Additional Notes</Label>
          <TextArea
            name="additionalNotes"
            value={patientInfo.additionalNotes}
            onChange={handleInputChange}
            placeholder="Any other relevant information..."
            disabled={loading}
            style={{ minHeight: "60px" }}
          />
        </FormGroup>

        <FileUploadSection>
          <FileUploadLabel>
            <FaUpload />
            Upload Medical Reports (CT Scans, Lab Tests, X-Rays)
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.dcm,.dicom"
              onChange={handleFileChange}
              disabled={loading}
            />
          </FileUploadLabel>
          {files.length > 0 && (
            <FileList>
              {files.map((file, index) => (
                <FileTag key={index}>
                  <FaFileMedical />
                  {file.name}
                  <FaTimes onClick={() => removeFile(index)} />
                </FileTag>
              ))}
            </FileList>
          )}
        </FileUploadSection>

        <InputWrapper>
          <SendButton onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <>Analyzing...</>
            ) : (
              <>
                <FaPaperPlane />
                Analyze Patient Case
              </>
            )}
          </SendButton>
        </InputWrapper>
      </InputSection>
    </ChatContainer>
  );
};

export default DoctorMedicalChatbot;
