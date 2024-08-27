const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token, 'secret_key0987');
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).send({ error: "Invalid token" });
    }
};
