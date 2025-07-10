module.exports = (sequelize, DataTypes) => {
    // Organization model
    const Organization = sequelize.define("Organization", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        billingEmail: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
    });

    // User model
    const User = sequelize.define("User", {
        name: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: DataTypes.STRING,
        organizationId: DataTypes.INTEGER,
    });

    // Associations
    Organization.associate = (models) => {
        Organization.hasMany(models.User,
            {
                foreignKey: 'organizationId',
                as: 'users'
            });

        Organization.hasMany(models.SubscriptionPlan,
            {
                foreignKey: 'organizationId',
                as: 'subscriptionPlans'
            });
    };

    User.associate = (models) => {
        User.belongsTo(models.Organization,
            {
                foreignKey: 'organizationId',
                as: 'organization'
            });
    };

    // subscription plan model
    const SubscriptionPlan = sequelize.define("SubscriptionPlan", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        features: {
            type: DataTypes.JSON, // Store features as a JSON object
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'INR',
            validate: {
                isIn: [['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']], // Supported currencies
            }
        },
    });

    SubscriptionPlan.associate = (models) => {
        SubscriptionPlan.belongsTo(models.Organization,
            {
                foreignKey: 'organizationId',
                as: 'organizations'
            });
    };

    return { User, Organization, SubscriptionPlan };
};
