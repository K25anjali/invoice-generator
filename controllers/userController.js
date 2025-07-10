const db = require('../config/database');
const User = db.User; // ✅ Capitalized model name
const Organization = db.Organization;

// Create user
const createUser = async (req, res) => {
    const { name, email, password, organizationId } = req.body;

    if (!name || !email || !password || !organizationId) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            organizationId,
        });

        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Failed to create user' });
    }
};

// Get all users
const getAllUser = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Organization,
                as: 'organization',
                required: false
            }]
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

module.exports = {
    createUser,
    getAllUser
};
