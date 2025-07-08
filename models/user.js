
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
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
        orgId: DataTypes.INTEGER
    });

    User.associate = function (models) {
        User.belongsTo(models.Organization, { foreignKey: 'organizationId' });
    };

    return User;
};
