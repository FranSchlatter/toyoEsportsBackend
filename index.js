const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const contactRoutes = require('./src/routes/contactRoutes');
const newsRoutes = require('./src/routes/newsRoutes'); 

const app = express();

// Configuración CORS específica
const corsOptions = {
  origin: 'https://toyoesports.com', // Solo permitir el dominio frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔥 Agregar manualmente las cabeceras CORS necesarias
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://toyoesports.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Configurar multer para archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rutas
app.use('/api', contactRoutes);
app.use('/api', newsRoutes);

// Solo usar app.listen en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); 
  });
}

// Exportar la app para Vercel
module.exports = app;