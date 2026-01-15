/* eslint-env node, commonjs */
/* CommonJS conversion: use require() because backend/package.json uses "type": "commonjs" */
// Ensure this file is run with Node.js in CommonJS mode (default for .js files)
// If you see "'require' is not defined", make sure you are not running with "type": "module" in package.json or rename this file to .cjs

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
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
const Message = require("./models/Message");

const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// =====================
// Connect to Database
// =====================
connectDB();

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

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
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
      socket.user?.role || "no-role"
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
} catch (err) {
  console.warn("⚠️ Socket.io not initialized:", err.message);
}
