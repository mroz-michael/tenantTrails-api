import express from 'express';
import cors from "cors";
import authRouter from "./routes/auth.js";
import apartmentRouter from './routes/apartments.js'
import imageRouter from './routes/images.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/apartments", apartmentRouter);
app.use("/api/images", imageRouter)

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;