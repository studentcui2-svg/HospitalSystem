/* eslint-env node, commonjs */
/* CommonJS conversion: use require() because backend/package.json uses "type": "commonjs" */
// Ensure this file is run with Node.js in CommonJS mode (default for .js files)
// If you see "'require' is not defined", make sure you are not running with "type": "module" in package.json or rename this file to .cjs

require("dotenv").config();
const express = require("express");
let helmet;
let rateLimit;
try {
  helmet = require("helmet");
} catch (e) {
  console.warn(
    "Optional dependency 'helmet' not installed — skipping security headers.",
  );
  helmet = null;
}

try {
  rateLimit = require("express-rate-limit");
} catch (e) {
  console.warn(
    "Optional dependency 'express-rate-limit' not installed — skipping rate limiting.",
  );
  rateLimit = null;
}
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const doctorRoutes = require("./routes/doctors");
const messageRoutes = require("./routes/messages");
const chatbotRoutes = require("./routes/chatbot");
const siteContentRoutes = require("./routes/siteContent");
const paymentRoutes = require("./routes/payments");
const doctorPanelRoutes = require("./routes/doctorPanel");
const patientRecordRoutes = require("./routes/patientRecords");
const chatRoutes = require("./routes/chat");
const { initializeWebRTC } = require("./utils/webrtc");
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const User = require("./models/User");
const Doctor = require("./models/Doctor");

const app = express();

// =====================
// Middleware
// =====================
// Security headers (optional)
if (helmet) app.use(helmet());

// CORS - allow origins from environment variable or fallback to localhost/dev
const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:5173"
).split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    },
  }),
);

// Rate limiting basic protection (optional)
if (rateLimit) {
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 }); // 120 requests/min per IP
  app.use(limiter);
} else {
  console.warn(
    "Rate limiting disabled — install 'express-rate-limit' to enable it.",
  );
}

// Increase body size limits to allow base64 image uploads from frontend
app.use(express.json({ limit: process.env.EXPRESS_JSON_LIMIT || "8mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.EXPRESS_URLENCODED_LIMIT || "8mb",
  }),
);
app.use(cookieParser());
app.use(morgan("dev"));

// Serve uploaded files (avatars, etc.) from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================
// Connect to Database (async) and attach status
// =====================
connectDB()
  .then(() => {
    // no-op: connected successfully
  })
  .catch((err) => {
    // Log but do not force exit; this allows the server to start in a degraded mode
    console.error("Initial MongoDB connection failed:", err && err.message);
  });

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/doctor", doctorPanelRoutes);
app.use("/api/patient-records", patientRecordRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.json({ ok: true, dbConnected: state === 1, state });
});

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

