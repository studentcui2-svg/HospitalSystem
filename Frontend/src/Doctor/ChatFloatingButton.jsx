import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaComments, FaTimes } from "react-icons/fa";
import { jsonFetch } from "../utils/api";
import { toast } from "react-toastify";
import ChatInterface from "../Clientside/ChatInterface";

const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 999;
  animation: pulse 2s infinite;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 28px rgba(37, 211, 102, 0.7);
  }

  &:active {
    transform: scale(0.95);
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.5);
    }
    50% {
      box-shadow: 0 4px 30px rgba(37, 211, 102, 0.8);
    }
  }

  @media (max-width: 768px) {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 56px;
    height: 56px;
    font-size: 1.6rem;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff3b30;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid white;
  animation: bounce 0.5s ease;

  @keyframes bounce {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
`;

const ChatListModal = styled.div`
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 998;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    width: calc(100vw - 3rem);
    right: 1.5rem;
    bottom: 5rem;
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatList = styled.div`
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const ChatItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: #2d3748;
  margin-bottom: 0.2rem;
`;

const LastMessage = styled.div`
  color: #718096;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const ChatTime = styled.div`
  font-size: 0.7rem;
  color: #a0aec0;
`;

const UnreadBadge = styled.div`
  background: #25d366;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 700;
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #718096;
  font-size: 0.95rem;
`;

const LoadingState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #667eea;
  font-size: 0.95rem;
`;

const ChatFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatInterfaceOpen, setChatInterfaceOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial unread count
    loadUnreadCount();

    // Poll for unread messages every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const token = localStorage.getItem("app_token");
    if (!token) return;

    try {
      const response = await jsonFetch("/api/chat");
      if (response && response.chats) {
        const total = response.chats.reduce(
          (sum, chat) => sum + (chat.unreadCount?.doctor || 0),
          0,
        );
        setUnreadCount(total);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const loadChats = async () => {
    const token = localStorage.getItem("app_token");
    if (!token) {
      toast.error("Please login to view chats");
      return;
    }

    setLoading(true);
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

  const handleButtonClick = () => {
    if (!isOpen) {
      loadChats();
    }
    setIsOpen(!isOpen);
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setChatInterfaceOpen(true);
    setIsOpen(false);
  };

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString();
  };

  return (
    <>
      <FloatingButton onClick={handleButtonClick}>
        <FaComments />
        {unreadCount > 0 && (
          <NotificationBadge>{unreadCount}</NotificationBadge>
        )}
      </FloatingButton>

      {isOpen && (
        <ChatListModal>
          <ModalHeader>
            <HeaderTitle>Patient Messages</HeaderTitle>
            <CloseButton onClick={() => setIsOpen(false)}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <ChatList>
            {loading ? (
              <LoadingState>Loading chats...</LoadingState>
            ) : chats.length === 0 ? (
              <EmptyState>No active chats yet</EmptyState>
            ) : (
              chats.map((chat) => (
                <ChatItem key={chat._id} onClick={() => handleChatClick(chat)}>
                  <Avatar>
                    {(chat.patient?.name || "P").charAt(0).toUpperCase()}
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
              ))
            )}
          </ChatList>
        </ChatListModal>
      )}

      {/* Chat Interface */}
      {selectedChat && (
        <ChatInterface
          isOpen={chatInterfaceOpen}
          onClose={() => {
            setChatInterfaceOpen(false);
            setSelectedChat(null);
            loadUnreadCount(); // Refresh unread count
          }}
          patientId={selectedChat.patient?._id}
          doctorName={selectedChat.patient?.name}
          doctorDepartment="Patient"
          userRole="doctor"
        />
      )}
    </>
  );
};

export default ChatFloatingButton;
