import React, { useState } from "react";
import styled from "styled-components";
import SectionWithScene from "./SectionWithScene";
import { FaEnvelope, FaLock, FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import { jsonFetch } from "../utils/api";

import { NAV_HEIGHT } from "./NavBar";
const PageContainer = styled.div`
  min-height: calc(100vh - ${NAV_HEIGHT});
  padding-top: ${NAV_HEIGHT};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
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
  transform-origin: top right;
  transition: all 0.16s ease;

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
  margin-left: 0.5rem;
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

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 2.4rem;
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.12);
  width: 100%;
  max-width: 640px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.18);

  @media (max-width: 1024px) {
    max-width: 540px;
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
  margin-bottom: 2.5rem;
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
    font-size: 1.8rem;
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

const InputIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1.2rem;

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

const LoginPage = ({
  onSwitchToSignup,
  onNavigateToHome,
  showError,
  onLogin,
  standalone = false,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
      const response = await jsonFetch("/api/auth/login", {
        method: "POST",
        body: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (typeof onLogin === "function") onLogin(response);
    } catch (error) {
      console.error("[LOGIN] Failed", error);
      if (typeof showError === "function") {
        showError(error?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <LoginCard>
          <BackButton onClick={onNavigateToHome}>
            <FaArrowLeft /> Back to Home
          </BackButton>

          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardSubtitle>
              Please Login To Continue
              <br />
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
              <br />
              Pleased cullip voluptate egestad i lacinia ex, totum aliquet
              error?
            </CardSubtitle>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
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
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Checking credentials..." : "Login"}
            </SubmitButton>
          </Form>

          <SwitchText>
            Not Registered? <a onClick={onSwitchToSignup}>Register Now</a>
          </SwitchText>
        </LoginCard>
      </div>
    );
  }

  return (
    <PageContainer>
      <MainContent>
        <LoginCard>
          <BackButton onClick={onNavigateToHome}>
            <FaArrowLeft /> Back to Home
          </BackButton>

          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardSubtitle>
              Please Login To Continue
              <br />
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
              <br />
              Pleased cullip voluptate egestad i lacinia ex, totum aliquet
              error?
            </CardSubtitle>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
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
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Checking credentials..." : "Login"}
            </SubmitButton>
          </Form>

          <SwitchText>
            Not Registered? <a onClick={onSwitchToSignup}>Register Now</a>
          </SwitchText>
        </LoginCard>
      </MainContent>
    </PageContainer>
  );
};

export default LoginPage;
