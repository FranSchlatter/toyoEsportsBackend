// server/src/controllers/newsController.js
const News = require('../models/News');

const newsController = {
  create: async (req, res) => {
    try {
      const { type, title, body, images } = req.body;
      
      if (!type || !title || !body || !images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ 
          error: 'Datos insuficientes. Se requiere type, title, body y un array de images con al menos una URL'
        });
      }
      
      // Verificar que todas las imágenes sean URLs válidas
      for (const url of images) {
        try {
          new URL(url);
        } catch (e) {
          return res.status(400).json({
            error: 'Una o más URLs de imágenes no son válidas',
            details: e.message
          });
        }
      }
      
      const newsData = {
        type,
        title,
        body,
        images
      };
      
      const news = await News.create(newsData);
      res.status(201).json({ success: true, ...news });
      
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al crear la noticia',
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
      
      res.json(news);
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
      
      res.json(news);
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

      const { type, title, body, images } = req.body;
      
      // Validar datos
      if (!type && !title && !body && (!images || !Array.isArray(images))) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
      }
      
      // Si hay imágenes, verificar que sean URLs válidas
      if (images && Array.isArray(images)) {
        for (const url of images) {
          try {
            new URL(url);
          } catch (e) {
            return res.status(400).json({
              error: 'Una o más URLs de imágenes no son válidas',
              details: e.message
            });
          }
        }
      }
      
      const updateData = {};
      if (type) updateData.type = type;
      if (title) updateData.title = title;
      if (body) updateData.body = body;
      if (images && Array.isArray(images) && images.length > 0) {
        updateData.images = images;
      }

      const updatedNews = await News.update(req.params.slug, updateData);
      res.json({ success: true, ...updatedNews });
      
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