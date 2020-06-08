const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', 'public', 'files'),

        filename: function (request, file, callback) {
            const hash = crypto.randomBytes(8).toString('hex');
            const ext = file.originalname.split('.').reverse()[0];
            const fileName = `${hash}.${ext}`;
            callback(null, fileName);
        },
    }),
}
