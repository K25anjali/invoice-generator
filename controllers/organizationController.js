const db = require('../config/database');
const { Organization, User } = db;

// Create an organization
const createOrganization = async (req, res) => {
    const { name, billingEmail } = req.body;

    // Validate input
    if (!name || !billingEmail) {
        return res.status(400).json({ error: "Name and billingEmail are required" });
    }

    if (!/\S+@\S+\.\S+/.test(billingEmail)) {
        return res.status(400).json({ error: "Invalid billing email format" });
    }

    try {
        const existingOrg = await Organization.findOne({ where: { name } });

        if (existingOrg) {
            return res.status(409).json({ error: "Organization with this name already exists" });
        }

        const newOrg = await Organization.create({ name, billingEmail });
        return res.status(201).json(newOrg);

    } catch (error) {
        console.error("Error creating organization:", error);
        return res.status(500).json({ error: "Failed to create organization" });
    }
};

// Get all organizations with users
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.findAll({
            include: [{
                model: User,
                as: 'users',
                required: false
            }]
        });

        return res.status(200).json(organizations);

    } catch (error) {
        console.error("Error fetching organizations:", error);
        return res.status(500).json({ error: "Failed to fetch organizations" });
    }
};

module.exports = {
    createOrganization,
    getAllOrganizations
};
