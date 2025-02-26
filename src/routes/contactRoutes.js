// server/src/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sendEmail } = require('../controllers/contactController');

// Configuración de multer para manejar archivos
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite por archivo
  }
});

router.post('/contact', upload.array('attachments', 5), sendEmail);

module.exports = router;