// =====================
// Socket.io Setup
// =====================
try {
  const io = new Server(server, {
    cors: {
      origin: "*", // allow all origins for development
      methods: ["GET", "POST"],
    },
  });

  // middleware for token auth
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (token) {
        let t = token;
        if (typeof t === "string" && t.startsWith("Bearer ")) {
          t = t.split(" ")[1];
        }
        try {
          const decoded = jwt.verify(t, process.env.JWT_SECRET || "devsecret");
          socket.user = decoded;
        } catch {
          socket.user = null;
        }
      }
    } catch {
      socket.user = null;
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log(
      "🔌 Socket connected:",
      socket.id,
      socket.user?.role || "no-role",
    );

    if (socket.user?.role === "admin") {
      socket.join("admins");
      console.log("👨‍💼 Admin joined admins room:", socket.id);
    }

    socket.on("join_admins", () => socket.join("admins"));

    // =====================
    // Message Reply
    // =====================
    socket.on("reply_message", async (payload = {}) => {
      const { messageId, replyText } = payload;
      if (!messageId || !replyText) return;

      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        msg.reply = replyText;
        await msg.save();
        // emit once so clients receive a single update
        io.emit("message_replied", msg);
      } catch (err) {
        console.error("reply_message error:", err && err.message);
      }
    });

    // =====================
    // Message Delivered
    // =====================
    socket.on("message_delivered", async ({ messageId } = {}) => {
      if (!messageId) return;
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        msg.status = "delivered";
        await msg.save();
        io.to("admins").emit("message_status", msg);
        io.emit("message_status", msg);
      } catch (err) {
        console.error("message_delivered error:", err.message);
      }
    });

    // =====================
    // Message Read
    // =====================
    socket.on("message_read", async ({ messageId } = {}) => {
      if (!messageId) return;
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        msg.status = "read";
        await msg.save();
        io.to("admins").emit("message_status", msg);
        io.emit("message_status", msg);
      } catch (err) {
        console.error("message_read error:", err.message);
      }
    });

    // =====================
    // Typing Indicators
    // =====================
    socket.on("typing_start", ({ email } = {}) => {
      if (!email) return;
      io.to("admins").emit("typing", { email, typing: true });
    });

    socket.on("typing_stop", ({ email } = {}) => {
      if (!email) return;
      io.to("admins").emit("typing", { email, typing: false });
    });

    // =====================
    // Chat Messaging
    // =====================
    socket.on("join_chat", ({ chatId }) => {
      if (!chatId) return;
      socket.join(`chat_${chatId}`);
      console.log(`📨 User ${socket.id} joined chat room: chat_${chatId}`);
    });

    socket.on("leave_chat", ({ chatId }) => {
      if (!chatId) return;
      socket.leave(`chat_${chatId}`);
      console.log(`📤 User ${socket.id} left chat room: chat_${chatId}`);
    });

    socket.on("send_chat_message", async (payload) => {
      try {
        const { chatId, content, senderRole, attachment } = payload;

        if (!chatId || (!content && !attachment) || !socket.user?.id) {
          return socket.emit("chat_error", { message: "Invalid message data" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit("chat_error", { message: "Chat not found" });
        }

        // Verify sender has access
        if (senderRole === "doctor") {
          const user = await User.findById(socket.user.id);
          const doctor = await Doctor.findOne({ email: user.email });
          if (!doctor || chat.doctor.toString() !== doctor._id.toString()) {
            return socket.emit("chat_error", { message: "Access denied" });
          }
        } else {
          if (chat.patient.toString() !== socket.user.id) {
            return socket.emit("chat_error", { message: "Access denied" });
          }
        }

        // Add message to chat
        const newMessage = {
          sender: socket.user.id,
          senderRole: senderRole,
          content: content || undefined, // Content should be encrypted on client side
          attachment: attachment || undefined,
          timestamp: new Date(),
          read: false,
        };

        chat.messages.push(newMessage);
        if (content) {
          chat.lastMessage = content.substring(0, 100);
        } else if (attachment) {
          chat.lastMessage = attachment.kind === "image" ? "[Image]" : "[File]";
        }
        chat.lastMessageTime = new Date();

        // Update unread count
        if (senderRole === "doctor") {
          chat.unreadCount.patient += 1;
        } else {
          chat.unreadCount.doctor += 1;
        }

        await chat.save();

        const messageWithId = chat.messages[chat.messages.length - 1];

        // Emit to all users in this chat room
        io.to(`chat_${chatId}`).emit("new_chat_message", {
          chatId,
          message: messageWithId,
        });

        console.log(`💬 Message sent in chat ${chatId} by ${senderRole}`);
      } catch (error) {
        console.error("send_chat_message error:", error);
        socket.emit("chat_error", { message: "Failed to send message" });
      }
    });

    socket.on("chat_typing", ({ chatId, isTyping }) => {
      if (!chatId) return;
      socket.to(`chat_${chatId}`).emit("chat_typing_status", {
        chatId,
        userId: socket.user?.id,
        isTyping,
      });
    });

    socket.on("mark_chat_read", async ({ chatId }) => {
      try {
        if (!chatId || !socket.user?.id) return;

        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const isDoctor = socket.user.role === "doctor";

        if (isDoctor) {
          chat.unreadCount.doctor = 0;
          chat.messages.forEach((msg) => {
            if (msg.senderRole === "user") msg.read = true;
          });
        } else {
          chat.unreadCount.patient = 0;
          chat.messages.forEach((msg) => {
            if (msg.senderRole === "doctor") msg.read = true;
          });
        }

        await chat.save();

        io.to(`chat_${chatId}`).emit("chat_read_status", { chatId });
      } catch (error) {
        console.error("mark_chat_read error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  // =====================
  // Allow controllers to use io
  // =====================
  try {
    // controllers are CommonJS; require synchronously and pass io
    const messageController = require("./controllers/messageController");
    if (messageController && typeof messageController.setIo === "function") {
      messageController.setIo(io);
    }
  } catch (err) {
    console.warn("⚠️ Could not set io on controllers:", err && err.message);
  }

  // =====================
  // Initialize WebRTC Signaling Server
  // =====================
  initializeWebRTC(io);
} catch (err) {
  console.warn("⚠️ Socket.io not initialized:", err.message);
}
