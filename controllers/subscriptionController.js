const db = require('../config/database');
const { subscribe } = require('../routes/routes');
const { SubscriptionPlan, Organization, Subscription, Invoice, User, Payment } = db;

// Create subscription plan
const createSubscriptionPlan = async (req, res) => {
    const { name, description, price, currency, interval, organizationId } = req.body;

    const callerOrganizationID = req.callerOrganizationID;

    if (parseInt(callerOrganizationID) !== parseInt(organizationId)) {
        return res.status(403).json({ error: "Unauthorized: Caller organization ID does not match target organization ID" });
    }

    if (!name || !price || !description || !currency || !interval || !organizationId) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
        const organization = await Organization.findByPk(organizationId);

        if (!organization) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }

        const existingPlan = await SubscriptionPlan.findOne({
            where: {
                name,
                organizationId,
            },
        });

        if (existingPlan) {
            return res.status(400).json({ success: false, error: 'Subscription plan with this name already exists for this organization' });
        }

        const newPlan = await SubscriptionPlan.create({
            name,
            price,
            description,
            currency,
            interval,
            organizationId
        });

        res.status(201).json({ success: true, data: newPlan });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        res.status(500).json({ success: false, error: 'Failed to create subscription plan' });
    }
}

// user subscription and incoice creation
const subscribe = async (req, res) => {
    const { organizationId, userId, subscriptionPlanId } = req.body;
    const callerOrganizationID = req.callerOrganizationID;
    const callerUserID = req.callerUserID;

    if (parseInt(callerUserID) !== parseInt(userId)) {
        return res.status(403).json({ error: "Unauthorized: Caller user ID does not match target user ID" });
    }

    if (parseInt(callerOrganizationID) !== parseInt(organizationId)) {
        return res.status(403).json({ error: "Unauthorized: Caller organization ID does not match target organization ID" });
    }

    if (!organizationId || !userId || !subscriptionPlanId) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const org = await Organization.findByPk(organizationId);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found or doesn't belong to org" });

    const subscriptionPlan = await db.SubscriptionPlan.findByPk(subscriptionPlanId);
    if (!subscriptionPlan) return res.status(404).json({ error: "Subscription plan not found for this organization" });

    try {
        const subscription = await Subscription.create({
            organizationId,
            subscriptionPlanId,
            userId,
            startDate: new Date(),
            isActive: true,
        });

        const invoice = await Invoice.create({
            organizationId,
            userId,
            amount: subscriptionPlan.price,
            currency: subscriptionPlan.currency,
            issueDate: new Date(),
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            paid: false,
        });

        res.status(201).json({
            message: "Subscription and invoice created",
            subscriptionId: subscription.id,
            invoiceId: invoice.id,
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ success: false, error: 'Failed to create subscription' });
    }
    return res.status(200).json({ success: true, data: 'Subscription created successfully' });
}

// payment and invoice creation
const payInvoice = async (req, res) => {
    const {
        invoiceId,
        userId,
        amount,
        currency,
        transactionId,
        paymentMethod
    } = req.body;

    const callerOrganizationID = req.callerOrganizationID;

    try {
        const invoice = await Invoice.findByPk(invoiceId);

        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        if (invoice.organizationId !== callerOrganizationID) {
            return res.status(403).json({ error: "Unauthorized: Invoice does not belongs to this organization'" });
        }

        if (invoice.paid) {
            return res.status(400).json({ error: "Invoice already paid" });
        }

        if (invoice.amount < amount) {
            return res.status(400).json({ error: "Payment amount is less than invoice amount. Partial payments not allowed" });
        }

        if (invoice.amount !== amount || invoice.currency !== currency) {
            return res.status(400).json({ error: "Payment amount or currency does not match invoice" });
        }

        const user = await User.findOne({ where: { id: userId, organizationId: callerOrganizationID } });

        if (!user) {
            return res.status(404).json({ error: "User not found or does not belong to this organization" });
        }

        const payment = await Payment.create({
            invoiceId,
            userId,
            amount,
            currency,
            paymentDate: new Date(),
            transactionId,
            paymentMethod
        });

        // Update invoice status to paid
        invoice.paid = true;
        await invoice.save();

        return res.status(200).json({ message: 'Invoice paid successfully', paymentId: payment.id });

    } catch (error) {
        console.error('Error paying invoice:', error);
        return res.status(500).json({ error: 'Failed to process payment' });
    }
}

