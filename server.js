import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';                // ✅ required for socket.io
import { Server } from 'socket.io';     // ✅ socket.io server
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import paymentRoutes from "./routes/paymentRoutes.js";

// Import routes
import saveJobRoutes from './routes/saveJobRoutes.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // ✅ chat route

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ✅ CORS setup
const corsOptions = {
  origin: "http://localhost:5173",  // frontend URL
  credentials: true,               // allow cookies & auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saveJobs', saveJobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Chat routes
app.use('/api/chat', chatRoutes);

// ✅ Error handling
app.use(notFound);
app.use(errorHandler);

// ✅ Wrap app with HTTP server
const server = http.createServer(app);

// ✅ Initialize socket.io with proper CORS
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Setup user
  socket.on("setup", (userData) => {
    socket.join(userData._id);  
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Send message
  socket.on("new-message", (msg) => {
    const chat = msg.chat;
    if (!chat?.participants) return;

    chat.participants.forEach((user) => {
      if (user._id !== msg.sender._id) {
        socket.in(user._id).emit("message-received", msg);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Run server with HTTP + Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
