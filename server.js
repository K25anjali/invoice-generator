// app.js
require('dotenv').config();
const express = require('express');
const db = require('./config/database');
const organization = require('./routes/organizationRoutes');
const user = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/', async (req, res) => {
    try {
        await db.sequelize.authenticate(); // Ensure DB is reachable
        res.send("Welcome to invoice generator");
    } catch (error) {
        console.error("Ping failed:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// routes
app.use('/api/', organization);
app.use('/api/', user);

// Global error handling middleware (should be the last middleware)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Connect to the database and then start the server
db.connectAndMigrate()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server due to database connection error:", error);
        process.exit(1);
    });