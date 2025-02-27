const multer = require('multer');
const SftpClient = require('ssh2-sftp-client'); // 📌 Cliente SFTP para Hostinger
const News = require('../models/News');
require('dotenv').config();

// 🔹 Almacenamiento en memoria (las imágenes se suben a Hostinger, no se guardan en Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
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

// 🔹 Función para subir archivos a Hostinger vía SFTP
async function uploadToHostinger(file) {
  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host: process.env.SFTP_HOST, 
      port: 22, 
      username: process.env.SFTP_USER, 
      password: process.env.SFTP_PASS
    });

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-z0-9.]/gi, '_')}`;
    const remotePath = `/fe815abbc021867e/files/public_html/uploads/noticias/${filename}`;

    await sftp.put(file.buffer, remotePath); // 📌 Subir archivo
    await sftp.end();

    // 🔹 URL pública para acceder a la imagen
    return `https://toyoesports.com/uploads/noticias/${filename}`;
  } catch (error) {
    console.error('Error al subir a Hostinger:', error);
    throw new Error('No se pudo subir la imagen a Hostinger');
  }
}

// 🔹 Controlador de noticias
const newsController = {
  create: async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
          // 🔹 Subir imágenes a Hostinger
          const imageUrls = await Promise.all(req.files.map(uploadToHostinger));

          const newsData = { ...req.body, images: imageUrls };
          const news = await News.create(newsData);

          res.status(201).json({ success: true, news });
        } catch (error) {
          res.status(500).json({ error: 'Error al crear la noticia', details: error.message });
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error del servidor', details: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const { page = 1, type } = req.query;
      const news = await News.findAll({ page: parseInt(page), type });

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
      const oldNews = await News.findBySlug(req.params.slug);
      if (!oldNews) return res.status(404).json({ error: 'Noticia no encontrada' });

      upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
          // 🔹 Subir nuevas imágenes a Hostinger si hay nuevas
          const imageUrls = req.files.length > 0 ? await Promise.all(req.files.map(uploadToHostinger)) : oldNews.images;

          const updateData = { ...req.body, images: imageUrls };
          const updatedNews = await News.update(req.params.slug, updateData);

          res.json(updatedNews);
        } catch (error) {
          res.status(500).json({ error: 'Error al actualizar la noticia', details: error.message });
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error del servidor', details: error.message });
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