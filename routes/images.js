import multer from "multer";
import cloudinary from "../connections/cloudinary.js";
import { auth } from "../middleware/authMiddleware.js";
import { pool } from "../connections/db.js";
import express from "express";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/upload", auth, upload.single("image"),
    async (req, res) => {
        //result code taken from lab 5 slides
        const result = await new Promise((ok, no) =>
            cloudinary.uploader.upload_stream(
                { folder: "tenanttrails" },
                (e, r) => e ? no(e) : ok(r)
            ).end(req.file.buffer));
        
        const url = result.secure_url;
        
        //stores the uploaded img url to the database in an 'images' table.
        await pool.query("INSERT INTO images (url, user_id) VALUES (?, ?)", [url, req.user.id]);
        
        res.json({ url });
});

export default router;