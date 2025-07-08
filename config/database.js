require("dotenv").config;
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const fs = require("fs")

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
)

const db = {}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//load all models from model directory
fs.readdirSync(path.join(__dirname, "../models"))
    .filter(file => {
        return (
            file.indexOf(".") !== 0 && file !== "index.js" && file.slice(-3) === '.js' // Exclude index.js if you create one later for associations
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, '../models', file))(sequelize, DataTypes);
        db[model.name] = model
    });

// setup associations after all models are loaded
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

// Function to connect and sync (auto-migrate) database
db.connectAndMigrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        console.log("Running database migrations...");
        // `alter: true` attempts to change tables to match models, useful in development
        await sequelize.sync({ alter: true });
        console.log("Database migration completed!");
    } catch (error) {
        console.error('Unable to connect to the database or run migrations:', error);
        process.exit(1); // Exit process if database connection/migration fails
    }
}

// Function to clear database and re-migrate (for development/testing)
db.clearDBAndMigrate = async () => {
    try {
        console.log("Clearing database...");
        await sequelize.drop(); // Drops all tables
        console.log("Database cleared.");

        console.log("Running migrations again...");
        await sequelize.sync({ force: true }); // Forces table recreation
        console.log("Database re-migrated successfully!");
        return null;
    } catch (error) {
        console.error("Failed to clear and re-migrate database:", error);
        // Propagate error for handler to catch
        throw new Error(`Failed to clear and re-migrate database: ${error.message}`);
    }
};

module.exports = db;
