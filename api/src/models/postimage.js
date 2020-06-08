'use strict';
module.exports = (sequelize, DataTypes) => {
    const PostImage = sequelize.define('PostImage', {
        postId: DataTypes.INTEGER,
        type: DataTypes.STRING,
        title: DataTypes.STRING,
        originalName: DataTypes.STRING,
        newName: DataTypes.STRING,
        path: DataTypes.STRING
    }, {
        timestamps: true,
        paranoid: true,
    });
    PostImage.associate = function (models) {
        // associations can be defined here
        PostImage.belongsTo(models.Post);
    };
    return PostImage;
};