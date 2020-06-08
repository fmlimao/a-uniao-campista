const Sequelize = require('sequelize');

const connection = new Sequelize('app', 'app', 'app', {
    host: 'localhost',
    port: 11002,
    dialect: 'mysql',
    // logging: (...msg) => console.log(msg),
    logging: () => {},
});

module.exports = connection;
