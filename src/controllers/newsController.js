const News = require('../models/News');

const newsController = {
  create: async (req, res) => {
    try {
      const { title, body, type, imageUrl } = req.body;

      if (!title || !body || !type || !imageUrl) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      const newsData = { title, body, type, imageUrl };
      const news = await News.create(newsData);

      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la noticia', details: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const news = await News.findAll();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las noticias', details: error.message });
    }
  },

  getBySlug: async (req, res) => {
    try {
      const news = await News.findBySlug(req.params.slug);
      if (!news) return res.status(404).json({ error: 'Noticia no encontrada' });

      res.json(news);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la noticia', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const news = await News.findBySlug(req.params.slug);
      if (!news) return res.status(404).json({ error: 'Noticia no encontrada' });

      const { title, body, type, imageUrl } = req.body;
      const updatedNews = await News.update(req.params.slug, { title, body, type, imageUrl });

      res.json(updatedNews);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la noticia', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const news = await News.findBySlug(req.params.slug);
      if (!news) return res.status(404).json({ error: 'Noticia no encontrada' });

      await News.delete(req.params.slug);
      res.json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la noticia', details: error.message });
    }
  }
};

module.exports = newsController;