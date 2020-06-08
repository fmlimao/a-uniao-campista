require('dotenv/config');

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');

const connection = require('./src/database/connection');
const JsonReturn = require('./src/helpers/json-return');

const app = express();

app.use(express.static(__dirname + '/public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(helmet());

app.use(require('./src/routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const ret = new JsonReturn();
    ret.setCode(404);
    ret.addMessage('Rota não encontrada.');
    return res.status(ret.getCode()).json(ret.generate());
});

// error handler
app.use(function (err, req, res, next) {
    const ret = new JsonReturn();
    ret.setCode(err.status || 500);
    ret.addMessage('Erro interno');
    ret.addMessage(err.message);
    return res.status(ret.getCode()).json(ret.generate());
});

connection
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
