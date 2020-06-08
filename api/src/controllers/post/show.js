const JsonReturn = require('../../helpers/json-return');
const { Post } = require('../../models');

module.exports = async (req, res) => {
    const ret = new JsonReturn();

    try {
        const { postId } = req.params;

        const post = await Post.findOne({
            attributes: ['id', 'title', 'body', 'createdAt'],
            where: {
                id: postId,
            },
        });

        if (!post) {
            ret.setCode(404);
            ret.setError(true);
            ret.addMessage('Post não encontrado.');
            throw new Error();
        }

        const postImages = await post.getPostImages({
            attributes: ['id', 'type', 'title', 'originalName', 'newName', 'path', 'createdAt'],
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

        ret.addContent('post', post);
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
