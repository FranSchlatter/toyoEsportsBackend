// server/src/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.post('/news', newsController.create);
router.get('/news', newsController.getAll);
router.get('/news/:slug', newsController.getBySlug);
router.put('/news/:slug', newsController.update);
router.delete('/news/:slug', newsController.delete);

module.exports = router;