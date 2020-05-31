require('dotenv/config');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(helmet());

const {User, Post} = require('./models');

app.get('/', (req, res) => {
    res.send('ok');
});

app.get('/posts', async (req, res) => {
    const ret = new jsonReturn();

    let start = req.query.start;
    let length = req.query.length;
    let order = req.query.order;

    if (start) {
        start = parseInt(start);
    } else {
        start = 0;
    }

    if (length) {
        length = parseInt(length);
    } else {
        length = 10;
    }

    if (order) {
        if (!order[0]) {
            order[0] = 'id';
        }
        if (!order[1]) {
            order[1] = 'ASC';
        }
    } else {
        order = ['id', 'ASC'];
    }

    Post.findAndCountAll({
        order: [order],
        limit: length,
        offset: start,
    })
        .then(posts => {
            ret.addContent('posts', posts);
            return res.status(ret.getCode()).json(ret.generate());
        })
        .catch(err => {
            ret.setCode(500).setError(true).addMessage(err.message);
            return res.status(ret.getCode()).json(ret.generate());
        });
});

app.post('/posts', async (req, res) => {
    const ret = new jsonReturn();
    ret.addFields(['title', 'body', 'userId']);

    try {
        let {title, body, userId} = req.body;
        let error = false;

        if (!title) {
            error = true;
            ret.setFieldError('title', true, 'Campo obrigatório.');
        }
        if (!body) {
            error = true;
            ret.setFieldError('body', true, 'Campo obrigatório.');
        }
        if (!userId) {
            error = true;
            ret.setFieldError('userId', true, 'Campo obrigatório.');
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        const userExists = await User.findAll({
            where: {
                id: userId,
            },
        });

        if (!userExists.length) {
            ret.setCode(400);
            ret.addMessage('Usuário não existe.');
            throw new Error();
        }

        const postExists = await Post.findAll({
            where: {
                title: title,
            },
        });

        if (postExists.length) {
            ret.setFieldError('title', true, 'Já existe um post com esse título.');

            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        await sequelize.transaction(async (t) => {
            const newPost = await Post.create({
                userId: userId,
                title: title,
                body: body,
            }, {transaction: t});

            ret.addContent('post', newPost);
        });

        ret.setCode(201);
        ret.addMessage('Post inserido com sucesso.');
        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret.setError(true);

        if (ret.getCode() === 200) {
            ret.setCode(500);
        }

        if (err.message) {
            ret.addMessage(err.message);
        }

        return res.status(ret.getCode()).json(ret.generate());
    }
});

app.get('/posts/:postId', async (req, res) => {
    const ret = new jsonReturn();
    const {postId} = req.params;

    Post.findAll({
        where: {
            id: postId,
        },
    })
        .then(posts => {
            if (!posts.length) {
                ret.setCode(404);
                ret.setError(true);
                ret.addMessage('Post não encontrado.');

                return res.status(ret.getCode()).json(ret.generate());
            }
            ret.addContent('post', posts[0]);
            return res.status(ret.getCode()).json(ret.generate());
        })
        .catch(err => {
            ret.setCode(500).setError(true).addMessage(err.message);
            return res.status(ret.getCode()).json(ret.generate());
        });
});

app.put('/posts/:postId', async (req, res) => {
    const ret = new jsonReturn();
    ret.addFields(['title', 'body']);

    const {postId} = req.params;
    Post.findAll({
        where: {
            id: postId,
        },
    })
        .then(async posts => {
            if (!posts.length) {
                ret.setCode(404);
                ret.setError(true);
                ret.addMessage('Post não encontrado.');

                return res.status(ret.getCode()).json(ret.generate());
            }

            try {
                let {title, body, userId} = req.body;
                let error = false;

                if (!title) {
                    error = true;
                    ret.setFieldError('title', true, 'Campo obrigatório.');
                }
                if (!body) {
                    error = true;
                    ret.setFieldError('body', true, 'Campo obrigatório.');
                }

                if (error) {
                    ret.setCode(400);
                    ret.addMessage('Verifique todos os campos.');
                    throw new Error();
                }

                const postExists = await Post.findAll({
                    where: {
                        title: title,
                        id: {
                            [Op.ne]: postId,
                        },
                    },
                });

                if (postExists.length) {
                    ret.setFieldError('title', true, 'Já existe um post com esse título.');

                    ret.setCode(400);
                    ret.addMessage('Verifique todos os campos.');
                    throw new Error();
                }

                await sequelize.transaction(async (t) => {
                    await Post.update({
                        title: title,
                        body: body,
                    }, {
                        where: {
                            id: postId,
                        }
                    }, {transaction: t});

                    const updatedPost = await Post.findAll({
                        where: {
                            id: postId,
                        },
                    }, {transaction: t});

                    ret.setCode(200);
                    ret.addMessage('Post editado com sucesso.');
                    ret.addContent('post', updatedPost[0]);
                    return res.status(ret.getCode()).json(ret.generate());
                });
            } catch (err) {
                ret.setError(true);

                if (ret.getCode() === 200) {
                    ret.setCode(500);
                }

                if (err.message) {
                    ret.addMessage(err.message);
                }

                return res.status(ret.getCode()).json(ret.generate());
            }
        })
        .catch(err => {
            ret.setCode(500).setError(true).addMessage(err.message);
            return res.status(ret.getCode()).json(ret.generate());
        });
});

app.delete('/posts/:postId', async (req, res) => {
    const ret = new jsonReturn();
    const {postId} = req.params;

    Post.findAll({
        where: {
            id: postId,
        },
    })
        .then(posts => {
            if (!posts.length) {
                ret.setCode(404);
                ret.setError(true);
                ret.addMessage('Post não encontrado.');

                return res.status(ret.getCode()).json(ret.generate());
            }

            Post.destroy({
                where: {
                    id: postId,
                }
            })
                .then(() => {
                    ret.setCode(204);
                    ret.addMessage('Post removido com sucesso.');
                    return res.status(ret.getCode()).json(ret.generate());
                })
                .catch(err => {
                    ret.setCode(500).setError(true).addMessage(err.message);
                    return res.status(ret.getCode()).json(ret.generate());
                });
        })
        .catch(err => {
            ret.setCode(500).setError(true).addMessage(err.message);
            return res.status(ret.getCode()).json(ret.generate());
        });
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
