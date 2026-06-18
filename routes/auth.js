import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {pool} from '../connections/db.js';
import 'dotenv/config';

const router = express.Router();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

router.post("/signup", async (req, res) => {
    try {
        const {name, email, pw, initials} = req.body;
        const pwHash = await bcrypt.hash(pw, 10);
        const queryString = "INSERT INTO users (name, email, password, initials) VALUES (?, ?, ?, ?)";
        const [result] = await pool.query(queryString, [name, email, pwHash, initials]);
        res.status(201).json({ token: signToken(result.insertId)});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }

} );

router.post("/login", async (req, res) => {
    try {

        const {email, password} = req.body;
        const queryString = "SELECT * from USERS WHERE email = ?";

        const [[user]] = await pool.query(queryString, [email]);

        if (! (user && await bcrypt.compare(password, user.password))) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        res.json({token: signToken(user.id) });
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }
})



export default router; 