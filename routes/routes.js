const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { registerUser, loginUser } = require('../controllers/authController');
const { createOrganization, getAllOrganizations, getOrgSummary } = require('../controllers/organizationController');
const { createUser, getAllUser, getUserSubscriptions } = require('../controllers/userController');
const { createSubscriptionPlan, subscribe, payInvoice, upgradePlan, getUserInvoice, refund } = require('../controllers/subscriptionController');

//auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

//organization routes
router.post('/createOrganization', authMiddleware, createOrganization);
router.get('/getAllOrganizations', authMiddleware, getAllOrganizations);
router.get('/organization/:id/summary', authMiddleware, getOrgSummary);

//user routes
router.post('/createUser', authMiddleware, createUser);
router.get('/getAllUsers', authMiddleware, getAllUser);
router.get('/user/:id/subscriptions', authMiddleware, getUserSubscriptions);

//subscription plan routes
router.post('/createSubscriptionPlan', authMiddleware, createSubscriptionPlan);

//subscription routes
router.post("/subscribe", authMiddleware, subscribe)

// invoice routes
router.post("/pay_invoice", authMiddleware, payInvoice)
router.get("/invoice/:id", authMiddleware, getUserInvoice)

// upgrage and refud routes
router.post("/upgrade_plan", authMiddleware, upgradePlan)
router.post("/refund", authMiddleware, refund)


module.exports = router;

