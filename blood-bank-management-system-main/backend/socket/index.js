// socket/index.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {Socket.io.Server} Socket.io server instance
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25001,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(
      `✅ New socket connection: ${socket.id} (User: ${socket.userId})`,
    );

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join role-based room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Join facility room if applicable
    if (socket.userRole === "hospital" || socket.userRole === "blood-lab") {
      socket.join(`facility:${socket.userId}`);
    }

    // Handle joining specific rooms
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`User ${socket.userId} joined room: ${room}`);
    });

    socket.on("leave-room", (room) => {
      socket.leave(room);
      console.log(`User ${socket.userId} left room: ${room}`);
    });

    // Handle blood camp registration
    socket.on("register-camp", (data) => {
      const { campId } = data;
      socket.join(`camp:${campId}`);
      console.log(`User ${socket.userId} joined camp room: camp:${campId}`);
    });

    // Handle blood request tracking
    socket.on("track-request", (requestId) => {
      socket.join(`request:${requestId}`);
      console.log(`User ${socket.userId} tracking request: ${requestId}`);
    });

    // Handle typing indicators (for chat if implemented)
    socket.on("typing", (data) => {
      socket.to(data.room).emit("user-typing", {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle read receipts
    socket.on("mark-read", (data) => {
      socket.to(data.room).emit("messages-read", {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (Reason: ${reason})`);

      // Leave all rooms (automatic, but we can log it)
      console.log(`User ${socket.userId} left all rooms`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Admin namespace for administrative real-time updates
  const adminNamespace = io.of("/admin");

  adminNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "admin") {
        return next(new Error("Admin access required"));
      }

      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  adminNamespace.on("connection", (socket) => {
    console.log(`✅ Admin connected: ${socket.id}`);

    // Join admin to all admin rooms
    socket.join("admin:overview");
    socket.join(`admin:${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`❌ Admin disconnected: ${socket.id}`);
    });
  });

  // Public namespace for unauthenticated updates
  const publicNamespace = io.of("/public");

  publicNamespace.on("connection", (socket) => {
    console.log(`✅ Public connection: ${socket.id}`);

    // Allow joining public rooms like camp updates
    socket.on("join-camp-updates", (campId) => {
      socket.join(`camp-public:${campId}`);
    });

    socket.on("leave-camp-updates", (campId) => {
      socket.leave(`camp-public:${campId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Public connection disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 * @returns {Socket.io.Server} Socket.io server instance
 * @throws {Error} If socket not initialized
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to all users with specific role
 * @param {string} role - User role
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToRole = (role, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(`role:${role}`).emit(event, data);
};

/**
 * Emit event to specific facility
 * @param {string} facilityId - Facility ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToFacility = (facilityId, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.to(`facility:${facilityId}`).emit(event, data);
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToAll = (event, data) => {
  if (!io) {
    console.error("Socket.io not initialized");
    return;
  }
  io.emit(event, data);
};

/**
 * Get online users count
 * @returns {Object} Online users statistics
 */
export const getOnlineStats = () => {
  if (!io) {
    return { total: 0, byRole: {} };
  }

  const rooms = io.sockets.adapter.rooms;
  const userRooms = Array.from(rooms.keys()).filter((room) =>
    room.startsWith("user:"),
  );
  const roleRooms = Array.from(rooms.keys()).filter((room) =>
    room.startsWith("role:"),
  );

  const byRole = {};
  roleRooms.forEach((room) => {
    const role = room.replace("role:", "");
    const count = rooms.get(room)?.size || 0;
    byRole[role] = count;
  });

  return {
    total: userRooms.length,
    byRole,
  };
};

/**
 * Socket event types (for reference)
 */
export const SocketEvents = {
  // Blood request events
  NEW_REQUEST: "new-request",
  REQUEST_PROCESSED: "request-processed",
  REQUEST_UPDATED: "request-updated",

  // Blood stock events
  STOCK_UPDATED: "stock-updated",
  STOCK_WARNING: "stock-warning",
  STOCK_EXPIRING: "stock-expiring",

  // Camp events
  NEW_CAMP: "new-camp",
  CAMP_UPDATED: "camp-updated",
  CAMP_REGISTRATION: "camp-registration",
  CAMP_COMPLETED: "camp-completed",

  // Donation events
  DONATION_MADE: "donation-made",
  DONATION_VERIFIED: "donation-verified",

  // User events
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  ACCOUNT_APPROVED: "account-approved",
  ACCOUNT_REJECTED: "account-rejected",

  // Notification events
  NOTIFICATION: "notification",
  ALERT: "alert",

  // Admin events
  ADMIN_STATS_UPDATE: "admin-stats-update",
  ADMIN_ALERT: "admin-alert",
};

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToFacility,
  emitToAll,
  getOnlineStats,
  SocketEvents,
};
