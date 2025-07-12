const db = require('../config/database');
const { Organization, User, SubscriptionPlan, Subscription, Invoice, Payment } = db;

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
            },
            {
                model: SubscriptionPlan,
                as: 'subscriptionPlans',
                required: false
            },
            {
                model: Subscription,
                as: 'subscriptions',
                required: false
            },
            {
                model: Invoice,
                as: 'invoices',
                required: false
            },
            {
                model: Payment,
                as: 'payments',
                required: false
            },],
        });

        return res.status(200).json(organizations);

    } catch (error) {
        console.error("Error fetching organizations:", error);
        return res.status(500).json({ error: "Failed to fetch organizations" });
    }
};


// Get organization summary by ID
const getOrgSummary = async (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    const callerOrgId = req.callerOrganizationID;

    if (isNaN(orgId)) {
        return res.status(400).json({ error: "Invalid organization ID" });
    }

    if (orgId !== callerOrgId) {
        return res.status(403).json({ error: "Unauthorized: Caller ID does not match target organization ID" });
    }

    try {
        // Fetch organization
        const organization = await Organization.findByPk(orgId);
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Total Users
        const totalUsers = await User.count({
            where: { organizationId: orgId }
        });

        // All invoices (to count & sum revenue)
        const invoices = await Invoice.findAll({
            where: { organizationId: orgId },
            attributes: ['amount']
        });

        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

        // Latest 5 invoices
        const latestInvoices = await Invoice.findAll({
            where: { organizationId: orgId },
            order: [['issueDate', 'DESC']],
            limit: 5
        });

        // Recent 5 payments with invoice join
        const recentPayments = await Payment.findAll({
            include: [
                {
                    model: Invoice,
                    as: 'invoice',
                    where: { organizationId: orgId },
                    attributes: [] // don’t need invoice fields here
                }
            ],
            order: [['paymentDate', 'DESC']],
            limit: 5
        });

        // Construct response
        const response = {
            organizationName: organization.name,
            billingEmail: organization.billingEmail,
            totalUsers: totalUsers,
            totalInvoices: invoices.length,
            totalRevenue: totalRevenue,
            latestInvoices: latestInvoices,
            recentPayments: recentPayments
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching organization summary:", error);
        return res.status(500).json({ error: "Failed to retrieve organization summary" });
    }
};

module.exports = {
    createOrganization,
    getAllOrganizations,
    getOrgSummary
};
