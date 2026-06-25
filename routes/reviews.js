import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { pool } from '../connections/db.js';

const router = express.Router();


//update a user's review
router.put("/:id", auth, async (req, res) => {

    const [[review]] = await pool.query("SELECT user_id FROM reviews WHERE id = ?", [req.params.id]);
    if (!review) return res.status(404).json({ error: "Not found" });

    if (review.user_id !== req.user.id)  {// your review?
        return res.status(403).json({ error: "Not your review" });
    }


    const { rating, body } = req.body;
    await pool.query("UPDATE reviews SET rating = ?, body = ? WHERE id = ?", 
        [rating, body, req.params.id]);
    res.json({ ok: true });
});

//delete a user's review
router.delete("/:id", auth, async (req, res) => {
    const [[review]] = await pool.query("SELECT user_id FROM reviews WHERE id = ?", [req.params.id]);
    
    if (!review) return res.status(404).json({ error: "Not found" });

    if (review.user_id !== req.user.id)  {// your review?
        return res.status(403).json({ error: "Not your review" });
    }

    await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);
    res.json({ok: true})

})

export default router;