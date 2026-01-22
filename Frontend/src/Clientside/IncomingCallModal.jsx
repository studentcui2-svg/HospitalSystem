import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Phone, PhoneOff, User } from "lucide-react";

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const CallCard = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;
  border: 4px solid rgba(255, 255, 255, 0.2);
`;

const CallerName = styled.h2`
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
`;

const CallType = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
`;

const CallButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AcceptButton = styled(CallButton)`
  background: linear-gradient(135deg, #10b981, #059669);

  &:hover {
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.5);
  }
`;

const DeclineButton = styled(CallButton)`
  background: linear-gradient(135deg, #ef4444, #dc2626);

  &:hover {
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.5);
  }
`;

const RingingText = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 1rem;
  font-weight: 600;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const IncomingCallModal = ({ callerName, callerRole, onAccept, onDecline }) => {
  const [ringing] = useState(true);

  useEffect(() => {
    // Play ringtone (optional)
    // const audio = new Audio('/ringtone.mp3');
    // audio.loop = true;
    // audio.play();
    // return () => audio.pause();
  }, []);

  return (
    <Overlay>
      <CallCard>
        <Avatar>
          <User size={64} color="white" />
        </Avatar>

        <CallerName>{callerName}</CallerName>
        <CallType>
          {callerRole === "doctor" ? "Doctor" : "Patient"} • Video Call
        </CallType>

        {ringing && <RingingText>Incoming call...</RingingText>}

        <ButtonGroup>
          <DeclineButton onClick={onDecline}>
            <PhoneOff size={28} color="white" />
          </DeclineButton>

          <AcceptButton onClick={onAccept}>
            <Phone size={28} color="white" />
          </AcceptButton>
        </ButtonGroup>
      </CallCard>
    </Overlay>
  );
};

export default IncomingCallModal;
