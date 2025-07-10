const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const { registerUser, loginUser } = require('../controllers/authController');
const { createOrganization, getAllOrganizations } = require('../controllers/organizationController');
const { createUser, getAllUser } = require('../controllers/userController');

//auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

//organization routes
router.post('/createOrganization', authMiddleware, createOrganization);
router.get('/getAllOrganizations', authMiddleware, getAllOrganizations);

//user routes
router.post('/createUser', authMiddleware, createUser);
router.get('/getAllUsers', authMiddleware, getAllUser);

module.exports = router;

