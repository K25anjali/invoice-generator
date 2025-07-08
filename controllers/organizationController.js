const { where } = require('sequelize');
const db = require('../config/database');

// Handler for creating a new organization
const createOrg = async (req, res) => {
    const { name, billingEmail } = req.body;

    if (!name, !billingEmail) {
        return res.status(400).json({ error: "Name and Billing email are required" })
    }

    if (!/\S+@\S+\.\S+/.test(billingEmail)) {
        return res.status(400).json({ error: "Invalid billing email format" });
    }

    try {
        // Check if an organization with this name already exists
        const existingOrg = await db.Organization.findOne({
            where: { name: name }
        })

        if (existingOrg) {
            return res.status(409).json({ error: "Organization with this name already exists" });
        } else {
            const organization = await db.Organization.create({ name, billingEmail })
            res.status(201).json({ message: "Organization created successfully", organization });
        }
    } catch (error) {
        console.error("Error creating organization:", error);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ error: errors });
        }
        res.status(500).json({ error: "Failed to create organization" });

    }
}
