'use strict';

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        userId: DataTypes.INTEGER,
        title: DataTypes.STRING,
        body: DataTypes.STRING
    }, {
        timestamps: true,
        paranoid: true,
    });
    Post.associate = function (models) {
        // associations can be defined here
        Post.belongsTo(models.User);
        Post.hasMany(models.PostImage);
    };
    return Post;
};