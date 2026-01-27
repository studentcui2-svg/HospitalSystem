import React, { useState, useEffect, useRef } from "react";
import { motion as M, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Lock,
  ChevronLeft,
  Paperclip,
  Image as ImageIcon,
  User,
  UserRound,
  Loader2,
  MoreVertical,
  Camera,
  Smile,
} from "lucide-react";
import io from "socket.io-client";
import { jsonFetch, getApiBase } from "../utils/api";

const ENCRYPTION_KEY = "HospitalManagement2026SecureKey";

/**
 * WhatsApp-inspired styling
 * Teal Header: #075E54 / #128C7E
 * Background: #e5ddd5
 * Own Bubble: #dcf8c6
 * Other Bubble: #ffffff
 */
const ChatStyles = () => (
  <style>{`
    .chat-container {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 4000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chat-window {
      background: #e5ddd5;
      width: 100%;
      max-width: 500px;
      height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    @media (min-width: 768px) {
      .chat-window {
        border-radius: 8px;
        height: 85vh;
      }
    }
    .chat-header {
      background: #075E54;
      color: white;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
    }
    .header-left {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 4px;
    }
    .back-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #cedae0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
    }
    .doctor-details {
      display: flex;
      flex-direction: column;
    }
    .doctor-details h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    .doctor-details p {
      margin: 0;
      font-size: 12px;
      opacity: 0.8;
    }
    .header-actions {
      display: flex;
      gap: 15px;
      color: white;
    }
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
      background-repeat: repeat;
      background-attachment: local;
    }
    .encryption-info {
      background: #fef5c1;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      color: #525252;
      text-align: center;
      margin-bottom: 10px;
      align-self: center;
      max-width: 80%;
      box-shadow: 0 1px 1px rgba(0,0,0,0.1);
    }
    .message-wrapper {
      display: flex;
      width: 100%;
      margin-bottom: 2px;
    }
    .message-wrapper.own { justify-content: flex-end; }
    .message-wrapper.other { justify-content: flex-start; }
    
    .message-bubble {
      max-width: 85%;
      padding: 6px 10px 8px 10px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
      position: relative;
      font-size: 14.5px;
      line-height: 1.4;
    }
    .message-bubble.own {
      border-radius: 8px 0 8px 8px;
      background: #dcf8c6;
      color: #303030;
    }
    .message-bubble.other {
      border-radius: 0 8px 8px 8px;
      background: white;
      color: #303030;
    }
    .message-time {
      font-size: 11px;
      opacity: 0.5;
      text-align: right;
      margin-top: 4px;
      display: block;
    }
    .input-wrapper {
      padding: 10px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: transparent;
    }
    .input-container {
      flex: 1;
      background: white;
      border-radius: 24px;
      display: flex;
      align-items: center;
      padding: 5px 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .chat-input {
      flex: 1;
      padding: 8px;
      border: none;
      font-size: 16px;
      outline: none;
      max-height: 100px;
    }
    .icon-btn {
      color: #919191;
      cursor: pointer;
      padding: 5px;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .send-btn {
      background: #128C7E;
      color: white;
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      flex-shrink: 0;
    }
    .send-btn:disabled { opacity: 0.8; }
  `}</style>
);

