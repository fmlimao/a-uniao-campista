const express = require('express');

const multer = require('multer');
const multerConfig = require('../../multer');
const upload = multer(multerConfig);

const router = express.Router();

router.get('/', require('./list'));
router.post('/', require('./store'));
router.get('/:postId', require('./show'));
router.get('/:postId/images', require('./images-list'));
router.post('/:postId/images', upload.single('image'), require('./images-store'));

module.exports = router;
