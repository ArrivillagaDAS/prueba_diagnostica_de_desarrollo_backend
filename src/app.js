const express = require('express');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

app.use(express.json());

// Definición de rutas
app.use('/applications', applicationRoutes);

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  });
}

module.exports = app;