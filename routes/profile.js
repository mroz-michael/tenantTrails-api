import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { pool } from '../connections/db.js';

const router = express.Router();

//get user details and user's reviews
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      "SELECT id, name AS fullName, email, initials FROM users WHERE id = ?",
      [userId]
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const [reviews] = await pool.query(
      `SELECT 
            r.id,
            r.rating,
            r.body,
            r.created   AS date,
            r.apt_id    AS apartmentId,
            r.user_id   AS userId,
            a.name      AS aptName
       FROM reviews r
       JOIN apartments a ON r.apt_id = a.id
       WHERE r.user_id = ?
       ORDER BY r.created DESC`,
      [userId]
    );

    res.json({ ...user, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;