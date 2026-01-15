import React, { useState } from "react";
import styled from "styled-components";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaVenusMars,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";

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

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    nic: "",
    dateOfBirth: "",
    gender: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Admin added successfully!");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        nic: "",
        dateOfBirth: "",
        gender: "",
        password: "",
      });
    } catch {
      toast.error("Failed to add admin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Header>
        <Title>ADD NEW ADMIN</Title>
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
                <FaLock />
              </InputIcon>
              <div style={{ position: "relative" }}>
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
          </FormRow>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Adding Admin..." : "ADD NEW ADMIN"}
          </SubmitButton>
        </Form>
      </FormCard>
    </FormContainer>
  );
};

export default AddAdmin;
