import { auth } from '../middleware/authMiddleware.js';
import {pool} from '../connections/db.js';
import express from 'express';

const router = express.Router();

//Dashboard endpoint, retrieves all apartments with rating and review count
router.get('/', async (req, res) => {
    try {

        const queryString = `
            SELECT a.id,
                   a.name,
                   a.address,
                   a.neighbourhood,
                   a.description,
                   a.image,
                   ROUND(AVG(r.rating), 1) AS averageRating,
                   COUNT(r.id)             AS numReviews
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
        
        const [[apartment]] = await pool.query(`
            SELECT a.id,
                   a.name,
                   a.address,
                   a.neighbourhood,
                   a.description,
                   a.image,
                   ROUND(AVG(r.rating), 1) AS averageRating,
                   COUNT(r.id)             AS numReviews
            FROM apartments a
            LEFT JOIN reviews r ON r.apt_id = a.id
            WHERE a.id = ?
            GROUP BY a.id
        `, [aId]);

        if (!apartment) {
            return res.status(404).json({error: "Apartment not found"});
        }

        const queryString = `
            SELECT 
                r.id,
                r.rating,
                r.body,
                r.created  AS date,
                r.apt_id   AS apartmentId,
                r.user_id  AS userId,
                u.name     AS author
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.apt_id = ?
        `;

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

    const [[newReview]] = await pool.query(
        `SELECT r.id,
                r.rating,
                r.body,
                r.created  AS date,
                r.apt_id   AS apartmentId,
                r.user_id  AS userId,
                u.name     AS author
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?`,
        [result.insertId]
    );

    res.status(201).json(newReview);

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
            reviewId: rId,
            userId: userId,
            content
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Server error"});
    }

})

export default router;