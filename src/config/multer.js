// server/src/config/multer.js
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite por archivo
  }
});

module.exports = upload;