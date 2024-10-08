import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect_DB from "./config/connectDB.js";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/AuthRoutes.js";
import path from "path";
import contactRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import chatRoutes from "./routes/ChatRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/message", chatRoutes);
app.use("/api/channel", channelRoutes);

const dirPath =
  process.env.NODE_ENV === "production"
    ? path.resolve()
    : path.join(__dirname, "client", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(dirPath, "client", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(dirPath, "client", "dist", "index.html"));
  });
}

const port = process.env.PORT;

const server = app.listen(port, async () => {
  try {
    await connect_DB();
    console.log(`Server is running on port ${port}`);
  } catch (error) {}
});

setupSocket(server);
