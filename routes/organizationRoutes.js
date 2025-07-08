const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { Organization } = db;

// Create organization
router.post('/organizations', async (req, res) => {
    const { name, billingEmail } = req.body;

    if (!name && !billingEmail) {
        return res.status(400).json({ error: "Name and billingEmail are required" });
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
});

module.exports = router;
