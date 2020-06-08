const sequelize = require('../../database/connection');

const JsonReturn = require('../../helpers/json-return');
const { Post, PostImage } = require('../../models');

module.exports = async (req, res) => {
    const ret = new JsonReturn();

    try {
        const { postId } = req.params;

        const post = await Post.findByPk(postId);

        if (!post) {
            ret.setCode(404);
            ret.setError(true);
            ret.addMessage('Post não encontrado.');

            return res.status(ret.getCode()).json(ret.generate());
        }

        const postImages = await PostImage.findAll({
            attributes: ['id', 'type', 'title', 'originalName', 'newName', 'path'],
            where: {
                postId: postId,
            },
            raw: true,
        });

        const groupedPostImages = postImages.reduce((a, c) => {
            const type = c.type;

            if (typeof a[type] === 'undefined') {
                a[type] = [];
            }

            a[type].push(c);

            return a;
        }, {});

        ret.addContent('images', groupedPostImages);

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
