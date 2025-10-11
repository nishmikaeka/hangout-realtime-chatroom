import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
const port = process.env.port || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"]; //whitelisted domains to communicate with backend

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

//api endpoints
app.get("/", (req, res) => res.send("Api working"));

app.listen(port, () => console.log(`Server started on port ${port}`));
