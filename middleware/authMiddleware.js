import jwt from "jsonwebtoken";

export function auth(req, res, next) {
    const header = req.headers.authorization;
    const token = header ? header.split(" ")[1] : false;


    if (!token) {
        return res.status(401).json({error: "No token"});
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({error: "Invalid token"});
    }
}