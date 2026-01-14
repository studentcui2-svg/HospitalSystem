import React, { useState, useRef, useEffect } from "react";
import { jsonFetch } from "../utils/api";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollingRef = useRef(null);

  useEffect(() => {
    if (scrollingRef.current) {
      scrollingRef.current.scrollTop = scrollingRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const newMsg = { from: "user", text };
    setMessages((m) => [...m, newMsg]);
    setInput("");
    try {
      const res = await jsonFetch("/api/chatbot", {
        method: "POST",
        body: { message: text },
      });
      const reply = res?.reply || "(no reply)";
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    } catch (err) {
      console.error("Chatbot error", err);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Sorry, I couldn't reach the assistant." },
      ]);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      <div
        style={{
          display: open ? "block" : "none",
          width: 320,
          height: 420,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          borderRadius: 8,
          overflow: "hidden",
          background: "white",
          color: "#111",
        }}
      >
        <div style={{ padding: 12, background: "#0f172a", color: "#fff" }}>
          <strong>Hospital Assistant</strong>
          <button
            onClick={() => setOpen(false)}
            style={{
              float: "right",
              background: "transparent",
              color: "#fff",
              border: 0,
            }}
          >
            ✕
          </button>
        </div>
        <div
          ref={scrollingRef}
          style={{
            padding: 12,
            height: 320,
            overflowY: "auto",
            background: "#f6f7fb",
          }}
        >
          {messages.length === 0 && (
            <div style={{ color: "#666" }}>
              Ask about diseases, doctor timings, or appointments.
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 10,
                textAlign: m.from === "user" ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 16,
                  background: m.from === "user" ? "#0ea5a4" : "#e6e9f2",
                  color: m.from === "user" ? "#fff" : "#111",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{ padding: 8, display: "flex", gap: 8, background: "#fff" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about doctors, timings, symptoms..."
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#0f172a",
              color: "#fff",
              border: 0,
            }}
          >
            Send
          </button>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "#0ea5a4",
          color: "#fff",
          border: 0,
          boxShadow: "0 6px 18px rgba(14,165,164,0.25)",
          fontSize: 18,
        }}
      >
        {open ? "💬" : "🤖"}
      </button>
    </div>
  );
};

export default Chatbot;
