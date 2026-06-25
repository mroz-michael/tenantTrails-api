import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

import authRouter from "./routes/auth.js";
import apartmentRouter from './routes/apartments.js'
import imageRouter from './routes/images.js';
import reviewRouter from './routes/reviews.js';
import profileRouter from './routes/profile.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/apartments", apartmentRouter);
app.use("/api/images", imageRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/profile", profileRouter);

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;