// src/routes/demandeConges.js
const express = require('express');
const router = express.Router();
const {createDemandeConge,listesDemandeConge,listesCongeParServices,
  findCongeId,findCongeMatricule,decisionChef,decisionDirectrice,listescongeParStatus,deleteConge,listescongeParStatusAutoriser
} = require('../controllers/demandeCongesController');
const multer = require('multer');
const path = require('path');
const fs=require('fs');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath=path.join(__dirname,'../frontend/public/doc');
    if(!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique du fichier
  }
});

// Création de l'instance multer avec la configuration
const upload = multer({ storage,
      fileFilter: (req, file, cb) => {
    cb(null, true); // Accepter tous les types de fichiers
  }
 });


// Route pour créer une demande de congés avec pièces jointes
router.post('/demande-conges/create', 
  upload.fields([{ name: 'certificat', maxCount: 1 }, { name: 'attestation', maxCount: 1 }]),
  createDemandeConge
);

router.get('/demande-conges', 
listesDemandeConge
);
// Route pour récupérer les demandes de congés par service
router.get('/demandes/service/:service',
  listesCongeParServices
);


// Route pour récupérer une demande de congé spécifique avec ses pièces jointes
router.get('/demande-conges/:id_cong',
findCongeId
);



// Route pour récupérer une demande de congés par matricule
 router.get('/demande-conges/:matricule', 
  findCongeMatricule
 );

// Route pour autoriser ou rejeter une demande de congés par le chef de service
router.put('/demande-conges/:id/decision-chef-service',
  decisionChef
 );

// Route pour valider ou invalider une demande de congés par la directrice
router.put('/demande-conges/:id/decision-directrice',
  decisionDirectrice
);

// Route pour récupérer toutes les demandes de congés avec un statut spécifique
router.get('/demande-conges/status/:status', 
  listescongeParStatus
);

router.get('/demande-conges-autoriser', 
  listescongeParStatusAutoriser
);


// Route pour supprimer une demande de congés
router.delete('/demande-conges/:id',
  deleteConge
 );

module.exports = router;