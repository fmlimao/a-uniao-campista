const sequelize = require('../../database/connection');

const JsonReturn = require('../../helpers/json-return');
const { Post, User } = require('../../models');

module.exports = async (req, res) => {
    const ret = new JsonReturn();
    ret.addFields(['title', 'body', 'userId']);

    try {
        let { title, body, userId } = req.body;
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
            }, { transaction: t });

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
};
