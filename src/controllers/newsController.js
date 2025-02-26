// server/src/controllers/newsController.js
const fs = require('node:fs');
const path = require('path');
const News = require('../models/News');
const multer = require('multer');

// Determinar la ruta de upload según el entorno
const uploadPath = process.env.NODE_ENV === 'production'
  ? process.env.PRODUCTION_UPLOAD_PATH
  : path.join(__dirname, '../../../public/uploads/noticias');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFileName = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    cb(null, `${uniqueSuffix}-${safeFileName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten JPG, PNG y WebP'));
    }
  }
}).array('images', 5);

const newsController = {
  create: async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        
        const images = req.files ? req.files.map(file => file.filename) : [];
        const newsData = {
          ...req.body,
          images
        };
        
        try {
          const news = await News.create(newsData);
          res.status(201).json(news);
        } catch (error) {
          // Si hay error, eliminar las imágenes subidas
          images.forEach(filename => {
            const filepath = path.join(uploadPath, filename);
            fs.unlink(filepath, err => {
              if (err) console.error('Error eliminando imagen:', err);
            });
          });
          
          res.status(500).json({ 
            error: 'Error al crear la noticia',
            details: error.message 
          });
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error del servidor', 
        details: error.message 
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const { page = 1, type } = req.query;
      const news = await News.findAll({ 
        page: parseInt(page), 
        type 
      });
      
      // Agregar la URL base a las imágenes
      const newsWithFullUrls = {
        ...news,
        news: news.news.map(item => ({
          ...item,
          images: item.images.map(img => img)
        }))
      };
      
      res.json(newsWithFullUrls);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener las noticias',
        details: error.message 
      });
    }
  },

  getBySlug: async (req, res) => {
    try {
      const news = await News.findBySlug(req.params.slug);
      if (!news) {
        return res.status(404).json({ error: 'Noticia no encontrada' });
      }
      
      // Agregar la URL base a las imágenes
      const newsWithFullUrls = {
        ...news,
        images: news.images.map(img => img)
      };
      
      res.json(newsWithFullUrls);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener la noticia',
        details: error.message 
      });
    }
  },

  update: async (req, res) => {
    try {
      const oldNews = await News.findBySlug(req.params.slug);
      if (!oldNews) {
        return res.status(404).json({ error: 'Noticia no encontrada' });
      }

      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        const updateData = { ...req.body };
        
        if (req.files && req.files.length > 0) {
          // Eliminar imágenes antiguas
          oldNews.images.forEach(filename => {
            const filepath = path.join(uploadPath, filename);
            fs.unlink(filepath, err => {
              if (err) console.error('Error eliminando imagen antigua:', err);
            });
          });
          
          updateData.images = req.files.map(file => file.filename);
        }

        try {
          const updatedNews = await News.update(req.params.slug, updateData);
          res.json(updatedNews);
        } catch (error) {
          // Si hay error, eliminar las nuevas imágenes
          if (req.files) {
            req.files.forEach(file => {
              fs.unlink(file.path, err => {
                if (err) console.error('Error eliminando imagen:', err);
              });
            });
          }
          
          throw error;
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al actualizar la noticia',
        details: error.message 
      });
    }
  },

  delete: async (req, res) => {
    try {
      const news = await News.findBySlug(req.params.slug);
      if (!news) {
        return res.status(404).json({ error: 'Noticia no encontrada' });
      }

      // Eliminar imágenes
      news.images.forEach(filename => {
        const filepath = path.join(uploadPath, filename);
        fs.unlink(filepath, err => {
          if (err) console.error('Error eliminando imagen:', err);
        });
      });

      await News.delete(req.params.slug);
      res.json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al eliminar la noticia',
        details: error.message 
      });
    }
  }
};

module.exports = newsController;