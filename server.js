import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';               // ✅ required for socket.io
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

// ✅ CORS setup for both dev + deployed frontend
const allowedOrigins = [
  "http://localhost:5173",            // local dev
  "https://jobfreeportal.netlify.app" // deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Middlewares
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// -------------------- API Routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);                // Jobs + Reviews integrated here
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saveJobs', saveJobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/payments", paymentRoutes);

// -------------------- Chat Routes --------------------
app.use('/api/chat', chatRoutes);

// -------------------- Error handling --------------------
app.use(notFound);
app.use(errorHandler);

// -------------------- HTTP + Socket.IO --------------------
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);  
    socket.emit("connected");
  });

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

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

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
