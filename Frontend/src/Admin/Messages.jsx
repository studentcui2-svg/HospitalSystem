import React, { useState } from "react";
import styled from "styled-components";
import { FaUser, FaEnvelope, FaPhone, FaComment } from "react-icons/fa";

const MessagesContainer = styled.div`
  max-width: 1000px;
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

const MessagesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MessageCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #4f46e5;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-left: 3px solid #4f46e5;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const MessageIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
`;

const MessageSender = styled.div`
  flex: 1;
`;

const SenderName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const SenderDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;

  @media (max-width: 640px) {
    gap: 1rem;
    flex-direction: column;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

const DetailIcon = styled.div`
  color: #4f46e5;
  font-size: 0.9rem;
`;

const MessageContent = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 3px solid #e5e7eb;

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const MessageLabel = styled.span`
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
`;

const MessageText = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin: 0.5rem 0 0 0;
`;

const Messages = ({ messages = [], onReply }) => {
  const [replyState, setReplyState] = useState({});

  const handleChange = (id, value) => {
    setReplyState((s) => ({ ...s, [id]: value }));
  };

  const handleReply = (message) => {
    const text = (replyState[message._id] || "").trim();
    if (!text || typeof onReply !== "function") return;
    onReply(message._id, text);
    // optimistic clear
    setReplyState((s) => ({ ...s, [message._id]: "" }));
  };

  return (
    <MessagesContainer>
      <Header>
        <Title>MESSAGE</Title>
      </Header>

      <MessagesGrid>
        {messages.length === 0 ? (
          <div style={{ padding: 20 }}>No messages yet.</div>
        ) : (
          messages.map((message) => (
            <MessageCard key={message._id || message.email}>
              <MessageHeader>
                <MessageIcon>
                  <FaUser />
                </MessageIcon>
                <MessageSender>
                  <SenderName>
                    {message.firstName} {message.lastName}
                  </SenderName>
                  <SenderDetails>
                    <DetailItem>
                      <DetailIcon>
                        <FaEnvelope />
                      </DetailIcon>
                      {message.email}
                    </DetailItem>
                    <DetailItem>
                      <DetailIcon>
                        <FaPhone />
                      </DetailIcon>
                      {message.phone}
                    </DetailItem>
                  </SenderDetails>
                </MessageSender>
              </MessageHeader>

              <MessageContent>
                <div>
                  <MessageLabel>Message:</MessageLabel>
                </div>
                <MessageText>{message.message}</MessageText>
                {message.reply ? (
                  <div style={{ marginTop: 12 }}>
                    <MessageLabel>Reply:</MessageLabel>
                    <MessageText>{message.reply}</MessageText>
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <MessageLabel>Send reply:</MessageLabel>
                    <textarea
                      value={replyState[message._id] || ""}
                      onChange={(e) =>
                        handleChange(message._id, e.target.value)
                      }
                      rows={3}
                      style={{ width: "100%", marginTop: 8, padding: 8 }}
                    />
                    <div style={{ marginTop: 8, textAlign: "right" }}>
                      <button
                        onClick={() => handleReply(message)}
                        style={{
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          width: "100%",
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </MessageContent>
            </MessageCard>
          ))
        )}
      </MessagesGrid>
    </MessagesContainer>
  );
};

export default Messages;
