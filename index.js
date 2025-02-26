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
  origin: ['https://toyoesports.com', 'http://localhost:3000'], // Añade aquí todos los dominios que necesites
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware con las opciones CORS
app.use(cors(corsOptions));
app.use(express.json());

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