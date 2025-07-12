const db = require('../config/database');
const { User, Subscription, Organization, SubscriptionPlan } = db;

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
            },
            {
                model: db.Subscription,
                as: 'subscriptions',
            },
            {
                model: db.Invoice,
                as: 'invoices',
            },
            {
                model: db.Payment,
                as: 'payments',
            }],
        });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const callerOrganizationID = req.callerOrganizationID;
    const callerUserID = req.callerUserID;

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (parseInt(callerUserID) !== userId) {
        return res.status(403).json({ error: 'Unauthorized: Caller user ID does not match target user ID' });
    }

    try {
        // Fetch user with organization info
        const user = await User.findByPk(userId, {
            include: {
                model: Organization,
                as: 'organization'
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.organizationId !== callerOrganizationID) {
            return res.status(403).json({ error: 'Unauthorized: Caller organization ID does not match user organization ID' });
        }

        // Fetch all subscriptions of this user with related subscription plan
        const subscriptions = await Subscription.findAll({
            where: { userId: userId },
            include: {
                model: SubscriptionPlan,
                as: 'subscriptionPlan'
            }
        });
        return res.status(200).json({ success: true, data: subscriptions });

    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user subscriptions' });
    }
}

module.exports = {
    createUser,
    getAllUser,
    getUserSubscriptions
};
