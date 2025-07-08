
module.exports = (sequelize, DataTypes) => {
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
            unique: true,
        },
        billingEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    })

    Organization.associate = (models) => {
        console.log("modelss", models.User)
        Organization.hasMany(models.User, { foreignKey: 'organizationId' })
    }

    return Organization;
}