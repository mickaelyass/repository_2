const express = require('express');
//const bodyParser = require('body-parser');
const utilisteurRoutes = require('./routes/utilisateurRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const congeRoutes = require('./routes/congeRoutes');
/* const { InfoIdent,
  Dossier,
  Utilisateur,
  Diplome,
  PosteAnterieur,
  Details,
  Sanction,
  Distinction,
  PieceJointe,
  Notifications,
  InfoComplementaire,
  InfoPro,
  InfoBank,
  DemandeConges,
  UserProfile}=require('./models/association'); */
const cors =require('cors');
const  sequelize  = require('./db'); 
const http = require('http');
const socketIo = require('socket.io');
const { init: initSocket } = require('./utils/socket');
const path =require( 'path');

const app = express();
const uploadRouter = require('./routes/userProfileRoute');

app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb',extended:true}));

app.use('/uploads', express.static(path.join(__dirname,'frontend/public/uploads'))); // Sert les fichiers dans le répertoire uploads
//app.use('/doc', express.static(path.join(__dirname,'frontend/public/doc')));
const server = http.createServer(app);
initSocket(server); // Initialiser Socket.io avec le serveur


// Middleware
//app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',        // Autorise toutes les origines
  methods: '*'        // Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
}));


// Routes
//app.use('/api', uploadRouter);
app.use('/api', utilisteurRoutes);
app.use('/api', dossierRoutes);
app.use('/api', congeRoutes);

 

// Démarrer le serveur
const port = process.env.PORT || 3003;
sequelize.authenticate()
    .then(()=> {
        console.log('connexion has been established successfully');
        return sequelize.sync({ alter: true })
        .then(() => {
            console.log('Base de données synchronisée avec les nouveaux modèles');
          })
          .catch((error) => {
            console.error('Erreur de synchronisation :', error);
          });
        ;
    })
    .then(()=>{
        server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

})
    .catch(err=>{
      console.error('Unable to connect to the database',err);
    });
