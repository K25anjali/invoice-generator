module.exports = (sequelize, DataTypes) => {
    // Organization model
    const Organization = sequelize.define("Organization", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
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

    User.associate = (models) => {
        User.belongsTo(models.Organization,
            {
                foreignKey: 'organizationId',
                as: 'organization'
            });

        User.hasMany(models.Subscription,
            {
                foreignKey: 'userId',
                as: 'subscriptions'
            });
    };

    // subscription plan model
    const SubscriptionPlan = sequelize.define("SubscriptionPlan", {
        subscriptionPlanId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'INR',
            validate: {
                isIn: [['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']],
            },
        },
        interval: {
            type: DataTypes.ENUM('monthly', 'yearly'),
            allowNull: false,
            defaultValue: 'monthly',
        },
        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    SubscriptionPlan.associate = (models) => {
        SubscriptionPlan.belongsTo(models.Organization, {
            foreignKey: 'organizationId',
            as: 'organization',
        });

        SubscriptionPlan.hasMany(models.Subscription, {
            foreignKey: 'subscriptionPlanId',
            as: 'subscriptions',
        });
    };

    // subscription model
    const Subscription = sequelize.define("Subscription", {
        subscriptionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        subscriptionPlanId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    Subscription.associate = (models) => {
        Subscription.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        Subscription.belongsTo(models.SubscriptionPlan, {
            foreignKey: 'subscriptionPlanId',
            as: 'subscriptionPlan',
        });
    }

    const Invoice = sequelize.define("Invoice", {
        invoiceId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true // User who triggered the invoice
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USD',
            validate: {
                isIn: [['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']]
            }
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    Invoice.associate = (models) => {
        Invoice.belongsTo(models.Organization, {
            foreignKey: 'organizationId',
            as: 'organization'
        });
        Invoice.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Invoice.hasMany(models.Payment, {
            foreignKey: 'invoiceId',
            as: 'payments'
        });
        Invoice.hasMany(models.Refund, {
            foreignKey: 'invoiceId',
            as: 'refunds'
        });
    };

    // Payment Model
    const Payment = sequelize.define("Payment", {
        paymentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USD',
            validate: {
                isIn: [['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']]
            }
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        paymentMethod: {
            type: DataTypes.STRING
        }
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Invoice, {
            foreignKey: 'invoiceId',
            as: 'invoice'
        });
        Payment.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Payment.hasMany(models.Refund, {
            foreignKey: 'paymentId',
            as: 'refunds'
        });
    };

    // Refund Model
    const Refund = sequelize.define("Refund", {
        refundId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        paymentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USD',
            validate: {
                isIn: [['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']]
            }
        },
        refundDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        reason: {
            type: DataTypes.STRING
        }
    });

    Refund.associate = (models) => {
        Refund.belongsTo(models.Invoice, {
            foreignKey: 'invoiceId',
            as: 'invoice'
        });
        Refund.belongsTo(models.Payment, {
            foreignKey: 'paymentId',
            as: 'payment'
        });
        Refund.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return { User, Organization, SubscriptionPlan, Subscription, Invoice, Payment, Refund };
};
