// Store active rooms (appointmentId -> {doctor, patient})
const activeRooms = new Map();

const initializeWebRTC = (io) => {
  console.log("[WebRTC] Initializing WebRTC signaling handlers");

  io.on("connection", (socket) => {
    console.log(`[WebRTC] Client connected: ${socket.id}`);

    // Join appointment room
    socket.on("join-room", ({ appointmentId, userRole, userName }) => {
      console.log(
        `[WebRTC] ${userName} (${userRole}) joining room: ${appointmentId}`
      );

      // Get or create room
      if (!activeRooms.has(appointmentId)) {
        activeRooms.set(appointmentId, {});
      }

      const room = activeRooms.get(appointmentId);

      // Store user in room
      room[userRole] = { socketId: socket.id, userName };

      // Join Socket.IO room
      socket.join(appointmentId);

      // Store appointment ID in socket for cleanup
      socket.appointmentId = appointmentId;
      socket.userRole = userRole;
      socket.userName = userName;

      // Notify other participants
      socket.to(appointmentId).emit("user-joined", {
        userId: socket.id,
        userRole,
        userName,
      });

      console.log(`[WebRTC] Room ${appointmentId} now has:`, Object.keys(room));
    });

    // Initiate call (request to connect)
    socket.on("initiate-call", ({ appointmentId, callerRole, callerName }) => {
      console.log(
        `[WebRTC] ${callerName} initiating call in room: ${appointmentId}`
      );

      // Log who is in the room
      const socketsInRoom = io.sockets.adapter.rooms.get(appointmentId);
      console.log(
        `[WebRTC] Sockets in room ${appointmentId}:`,
        socketsInRoom ? Array.from(socketsInRoom) : "none"
      );

      // Notify the other participant about incoming call
      socket.to(appointmentId).emit("incoming-call", {
        appointmentId,
        callerRole,
        callerName,
        callerId: socket.id,
      });

      console.log(`[WebRTC] Emitted incoming-call to room ${appointmentId}`);
    });

    // Accept call
    socket.on("accept-call", ({ appointmentId, accepterRole }) => {
      console.log(`[WebRTC] Call accepted in room: ${appointmentId}`);

      // Notify caller that call was accepted
      socket.to(appointmentId).emit("call-accepted", {
        appointmentId,
        accepterRole,
      });
    });

    // Decline call
    socket.on("decline-call", ({ appointmentId, declinerRole }) => {
      console.log(`[WebRTC] Call declined in room: ${appointmentId}`);

      // Notify caller that call was declined
      socket.to(appointmentId).emit("call-declined", {
        appointmentId,
        declinerRole,
      });
    });

    // Forward WebRTC offer
    socket.on("offer", ({ appointmentId, offer }) => {
      console.log(`[WebRTC] Received offer for room: ${appointmentId}`);
      console.log(`[WebRTC] Forwarding offer to all in room ${appointmentId}`);
      socket.to(appointmentId).emit("offer", {
        offer,
        from: socket.id,
      });
      console.log(`[WebRTC] Offer forwarded`);
    });

    // Forward WebRTC answer
    socket.on("answer", ({ appointmentId, answer }) => {
      console.log(`[WebRTC] Forwarding answer for room: ${appointmentId}`);
      socket.to(appointmentId).emit("answer", {
        answer,
        from: socket.id,
      });
    });

    // Forward ICE candidates
    socket.on("ice-candidate", ({ appointmentId, candidate }) => {
      socket.to(appointmentId).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    });

    // Handle leaving room
    socket.on("leave-room", ({ appointmentId }) => {
      handleUserLeave(socket, appointmentId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`[WebRTC] Client disconnected: ${socket.id}`);
      if (socket.appointmentId) {
        handleUserLeave(socket, socket.appointmentId);
      }
    });
  });

  // Helper function to handle user leaving
  const handleUserLeave = (socket, appointmentId) => {
    const room = activeRooms.get(appointmentId);
    if (room && socket.userRole) {
      delete room[socket.userRole];
      console.log(`[WebRTC] ${socket.userRole} left room: ${appointmentId}`);

      // Notify others
      socket.to(appointmentId).emit("user-left", {
        userId: socket.id,
        userRole: socket.userRole,
      });

      // Clean up empty rooms
      if (Object.keys(room).length === 0) {
        activeRooms.delete(appointmentId);
        console.log(`[WebRTC] Room ${appointmentId} deleted (empty)`);
      }
    }

    socket.leave(appointmentId);
  };

  console.log("[WebRTC] Signaling server initialized");

  return io;
};

module.exports = { initializeWebRTC };
