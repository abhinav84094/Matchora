import express from "express"
import dotenv from "dotenv"
import DBconnection from "./db/mongodb.js";
import userRoutes from "./routes/userRoutes.js"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import feedbackRoutes from "./routes/feedbackRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import cors from "cors"
import { startJobScraper } from "./cron/scrapeJobsCron.js";
import { startCleanupCron } from "./cron/cleanupJobsCron.js";
import fs from "fs";
import {apiLimiter, authLimiter} from "./middleware/Ratelimiters.js"
import helmet from "helmet";
import paymentRouter from "./routes/payment.js";



dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);




if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
    console.log("Uploads folder created");
}

app.use("/api", apiLimiter);

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/payment", paymentRouter);

app.get("/", (req, res)=>{
    res.send("this is home page")
})









app.listen(process.env.PORT, async ()=>{
    await DBconnection();
    // startJobScraper();
    // startCleanupCron();
    console.log(`Server is started on PORT ${process.env.PORT}`)
})