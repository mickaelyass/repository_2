require('dotenv').config(); // Charger le fichier .env
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const sequelize = require('./db');
const utilisteurRoutes = require('./routes/utilisateurRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const congeRoutes = require('./routes/congeRoutes');
const uploadRouter = require('./routes/userProfileRoute');
const presenceRoutes = require("./routes/presenceRoutes");
const { init: initSocket } = require('./utils/socket');
const { planifierCronConges } = require('./cronjob/congesCron');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Utilise FRONTEND_URL depuis .env
    methods: '*',
  })
);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'frontend/public/uploads')));
app.use('/doc', express.static(path.join(__dirname, 'frontend/public/doc')));

// Socket.io
initSocket(server);

// Routes
app.use('/api', uploadRouter);
app.use('/api', utilisteurRoutes);
app.use('/api', dossierRoutes);
app.use('/api', congeRoutes);
app.use('/api', presenceRoutes);



// Synchronisation avec la base de données et démarrage du serveur
const port = process.env.PORT || 3003;
const dbName = process.env.DB_NAME;
console.log('Nom de la base de données:', dbName,port);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connexion à la base de données établie avec succès.');
    return sequelize.sync({ alter: true }).then(() => {
      console.log('Base de données synchronisée.');
    });
  })
  .then(() => {
    server.listen(port, () => {
      console.log(`Serveur en cours d'exécution sur le port ${port}.`);
    });
  })
  .catch((err) => {
    console.error('Erreur lors de la connexion à la base de données :', err);
  });

  // Exécuter la tâche Cron pour ajouter les jours de congés
planifierCronConges();