'use strict';

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: DataTypes.STRING,
        body: DataTypes.STRING,
        userId: DataTypes.INTEGER
    }, {
        timestamps: true,
        paranoid: true,
    });
    Post.associate = function (models) {
        // associations can be defined here
        Post.belongsTo(models.User);
    };
    return Post;
};