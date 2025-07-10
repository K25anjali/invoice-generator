const db = require('../config/database');

const userExists = async (email) => {
    if (!email) {
        throw new Error("Email is required to check for existing user");
    }

    const user = await db.User.findOne({ where: { email } }); // ✅ Capital "User"
    return user; // returns the user or null
};

module.exports = { userExists };
