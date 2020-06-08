const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'ok',
    });
});

router.use('/posts', require('./controllers/post'));

module.exports = router;
