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
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
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

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
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
  align-items: center; /* vertically center children so inputs align with taller file upload */

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullName = `${formData.firstName || ""} ${
        formData.lastName || ""
      }`.trim();

      const toIsoDate = (value) => {
        if (!value) return undefined;
        const [day, month, year] = value.split("/");
        if (!day || !month || !year) return undefined;
        const parsed = new Date(`${year}-${month}-${day}T09:00:00`);
        return Number.isNaN(parsed.getTime())
          ? undefined
          : parsed.toISOString();
      };

      let photoData;
      if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE) {
          toast.error("Profile image must be smaller than 2MB.");
          setLoading(false);
          return;
        }
        try {
          photoData = await fileToDataUrl(selectedFile);
        } catch (fileError) {
          console.error("[ADD DOCTOR] Failed to read file", fileError);
          toast.error("Unable to read the selected image file.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        department: formData.department
          ? formData.department.replace(/\b\w/g, (char) => char.toUpperCase())
          : undefined,
        nic: formData.nic,
        gender: formData.gender,
        bio: `Joined via admin portal on ${new Date().toLocaleDateString()}`,
        dateOfBirth: toIsoDate(formData.dateOfBirth),
        photo: photoData,
        password: formData.password,
      };

      console.log("[ADD DOCTOR] Submitting payload", payload);
      const response = await jsonFetch("/api/doctors", {
        method: "POST",
        body: payload,
      });

      toast.success(
        `Doctor ${response?.doctor?.name || fullName} registered successfully!`
      );

      // Reset form
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
    } catch (error) {
      console.error("[ADD DOCTOR] Failed", error);
      toast.error(
        error?.message || "Failed to register doctor. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Header>
        <Title>REGISTER A NEW DOCTOR</Title>
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
                required
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
                required
              />
            </InputGroup>
          </FormRow>

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
                required
              />
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Temporary Password (doctor will use to login)"
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
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#718096",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 4,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </InputGroup>
            <InputGroup>
              <InputIcon>
                <FaCalendarAlt />
              </InputIcon>
              <Input
                type="text"
                name="dateOfBirth"
                placeholder="Date of Birth dd/mm/yyyy"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
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
                required
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
                required
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

          <FormRow>
            <FileUpload
              onClick={() => document.getElementById("file-upload").click()}
            >
              <FileInput
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept="image/*"
              />
              <FileUploadContent>
                <FileUploadIcon>
                  <FaUpload />
                </FileUploadIcon>
                {selectedFile &&
                selectedFile.type &&
                selectedFile.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="preview"
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "2px solid rgba(79,70,229,0.12)",
                    }}
                  />
                ) : (
                  <FileUploadText>
                    {selectedFile ? (
                      <FileName>{selectedFile.name}</FileName>
                    ) : (
                      <>
                        Upload profile photo
                        <span
                          style={{
                            color: "#9CA3AF",
                            display: "block",
                            marginTop: 6,
                          }}
                        >
                          (Tap to choose or use device camera)
                        </span>
                      </>
                    )}
                  </FileUploadText>
                )}
              </FileUploadContent>
            </FileUpload>
          </FormRow>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Registering Doctor..." : "REGISTER NEW DOCTOR"}
          </SubmitButton>
        </Form>
      </FormCard>
    </FormContainer>
  );
};

export default AddDoctor;
