require('dotenv').config(); // Charger le fichier .env
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const http = require('http');
const path = require('path');
const sequelize = require('./db');
const utilisteurRoutes = require('./routes/utilisateurRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const congeRoutes = require('./routes/congeRoutes');
const uploadRouter = require('./routes/userProfileRoute');
const presenceRoutes = require("./routes/presenceRoutes");
const notificationRoutes = require('./routes/notificationRoute');
const evaluationRoutes = require('./routes/evaluationRoute');
const { init: initSocket } = require('./utils/socket');
const { planifierCronConges } = require('./cronjob/congesCron');

const app = express();
// ... après const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "connect-src": ["'self'", "http://localhost:3003","https://app-backend-011q.onrender.com/" ,"ws://localhost:3004"],
        "img-src": ["'self'", "data:", "blob:"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// ... reste de tes middlewares (express.json, cors, etc.)
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
app.use('/api/users', utilisteurRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api', congeRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/evaluations', evaluationRoutes);



// Synchronisation avec la base de données et démarrage du serveur
const port = process.env.PORT ;
const dbName = process.env.DB_NAME;
console.log('Nom de la base de données:', dbName,port);

server.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}.`);

  // Connexion à la base de données APRÈS le démarrage du serveur
  sequelize.authenticate()
    .then(() => {
      console.log('Connexion à la base de données établie avec succès.');
      return sequelize.sync({ alter: true });
    })
    .then(() => {
      console.log('Base de données synchronisée.');
      planifierCronConges();
    })
    .catch((err) => {
      console.error('Erreur de base de données :', err);
    });
});
  
