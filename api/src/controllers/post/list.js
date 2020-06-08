const JsonReturn = require('../../helpers/json-return');
const { Post } = require('../../models');

module.exports = async (req, res) => {
    const ret = new JsonReturn();

    try {
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

        const posts = await Post.findAndCountAll({
            order: [order],
            limit: length,
            offset: start,
        });

        ret.addContent('posts', posts);
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
