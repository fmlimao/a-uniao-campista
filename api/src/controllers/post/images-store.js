const sequelize = require('../../database/connection');
const fs = require('fs');

const JsonReturn = require('../../helpers/json-return');
const { Post, PostImage } = require('../../models');

module.exports = async (req, res) => {
    const ret = new JsonReturn();
    ret.addFields(['type', 'title', 'image']);

    const { postId } = req.params;
    const image = req.file;

    try {
        const post = await Post.findByPk(postId);

        if (!post) {
            ret.setCode(404);
            ret.setError(true);
            ret.addMessage('Post não encontrado.');

            return res.status(ret.getCode()).json(ret.generate());
        }

        let { type, title } = req.body;
        let error = false;

        if (!type) {
            error = true;
            ret.setFieldError('type', true, 'Campo obrigatório.');
        }

        if (!title) {
            error = true;
            ret.setFieldError('title', true, 'Campo obrigatório.');
        }

        if (!image) {
            error = true;
            ret.setFieldError('image', true, 'Campo obrigatório.');
        }

        if (error) {
            ret.setCode(400);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        const postImageExists = await PostImage.findOne({
            where: {
                postId: postId,
                type: type,
                title: title,
            },
        });

        if (postImageExists) {
            ret.setFieldError('title', true, 'Já existe uma imagem com esse tipo ou título para este post.');
            ret.setCode(400);
            ret.setError(true);
            ret.addMessage('Verifique todos os campos.');
            throw new Error();
        }

        await sequelize.transaction(async (t) => {
            const newPostImage = await PostImage.create({
                postId: postId,
                type: type,
                title: title,
                originalName: image.originalname,
                newName: image.filename,
                path: image.path,
            }, { transaction: t });

            ret.addContent('image', newPostImage);
        });

        ret.setCode(201);
        ret.addMessage('Imagem inserida com sucesso.');
        return res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        if (image) {
            fs.unlinkSync(image.path);
        }

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


