import React, { useState } from "react";
import styled from "styled-components";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaVenusMars,
  FaStethoscope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUpload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { jsonFetch } from "../utils/api";

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 0;
`;
const Header = styled.div`
  margin-bottom: 2rem;
`;
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;
const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
`;
const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: center;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;
const InputGroup = styled.div`
  position: relative;
`;
const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
  &:focus {
    border-color: #4f46e5;
    background: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  &::placeholder {
    color: #9ca3af;
  }
`;
const Select = styled.select`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
  appearance: none;
  &:focus {
    border-color: #4f46e5;
    background: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;
const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1.1rem;
`;
const FileUpload = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  &:hover {
    border-color: #4f46e5;
    background: #f3f4f6;
  }
`;
const FileInput = styled.input`
  display: none;
`;
const FileUploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;
const FileUploadIcon = styled.div`
  color: #6b7280;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;
const FileUploadText = styled.div`
  color: #6b7280;
  font-weight: 500;
`;
const FileName = styled.span`
  color: #4f46e5;
  font-weight: 600;
`;
const SubmitButton = styled.button`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AddDoctor = () => {
  const [roleChoice, setRoleChoice] = useState(null); // null | 'doctor' | 'lab'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    nic: "",
    dateOfBirth: "",
    gender: "",
    department: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };
  const toIsoDate = (value) => {
    if (!value) return undefined;
    const parts = value.split("/");
    if (parts.length !== 3) return undefined;
    const [day, month, year] = parts;
    const parsed = new Date(`${year}-${month}-${day}T09:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const name =
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
      const payload = {
        name: name || formData.firstName || formData.lastName || "",
        email: formData.email,
        phone: formData.mobileNumber || undefined,
        nic: formData.nic || undefined,
        dateOfBirth: toIsoDate(formData.dateOfBirth) || undefined,
        gender: formData.gender || undefined,
        department: formData.department || undefined,
        password: formData.password || undefined,
        role: roleChoice === "lab" ? "lab" : "doctor",
      };
      if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE) {
          toast.error("Profile image must be smaller than 2MB.");
          setLoading(false);
          return;
        }
        const dataUrl = await fileToDataUrl(selectedFile);
        payload.photo = dataUrl;
      }
      await jsonFetch("/api/doctors", { method: "POST", body: payload });
      toast.success("User created successfully");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        nic: "",
        dateOfBirth: "",
        gender: "",
        department: "",
        password: "",
      });
      setSelectedFile(null);
      setRoleChoice(null);
    } catch (err) {
      console.error("[ADD DOCTOR] Failed", err);
      toast.error(err?.message || "Failed to register user. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (!roleChoice) {
    return (
      <FormContainer>
        <Header>
          <Title>REGISTER NEW USER</Title>
          <Subtitle>Choose role to register</Subtitle>
        </Header>
        <FormCard>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <SubmitButton onClick={() => setRoleChoice("doctor")}>
              Register Doctor
            </SubmitButton>
            <SubmitButton onClick={() => setRoleChoice("lab")}>
              Register Lab Attendant
            </SubmitButton>
          </div>
        </FormCard>
      </FormContainer>
    );
  }
  return (
    <FormContainer>
      <Header>
        <Title>
          {roleChoice === "lab" ? "Register Lab Attendant" : "Register Doctor"}
        </Title>
        <Subtitle>ZEECARE MEDICAL INSTITUTE</Subtitle>
      </Header>
      <FormCard>
        <Form onSubmit={handleSubmit}>
          <FormRow>
            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </InputGroup>
            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </InputGroup>
          </FormRow>
          <FormRow>
            <InputGroup>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputGroup>
            <InputGroup>
              <InputIcon>
                <FaPhone />
              </InputIcon>
              <Input
                type="tel"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </InputGroup>
          </FormRow>
          {roleChoice !== "lab" && (
            <>
              <FormRow>
                <InputGroup>
                  <InputIcon>
                    <FaIdCard />
                  </InputIcon>
                  <Input
                    type="text"
                    name="nic"
                    placeholder="NIC"
                    value={formData.nic}
                    onChange={handleChange}
                  />
                </InputGroup>
                <InputGroup>
                  <InputIcon>
                    <FaCalendarAlt />
                  </InputIcon>
                  <Input
                    type="text"
                    name="dateOfBirth"
                    placeholder="DD/MM/YYYY"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormRow>
              <FormRow>
                <InputGroup>
                  <InputIcon>
                    <FaVenusMars />
                  </InputIcon>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </InputGroup>
                <InputGroup>
                  <InputIcon>
                    <FaStethoscope />
                  </InputIcon>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="neurology">Neurology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="radiology">Radiology</option>
                    <option value="ent">ENT</option>
                  </Select>
                </InputGroup>
              </FormRow>
            </>
          )}
          {roleChoice === "lab" && (
            <FormRow>
              <InputGroup>
                <InputIcon>
                  <FaVenusMars />
                </InputIcon>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </InputGroup>
              <InputGroup>
                <FileUpload
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <FileUploadContent>
                    <FileUploadIcon>
                      <FaUpload />
                    </FileUploadIcon>
                    <FileUploadText>Upload profile photo</FileUploadText>
                    <FileName>{selectedFile?.name}</FileName>
                  </FileUploadContent>
                </FileUpload>
                <FileInput
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </InputGroup>
            </FormRow>
          )}
          <FormRow>
            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </InputGroup>
            <div />
          </FormRow>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </SubmitButton>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setRoleChoice(null)}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </Form>
      </FormCard>
    </FormContainer>
  );
};

export default AddDoctor;
