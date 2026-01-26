import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaComments, FaUser } from "react-icons/fa";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";
import ChatInterface from "./ChatInterface";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ChatsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ChatList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 0.3rem;
`;

const LastMessage = styled.div`
  color: #718096;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const ChatTime = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
`;

const UnreadBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  font-size: 1.1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

const DoctorChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    // Check login before loading chats
    const token = localStorage.getItem("app_token");
    if (!token) {
      toast.error("Please login to view chats");
      window.location.hash = "#/login";
      return;
    }
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await jsonFetch("/api/chat");
      if (response && response.chats) {
        setChats(response.chats);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setChatOpen(true);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading chats...</LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Patient Messages</Title>
      </Header>

      <ChatsContainer>
        {chats.length === 0 ? (
          <EmptyState>No active chats yet</EmptyState>
        ) : (
          <ChatList>
            {chats.map((chat) => (
              <ChatItem key={chat._id} onClick={() => handleChatClick(chat)}>
                <Avatar>
                  <FaUser />
                </Avatar>
                <ChatInfo>
                  <ChatName>{chat.patient?.name || "Patient"}</ChatName>
                  <LastMessage>
                    {chat.lastMessage || "No messages yet"}
                  </LastMessage>
                </ChatInfo>
                <ChatMeta>
                  <ChatTime>{formatTime(chat.lastMessageTime)}</ChatTime>
                  {chat.unreadCount?.doctor > 0 && (
                    <UnreadBadge>{chat.unreadCount.doctor}</UnreadBadge>
                  )}
                </ChatMeta>
              </ChatItem>
            ))}
          </ChatList>
        )}
      </ChatsContainer>

      {/* Chat Interface */}
      {selectedChat && (
        <ChatInterface
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedChat(null);
            loadChats(); // Refresh chat list
          }}
          patientId={selectedChat.patient?._id}
          doctorName={selectedChat.patient?.name}
          doctorDepartment="Patient"
          userRole="doctor"
        />
      )}
    </Container>
  );
};

export default DoctorChats;
