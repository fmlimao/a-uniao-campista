const Sequelize = require('sequelize');

const sequelize = new Sequelize('app', 'app', 'app', {
    host: 'localhost',
    port: 11002,
    dialect: 'mysql',
    // define: {
    //     timestamps: true,
    //     paranoid: true,
    // },
});

const { User } = require('./models');


// const Model = Sequelize.Model;
//
// class User extends Model {
// }

// User.init({
//     // attributes
//     firstName: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     lastName: {
//         type: Sequelize.STRING
//         // allowNull defaults to true
//     }
// }, {
//     sequelize,
//     modelName: 'users'
//     // options
// });

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');

        // Create a new user
        User.create({firstName: "Jane", lastName: "Doe"}).then(jane => {
            console.log("Jane's auto-generated ID:", jane.id);

            // Find all users
            User.findAll().then(users => {
                console.log("All users:", JSON.stringify(users, null, 4));

                // Change everyone without a last name to "Doe"
                User.update({lastName: "Doe"}, {
                    where: {
                        deletedAt: null
                    }
                }).then(() => {
                    console.log("Done");

                    // Delete everyone named "Jane"
                    User.destroy({
                        where: {
                            id: [1, 2, 3, 4, 5]
                        }
                    }).then(() => {
                        console.log("Done");

                        // Find all users
                        User.findAll().then(users => {
                            console.log("All users:", JSON.stringify(users, null, 4));
                        });
                    });
                });
            });
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// require('dotenv/config');
//
// const express = require('express');
// const helmet = require('helmet');
// const logger = require('morgan');
//
// const jsonReturn = require('./src/helpers/json-return');
//
// const app = express();
//
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));
// app.use(logger('dev'));
// app.use(helmet());
//
// app.get('/', (req, res) => {
//     res.send('ok');
// });
//
// app.get('/posts', (req, res) => {
//     const ret = new jsonReturn();
//     ret.addContent('posts', {});
//     return res.status(ret.getCode()).json(ret.generate());
// });
//
// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     const ret = new jsonReturn();
//     ret.setCode(404);
//     ret.addMessage('Rota não encontrada.');
//     return res.status(ret.getCode()).json(ret.generate());
// });
//
// // error handler
// app.use(function (err, req, res, next) {
//     const ret = new jsonReturn();
//     ret.setCode(err.status || 500);
//     ret.addMessage('Erro interno');
//     ret.addMessage(err.message);
//     return res.status(ret.getCode()).json(ret.generate());
// });
//
// app.listen(process.env.PORT, () => {
//     console.log(`Servidor rodando na porta ${process.env.PORT}`);
// });