const ChatInterface = ({
  isOpen,
  onClose,
  doctorId,
  patientId,
  doctorName,
  doctorDepartment,
  userRole = "user",
}) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const isLoggedIn = () => !!localStorage.getItem("app_token");

  // Fallback encryption logic
  const encryptMessage = (text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      console.error("Encryption error:", e);
      return text;
    }
  };

  const decryptMessage = (ciphertext) => {
    if (!ciphertext) return "";
    try {
      return decodeURIComponent(escape(atob(ciphertext)));
    } catch (error) {
      console.error("Decryption error:", error);
      return "[Message could not be decrypted]";
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isLoggedIn()) {
      onClose();
      return;
    }

    const initChat = async () => {
      try {
        setLoading(true);
        const chatParams = userRole === "doctor" ? { patientId } : { doctorId };
        const response = await jsonFetch("/api/chat", {
          method: "POST",
          body: chatParams,
        });

        if (response && response.chat) {
          setChat(response.chat);
          const decryptedMessages = response.chat.messages.map((msg) => ({
            ...msg,
            content: msg.content ? decryptMessage(msg.content) : undefined,
          }));
          setMessages(decryptedMessages);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [isOpen, doctorId, patientId, userRole, onClose]);

  useEffect(() => {
    if (!chat || !isOpen) return;

    const token = localStorage.getItem("app_token");
    const apiBase = getApiBase();
    const newSocket = io(apiBase, { auth: { token } });
    setSocket(newSocket);
    newSocket.emit("join_chat", { chatId: chat._id });

    // Mark messages as read when chat opens
    newSocket.emit("mark_chat_read", { chatId: chat._id });

    newSocket.on("new_chat_message", ({ chatId, message }) => {
      if (chatId === chat._id) {
        const decryptedMessage = {
          ...message,
          content: message.content
            ? decryptMessage(message.content)
            : undefined,
        };
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, decryptedMessage];
        });
        // Mark as read immediately when receiving new message while chat is open
        newSocket.emit("mark_chat_read", { chatId: chat._id });
      }
    });

    newSocket.on("chat_typing_status", ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    return () => {
      newSocket.emit("leave_chat", { chatId: chat._id });
      newSocket.disconnect();
    };
  }, [chat, isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !chat) return;
    const encryptedContent = encryptMessage(newMessage.trim());

    socket.emit("send_chat_message", {
      chatId: chat._id,
      content: encryptedContent,
      senderRole: userRole,
    });
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !chat) return;
    socket.emit("chat_typing", { chatId: chat._id, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat_typing", { chatId: chat._id, isTyping: false });
    }, 1500);
  };

  const handleSelectFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !chat) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/chat/${chat._id}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("app_token")}`,
        },
        body: formData,
      }).then((r) => r.json());

      if (res?.attachment && socket) {
        socket.emit("send_chat_message", {
          chatId: chat._id,
          senderRole: userRole,
          attachment: res.attachment,
        });
      }
    } catch (err) {
      console.error("Attachment upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ChatStyles />
      <AnimatePresence>
        <M.div
          className="chat-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <M.div
            className="chat-window"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* WhatsApp Header */}
            <div className="chat-header">
              <div className="header-left">
                <button className="back-btn" onClick={onClose}>
                  <ChevronLeft size={24} />
                </button>
                <div className="avatar">
                  {userRole === "doctor" ? (
                    <User size={28} />
                  ) : (
                    <UserRound size={28} />
                  )}
                </div>
                <div className="doctor-details">
                  <h3>{doctorName || "User"}</h3>
                  <p>{isTyping ? "typing..." : doctorDepartment || "Online"}</p>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="back-btn"
                  onClick={onClose}
                  style={{ padding: "8px" }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader2 className="animate-spin text-[#075E54]" />
              </div>
            ) : (
              <>
                <div className="messages-container">
                  <div className="encryption-info">
                    <Lock
                      size={10}
                      style={{ display: "inline", marginRight: "4px" }}
                    />
                    Messages are end-to-end encrypted. No one outside of this
                    chat can read them.
                  </div>

                  {messages.map((msg, index) => {
                    const isOwn = userRole === msg.senderRole;
                    return (
                      <div
                        key={msg._id || index}
                        className={`message-wrapper ${isOwn ? "own" : "other"}`}
                      >
                        <div
                          className={`message-bubble ${isOwn ? "own" : "other"}`}
                        >
                          {msg.content && (
                            <p style={{ margin: 0 }}>{msg.content}</p>
                          )}

                          {msg.attachment &&
                            msg.attachment.kind === "image" && (
                              <img
                                src={msg.attachment.url}
                                alt="attachment"
                                style={{
                                  maxWidth: "100%",
                                  borderRadius: "4px",
                                  marginTop: "4px",
                                }}
                              />
                            )}

                          {msg.attachment && msg.attachment.kind === "file" && (
                            <a
                              href={msg.attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#128C7E",
                                textDecoration: "none",
                                background: "rgba(0,0,0,0.05)",
                                padding: "8px",
                                borderRadius: "4px",
                                marginTop: "5px",
                              }}
                            >
                              <Paperclip size={14} />
                              <span
                                style={{
                                  fontSize: "12px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {msg.attachment.fileName || "File"}
                              </span>
                            </a>
                          )}

                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* WhatsApp Input Wrapper */}
                <div className="input-wrapper">
                  <div className="input-container">
                    <button className="icon-btn">
                      <Smile size={24} />
                    </button>
                    <input
                      className="chat-input"
                      type="text"
                      placeholder="Type a message"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                    />
                    <button className="icon-btn" onClick={handleSelectFile}>
                      <Paperclip
                        size={22}
                        style={{ transform: "rotate(45deg)" }}
                      />
                    </button>
                    {!newMessage.trim() && (
                      <button className="icon-btn">
                        <Camera size={22} />
                      </button>
                    )}
                  </div>

                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !uploading}
                  >
                    {uploading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <Send size={24} style={{ marginLeft: "4px" }} />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </>
            )}
          </M.div>
        </M.div>
      </AnimatePresence>
    </>
  );
};

export default ChatInterface;
