require('dotenv/config');

const Sequelize = require('sequelize');

const sequelize = new Sequelize('app', 'app', 'app', {
    host: 'localhost',
    port: 11002,
    dialect: 'mysql',
});

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');
const jsonReturn = require('./src/helpers/json-return');

const app = express();

app.use(express.static(__dirname + '/public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(helmet());

app.get('/', (req, res) => {
    res.send('ok');
});

app.use('/posts', require('./src/routes/posts'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const ret = new jsonReturn();
    ret.setCode(404);
    ret.addMessage('Rota não encontrada.');
    return res.status(ret.getCode()).json(ret.generate());
});

// error handler
app.use(function (err, req, res, next) {
    const ret = new jsonReturn();
    ret.setCode(err.status || 500);
    ret.addMessage('Erro interno');
    ret.addMessage(err.message);
    return res.status(ret.getCode()).json(ret.generate());
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Conectado ao banco de dados.');

        app.listen(process.env.PORT, () => {
            console.log(`Servidor rodando na porta ${process.env.PORT}`);
        });
    })
    .catch(err => {
        console.error('Erro ao conectar com o banco de dados: ', err.message);
    });
