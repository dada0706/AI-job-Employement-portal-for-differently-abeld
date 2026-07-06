import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/db/connectDB.js";
import userRoutes from "./src/routes/userRoutes.js";
import companyRoutes from "./src/routes/companyRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import resumeRoutes from "./src/routes/resumeRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(bodyParser.json());
app.use(cors());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("api is working"));

app.use("/user", userRoutes);
app.use("/company", companyRoutes);
app.use("/job", jobRoutes);
app.use("/api/resume-gap-analyzer", resumeRoutes);
app.use("/api/ai-chat", chatRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🌐Server is running on port ${PORT}`));
