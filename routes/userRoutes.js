const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { User } = db; // Make sure model name is capitalized if defined that way

// GET all users
router.get('/getUsers', async (req, res) => {
    try {
        const users = await User.findAll({
            include: db.Organization, // include associated organization
        });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

module.exports = router;
