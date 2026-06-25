import jwt from "jsonwebtoken";
import "dotenv/config";

export function auth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({error: "Invalid token"});
    }
}