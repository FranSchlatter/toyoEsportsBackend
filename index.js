// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const contactRoutes = require('./src/routes/contactRoutes');
const newsRoutes = require('./src/routes/newsRoutes'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configurar multer para archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rutas
app.use('/api', contactRoutes);
app.use('/api', newsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); 
});