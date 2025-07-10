require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId;
        const organizationId = decoded.organizationId;

        // Optionally validate from DB
        const user = await db.User.findOne({
            where: {
                id: userId,
                organizationId: organizationId,
            }
        });

        if (!user) {
            return res.status(403).json({ error: 'User not found or does not belong to organization' });
        }

        // Attach to request
        req.callerUserID = userId;
        req.callerOrganizationID = organizationId;
        req.callerUser = user;

        next();
    } catch (err) {
        console.error("JWT error:", err);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
