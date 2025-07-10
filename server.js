// app.js
require('dotenv').config();
const express = require('express');
const db = require('./config/database');
const router = require('./routes/routes');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.send("Welcome to invoice generator");
    } catch (error) {
        console.error("Ping failed:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// routes
app.use('/api/', router);

app.use((err, req, res, next) => {
    console.error(err.stack);
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