const jwt = require('jsonwebtoken');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { userExists } = require('../utils/utils'); // Destructure for clarity
const User = db.User; // ✅ Use correct model reference

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        const existingUser = await userExists(email);

        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ success: true, data: newUser });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Failed to create user' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    try {
        const user = await userExists(email); // ✅ Use correct reference

        if (!user) {
            return res.status(400).json({ success: false, error: 'User does not exist' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                organizationId: user.organizationId
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: 'Failed to log in' });
    }
};

module.exports = { registerUser, loginUser };
