import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {pool} from '../connections/db.js';
import {auth} from '../middleware/authMiddleware.js';
import 'dotenv/config';

const router = express.Router();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

router.post("/signup", async (req, res) => {
    try {
        const {name, email, pw, initials} = req.body;
        const pwHash = await bcrypt.hash(pw, 10);
        const queryString = "INSERT INTO users (name, email, password, initials) VALUES (?, ?, ?, ?)";
        const [result] = await pool.query(queryString, [name, email, pwHash, initials]);
        
        const [[user]] = await pool.query(
            "SELECT id, name AS fullName, email, initials FROM users WHERE id = ?",
            [result.insertId]
        );

        res.cookie("token", signToken(user.id), {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({user});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }} );

router.post("/login", async (req, res) => {
    try {

        const {email, password} = req.body;
        const queryString = "SELECT * from USERS WHERE email = ?";
        const [[user]] = await pool.query(queryString, [email]);

        if (! (user && await bcrypt.compare(password, user.password))) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        res.cookie("token", signToken(user.id), {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

       
        res.json({
                user: { 
                    id: user.id, 
                    fullName: user.name, 
                    email: user.email, 
                    initials: user.initials 
                }
            });

    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ ok: true });
});

//for checking to see if user is logged in
router.get("/me", auth, async (req, res) => {
    const [[user]] = await pool.query(
        "SELECT id, name AS fullName, email, initials FROM users WHERE id = ?",
        [req.user.id]
    );
    res.json({ user });
});


export default router; 