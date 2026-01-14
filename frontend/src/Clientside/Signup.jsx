import React, { useState } from "react";
import styled from "styled-components";
import SectionWithScene from "./SectionWithScene";
import {
  FaEnvelope,
  FaLock,
  FaCalendarAlt,
  FaVenusMars,
  FaUser,
  FaIdCard,
  FaArrowLeft,
  FaSignOutAlt,
} from "react-icons/fa";
import { jsonFetch } from "../utils/api";
import { NAV_HEIGHT } from "./NavBar";

const PageContainer = styled.div`
  min-height: calc(100vh - ${NAV_HEIGHT});
  padding-top: ${NAV_HEIGHT};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`;

const Logo = styled.h1`
  color: #4f46e5;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  cursor: pointer;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1;
  justify-content: flex-end;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    display: none;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: #4f46e5;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1200;
    border: 2px solid rgba(79, 70, 229, 0.12);
    background: rgba(79, 70, 229, 0.04);
    padding: 0.5rem 0.7rem;
    border-radius: 10px;
    transition: all 0.18s ease;

    &:hover {
      background: rgba(79, 70, 229, 0.06);
      transform: translateY(-2px);
    }
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: absolute;
  right: 0.75rem;
  top: calc(${NAV_HEIGHT} + 8px);
  background: rgba(255, 255, 255, 0.98);
  padding: 0.85rem 1rem;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  min-width: 200px;

  @media (max-width: 768px) {
    display: block;
  }

  a {
    display: block;
    padding: 0.5rem 0;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    z-index: 1100;
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
  transition: color 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #4f46e5;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const LoginButton = styled.button`
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1.2rem;
    font-size: 0.85rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const SignupCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 1.6rem;
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.12);
  width: 100%;
  max-width: 720px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.18);

  @media (max-width: 1024px) {
    max-width: 640px;
  }

  @media (max-width: 480px) {
    padding: 1.2rem;
    margin: 0.75rem;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #4a5568;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #4f46e5;
  }
`;

const CardHeader = styled.div`
  margin-bottom: 1.6rem;
`;

const CardTitle = styled.h2`
  color: #1a202c;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const CardSubtitle = styled.p`
  color: #718096;
  margin-bottom: 0.5rem;
  line-height: 1.6;
  font-size: 1.05rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
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
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f7fafc;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    background: white;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #a0aec0;
  }

  @media (max-width: 480px) {
    padding: 1rem 1rem 1rem 2.8rem;
    font-size: 0.9rem;
  }
`;

const OTPBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  input {
    width: 260px;
    padding: 0.95rem 1rem;
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    font-size: 1rem;
    text-align: center;
  }

  @media (max-width: 480px) {
    input {
      width: 100%;
    }
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f7fafc;
  appearance: none;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    background: white;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 1rem 1rem 1rem 2.8rem;
    font-size: 0.9rem;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1.2rem;
  pointer-events: none;

  @media (max-width: 480px) {
    left: 1rem;
    font-size: 1.1rem;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(79, 70, 229, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
`;

const SwitchText = styled.p`
  color: #718096;
  margin-top: 2.5rem;
  font-size: 1rem;

  a {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      text-decoration: underline;
      transform: translateX(2px);
    }
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-top: 2rem;
  }
`;

