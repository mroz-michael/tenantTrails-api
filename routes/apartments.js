import { auth } from '../middleware/authMiddleware.js';
import {pool} from '../connections/db.js';
import express from 'express';

const router = express.Router();

//Dashboard endpoint, retrieves all apartments with rating and review count
router.get('/', async (req, res) => {
    try {

        const queryString = `
            SELECT a.*,
            ROUND(AVG(r.rating), 1) AS rating,
            COUNT(r.id) AS reviews
            FROM apartments a
            LEFT JOIN reviews r ON r.apt_id = a.id
            GROUP BY a.id
        `
        const [rows] = await(pool.query(queryString))
        res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }
})

//Apartment endpoint, retrieves an apartment and its reviews
router.get('/:id', async (req, res) => {
    try {
        const aId = req.params.id;
        const [[apartment]] = await pool.query(
            "SELECT * FROM apartments WHERE id = ?",
            [aId]
        );

        if (!apartment) {
            return res.status(404).json({error: "Apartment not found"});
        }

        const queryString = `
            SELECT r.*, u.name as author 
            FROM reviews r LEFT JOIN users u ON r.user_id = u.id
            WHERE r.apt_id = ?
        `
        const [reviews] = await pool.query(queryString, [aId]);

        res.json({
            ...apartment,
            reviews
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }
})

//Add a review to an Apartment
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const aptId = req.params.id;
    const userId = req.user.id;
    const { rating, body } = req.body;

    const [result] = await pool.query(
      `INSERT INTO reviews (apt_id, user_id, rating, body, created)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [aptId, userId, rating, body]
    );

    res.status(201).json({
      id: result.insertId,
      apt_id: aptId,
      user_id: userId,
      rating,
      body
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//Add a comment to a specific review on the Apartment page
router.post('/reviews/:rId/comments', auth, async (req, res) => {

    try {

        const rId = req.params.rId;
        const userId = req.user.id;

        const [[review]] = await pool.query( "SELECT * FROM reviews WHERE id = ?", [rId]);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const { content } = req.body;

        const [result] = await pool.query(
            `INSERT INTO comments (content, r_id, user_id, created)
            VALUES (?, ?, ?, CURDATE())`,
            [content, rId, userId]
        );

        res.status(201).json({
            id: result.insertId,
            review_id: rId,
            user_id: userId,
            content
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Server error"});
    }

})

export default router;