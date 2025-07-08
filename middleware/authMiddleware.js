// middleware/authMiddleware.js
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
    // In a real application, this would come from headers (e.g., Authorization: Bearer Token)
    const callerUserIDStr = req.query.caller_user_id;
    const callerOrganizationIDStr = req.query.caller_organization_id;

    if (!callerUserIDStr || !callerOrganizationIDStr) {
        return res.status(401).json({ error: "Authentication required: Missing caller_user_id or caller_organization_id in query" });
    }

    const callerUserID = parseInt(callerUserIDStr, 10);
    const callerOrganizationID = parseInt(callerOrganizationIDStr, 10);

    if (isNaN(callerUserID) || isNaN(callerOrganizationID)) {
        return res.status(400).json({ error: "Invalid caller user ID or organization ID format" });
    }

    try {
        // Verify the user and organization exist and are linked
        const callerUser = await db.User.findOne({
            where: {
                id: callerUserID,
                organizationId: callerOrganizationID,
            },
        });

        if (!callerUser) {
            return res.status(403).json({ error: "Unauthorized: Caller user not found or does not belong to the calling organization" });
        }

        // Attach validated info to the request object for downstream handlers
        req.callerUserID = callerUserID;
        req.callerOrganizationID = callerOrganizationID;
        req.callerUser = callerUser; // Optionally attach the full user object

        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({ error: "Internal server error during authentication process" });
    }
};

module.exports = authMiddleware;