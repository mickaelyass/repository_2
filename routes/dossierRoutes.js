const express= require('express');

const router = express.Router(); 

const {createMutation,creteDossier,getAllDossiers,getAllNotification,getDossierById
  ,getDossierByMaticule,searchDossiersByNomAndService,updateDossier,updateNotificationRead,updateEtat,deletedossier,getNotificationByMatricule,createEvaluation,getAllEvaluations,
  findEvaluationId,updateEvaluation,
  getAllEvaluationService
}=require('../controllers/dossierController.js');

//const { hashPassword, comparePassword, generateToken } = require('../utils/auth'); // Importez vos fonctions utilitaires

  // Création d'un dossier
  router.post('/dossiers', 
    creteDossier
  );
  
  
router.get('/dossiers', 
  getAllDossiers
  );

// Route pour récupérer des dossiers filtrés par nom et/ou service
router.get('/dossiers/search', 
  searchDossiersByNomAndService
);

router.get('/dossiers/:id', 
  getDossierById
); 

router.get('/dossiers/user/:matricule', 
  getDossierByMaticule
);


// Route pour mettre à jour un dossier
router.put('/dossiers/:id', updateDossier);



// Route to update the etat_depart field in the Dossier
router.put('/dossiers/:id_dossier/etat', 
  updateEtat
);

router.delete('/dossiers/:id_dossier', 
  deletedossier
);



router.get('/notifications',
  getAllNotification);


router.get('/notifications/:matricule',getNotificationByMatricule);
  // Route to mark a notification as read
// Import des modèles

// Route pour marquer une notification comme lue
router.put("/notifications/read/:id", 
  updateNotificationRead
);

 router.post('/mutations/:matricule', createMutation); 



// Route pour créer une évaluation
router.post("/create-evaluation", createEvaluation);

router.get("/evaluations", getAllEvaluations);
router.get("/evaluations/service/:service", getAllEvaluationService);


router.get('/evaluations/:id', findEvaluationId); 

router.put('/evaluations/:id',updateEvaluation ); 



  module.exports = router;