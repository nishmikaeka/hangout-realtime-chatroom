import express from "express";
import connectDB from "./config/mongodb.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRouter from "../server/routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = process.env.port || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"]; //whitelisted domains to communicate with backend

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  //join room
  socket.on("join_room", (roomId, userName) => {
    socket.join(roomId);
    console.log(`${userName} joined ${roomId}`);
    socket.to(roomId).emit("user joined", `${userName} joined the chat`);
  });

  //send message
  socket.on("send_message", (data) => {
    io.to(data.roomId).emit("receive_message", data);
  });

  //handle leave
  socket.on("leave_room", (roomId, userName) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user_left", `${userName} left the chat`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

//api endpoints
app.get("/", (req, res) => res.send("Api working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);

app.listen(port, () => console.log(`Server started on port ${port}`));