// Upgrade subscription plan
const upgradePlan = async (req, res) => {
    const { organizationId, newSubscriptionPlanId, userId } = req.body;
    const callerOrganizationID = req.callerOrganizationID;

    if (organizationId !== callerOrganizationID) {
        return res.status(403).json({ error: 'Unauthorized organization access' });
    }

    try {
        const user = await User.findOne({ where: { id: userId, organizationId } });
        if (!user) return res.status(404).json({ error: 'User not found in organization' });

        const newPlan = await SubscriptionPlan.findOne({ where: { subscriptionPlanId: newSubscriptionPlanId, organizationId } });
        if (!newPlan) return res.status(404).json({ error: 'New plan not found' });

        const currentSubscription = await Subscription.findOne({
            where: { organizationId, isActive: true }
        });

        if (!currentSubscription) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        if (currentSubscription.subscriptionPlanId === newSubscriptionPlanId) {
            return res.status(400).json({ error: 'Already on this plan' });
        }

        const currentPlan = await SubscriptionPlan.findByPk(currentSubscription.subscriptionPlanId);

        // Calculate prorated amount
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysInMonth = endOfMonth.getDate();
        const daysRemaining = endOfMonth.getDate() - today.getDate() + 1;

        const proratedCredit = (currentPlan.price / daysInMonth) * daysRemaining;

        // Deactivate current
        currentSubscription.isActive = false;
        currentSubscription.endDate = today;
        await currentSubscription.save();

        // Create new
        const newSubscription = await Subscription.create({
            organizationId,
            subscriptionPlanId: newSubscriptionPlanId,
            startDate: today,
            isActive: true
        });

        // Create invoice
        let dueDate = new Date();
        if (newPlan.interval === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + 1);
        } else {
            dueDate.setFullYear(dueDate.getFullYear() + 1);
        }

        const invoice = await Invoice.create({
            organizationId,
            userId,
            amount: Math.max(0, newPlan.price - proratedCredit),
            currency: newPlan.currency,
            issueDate: today,
            dueDate,
            paid: false
        });

        return res.status(200).json({
            message: 'Plan upgraded successfully',
            oldSubscriptionId: currentSubscription.id,
            newSubscriptionId: newSubscription.id,
            proratedInvoiceId: invoice.id,
            proratedCredit: proratedCredit.toFixed(2)
        });
    } catch (error) {
        console.error('Upgrade error:', error);
        return res.status(500).json({ error: 'Failed to upgrade plan' });
    }
}


// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const { Invoice, User, Organization } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Get user invoice by ID
const getUserInvoice = async (req, res) => {
    const invoiceId = parseInt(req.params.id);
    const callerOrgId = req.callerOrganizationID;

    try {
        const invoice = await Invoice.findOne({
            where: { id: invoiceId },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Organization, as: 'organization', attributes: ['id', 'name'] }
            ]
        });

        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        if (invoice.organizationId !== callerOrgId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        return res.status(200).json(invoice);
    } catch (err) {
        console.error('Get invoice error:', err);
        return res.status(500).json({ error: 'Failed to fetch invoice' });
    }
}

// refund 
const refund = async (req, res) => {
    const {
        invoiceId, paymentId, userId,
        amount, currency, transactionId, reason
    } = req.body;

    const callerOrgId = req.callerOrganizationID;

    try {
        const invoice = await Invoice.findByPk(invoiceId);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        if (invoice.organizationId !== callerOrgId)
            return res.status(403).json({ error: 'Unauthorized' });

        const payment = await Payment.findOne({ where: { id: paymentId, invoiceId } });
        if (!payment) return res.status(404).json({ error: 'Payment not found for invoice' });

        const user = await User.findOne({ where: { id: userId, organizationId: callerOrgId } });
        if (!user) return res.status(404).json({ error: 'User not in organization' });

        const existingRefund = await Refund.findOne({
            where: { paymentId, transactionId }
        });
        if (existingRefund)
            return res.status(409).json({ error: 'Refund with this transaction ID already exists' });

        if (amount > payment.amount)
            return res.status(400).json({ error: 'Refund cannot exceed payment' });

        const refund = await Refund.create({
            invoiceId,
            paymentId,
            userId,
            amount,
            currency,
            transactionId,
            reason,
            refundDate: new Date()
        });

        return res.status(201).json({
            message: 'Refund created successfully',
            refundId: refund.id
        });
    } catch (err) {
        console.error('Refund error:', err);
        return res.status(500).json({ error: 'Failed to process refund' });
    }
};

module.exports = {
    createSubscriptionPlan,
    subscribe,
    payInvoice,
    upgradePlan,
    getUserInvoice,
    refund
};