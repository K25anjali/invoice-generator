require("dotenv").config(); // ✅ FIXED: You forgot to call it (added `()`)

const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const fs = require("fs");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: console.log,
        timezone: '+05:30',
    }
);

const db = {};

// Base Sequelize references
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load all models
fs.readdirSync(path.join(__dirname, "../models"))
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
        const modelDef = require(path.join(__dirname, "../models", file));
        const models = modelDef(sequelize, DataTypes);

        // ✅ If multiple models are returned (combined file), spread them into db
        if (typeof models === "object" && !models.name) {
            Object.entries(models).forEach(([modelName, model]) => {
                db[modelName] = model;
            });
        } else {
            db[models.name] = models;
        }
    });

// Setup associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Connect and migrate
db.connectAndMigrate = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Connected to database");

        await sequelize.sync({ alter: true }); // Alter for dev mode
        console.log("✅ Database synced");
    } catch (err) {
        console.error("❌ Database connection/migration error:", err);
        process.exit(1);
    }
};

// Drop and re-migrate (for testing/dev)
db.clearDBAndMigrate = async () => {
    try {
        console.log("⚠️ Dropping all tables...");
        await sequelize.drop();

        await sequelize.sync({ force: true });
        console.log("✅ Re-migrated database.");
    } catch (error) {
        console.error("❌ Failed to clear and re-migrate:", error);
        throw new Error(`Failed to re-migrate: ${error.message}`);
    }
};

module.exports = db;
