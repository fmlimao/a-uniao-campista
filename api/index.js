require('dotenv/config');

const express = require('express');
const helmet = require('helmet');
const logger = require('morgan');

const jsonReturn = require('./src/helpers/json-return');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(helmet());

app.get('/', (req, res) => {
    res.send('ok');
});

app.get('/posts', (req, res) => {
    const ret = new jsonReturn();
    ret.addContent('posts', {});
    return res.status(ret.getCode()).json(ret.generate());
});

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

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
