const express= require('express');

const router = express.Router(); 

const {createMutation,creteDossier,getAllDossiers,getDossierById
  ,getDossierByMaticule,searchDossiersByNomAndService,updateDossier,updateEtat,deletedossier,
 
}=require('../controllers/dossierController.js');

//const { hashPassword, comparePassword, generateToken } = require('../utils/auth'); // Importez vos fonctions utilitaires

  // Création d'un dossier
  router.post('/', 
    creteDossier
  );
  
  
router.get('/', 
  getAllDossiers
  );

// Route pour récupérer des dossiers filtrés par nom et/ou service
router.get('/search', 
  searchDossiersByNomAndService
);

router.get('/:id', 
  getDossierById
); 

router.get('/user/:matricule', 
  getDossierByMaticule
);


// Route pour mettre à jour un dossier
router.put('/:id',
   updateDossier);

// Route to update the etat_depart field in the Dossier
router.put('/:id_dossier/etat', 
  updateEtat
);

router.delete('/:id_dossier', 
  deletedossier
);

 router.post('/mutations/:matricule', 
  createMutation); 


  module.exports = router;