const SignupPage = ({
  onSwitchToLogin,
  onNavigateToHome,
  showSuccess,
  showError,
  showInfo,
  onLogin,
  standalone = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nic: "",
    dateOfBirth: "",
    gender: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const notifySuccess = (message) => {
    if (typeof showSuccess === "function") showSuccess(message);
  };

  const notifyError = (message) => {
    if (typeof showError === "function") showError(message);
    else console.error(message);
  };

  const notifyInfo = (message) => {
    if (typeof showInfo === "function") showInfo(message);
    else console.info(message);
  };

  const normalizeDob = (value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime())) return direct.toISOString();

    const match = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      const composed = new Date(`${year}-${month}-${day}T00:00:00Z`);
      if (!Number.isNaN(composed.getTime())) return composed.toISOString();
    }
    return undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (otpSent) {
      notifyError("Please enter the OTP sent to your email.");
      return;
    }

    if (!formData.fullName.trim()) {
      notifyError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      notifyError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 6) {
      notifyError("Password must be at least 6 characters long!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      notifyError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const normalizedName = formData.fullName.trim();
      const normalizedEmail = formData.email.trim().toLowerCase();
      const payload = {
        name: normalizedName,
        email: normalizedEmail,
        password: formData.password,
        nic: formData.nic.trim() || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: normalizeDob(formData.dateOfBirth),
      };

      const response = await jsonFetch("/api/auth/signup", {
        method: "POST",
        body: payload,
      });

      setOtpSent(true);
      setOtpInput("");
      notifySuccess(
        response?.emailSent
          ? `OTP sent to ${normalizedEmail}. Please check your inbox.`
          : "Account created but the OTP email could not be delivered."
      );
      if (response && response.emailSent === false) {
        notifyInfo(
          "If the email doesn't arrive, contact support or request a new OTP shortly."
        );
      }
    } catch (error) {
      console.error("[SIGNUP] Failed", error);
      notifyError(
        error?.message || "Registration failed. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (verifying) return;

    if (!otpInput.trim()) {
      notifyError("Please enter the OTP you received.");
      return;
    }
    setVerifying(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const response = await jsonFetch("/api/auth/verify-otp", {
        method: "POST",
        body: {
          email: normalizedEmail,
          otp: otpInput.trim(),
        },
      });

      notifySuccess("Registration complete! You are now logged in.");
      if (typeof onLogin === "function") onLogin(response);

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        nic: "",
        dateOfBirth: "",
        gender: "",
      });
      setOtpInput("");
      setOtpSent(false);
    } catch (error) {
      console.error("[VERIFY OTP] Failed", error);
      notifyError(
        error?.message || "Invalid or expired OTP. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;

    if (!formData.email.trim()) {
      notifyError("Please enter your email before requesting a new OTP.");
      return;
    }

    setResending(true);
    try {
      await jsonFetch("/api/auth/resend-otp", {
        method: "POST",
        body: { email: formData.email.trim().toLowerCase() },
      });
      notifySuccess(`OTP resent to ${formData.email.trim().toLowerCase()}.`);
    } catch (error) {
      console.error("[RESEND OTP] Failed", error);
      notifyError(
        error?.message || "Failed to resend OTP. Please try again later."
      );
    } finally {
      setResending(false);
    }
  };

  // menu state removed; global NavBar handles mobile menu

  if (standalone) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 20,
        }}
      >
        <SignupCard>
          <BackButton onClick={onNavigateToHome}>
            <FaArrowLeft /> Back to Home
          </BackButton>

          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardSubtitle>
              Please Sign Up To Continue
              <br />
              Learn from allies out and connect our adipolong old. Repeat colpa
              voluptia capsidia, plaque ex, tolarn adi quad error?
            </CardSubtitle>
          </CardHeader>

          {!otpSent ? (
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Zeeshan I Khan"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <FormRow>
                <InputGroup>
                  <InputIcon>
                    <FaEnvelope />
                  </InputIcon>
                  <Input
                    type="email"
                    name="email"
                    placeholder="zee@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                  <Input
                    type="password"
                    name="password"
                    placeholder="1234567"
                    value={formData.password}
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
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormRow>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Register"}
              </SubmitButton>
            </Form>
          ) : (
            <Form onSubmit={handleVerifyOtp}>
              <InputGroup>
                <InputIcon>
                  <FaEnvelope />
                </InputIcon>
                <Input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  required
                />
              </InputGroup>

              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <SubmitButton type="submit" disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify OTP"}
                </SubmitButton>
                <SubmitButton
                  type="button"
                  onClick={handleResend}
                  disabled={resending || verifying}
                  style={{
                    background: "#fff",
                    color: "#4f46e5",
                    border: "2px solid #4f46e5",
                  }}
                >
                  {resending ? "Resending..." : "Resend"}
                </SubmitButton>
              </div>
            </Form>
          )}

          <SwitchText>
            Already Registered? <a onClick={onSwitchToLogin}>Login Now</a>
          </SwitchText>
        </SignupCard>
      </div>
    );
  }

  return (
    <PageContainer>
      <MainContent>
        <SignupCard>
          <BackButton onClick={onNavigateToHome}>
            <FaArrowLeft /> Back to Home
          </BackButton>

          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardSubtitle>
              Please Sign Up To Continue
              <br />
              Learn from allies out and connect our adipolong old. Repeat colpa
              voluptia capsidia, plaque ex, tolarn adi quad error?
            </CardSubtitle>
          </CardHeader>

          {!otpSent ? (
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Zeeshan I Khan"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <FormRow>
                <InputGroup>
                  <InputIcon>
                    <FaEnvelope />
                  </InputIcon>
                  <Input
                    type="email"
                    name="email"
                    placeholder="zee@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <InputIcon>
                    <FaLock />
                  </InputIcon>
                  <Input
                    type="password"
                    name="password"
                    placeholder="1234567"
                    value={formData.password}
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
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormRow>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Register"}
              </SubmitButton>
            </Form>
          ) : (
            <Form onSubmit={handleVerifyOtp}>
              <OTPBox>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  required
                />
              </OTPBox>

              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <SubmitButton type="submit" disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify OTP"}
                </SubmitButton>
                <SubmitButton
                  type="button"
                  onClick={handleResend}
                  disabled={resending || verifying}
                  style={{
                    background: "#fff",
                    color: "#4f46e5",
                    border: "2px solid #4f46e5",
                  }}
                >
                  {resending ? "Resending..." : "Resend"}
                </SubmitButton>
              </div>
            </Form>
          )}

          <SwitchText>
            Already Registered? <a onClick={onSwitchToLogin}>Login Now</a>
          </SwitchText>
        </SignupCard>
      </MainContent>
    </PageContainer>
  );
};

export default SignupPage;
