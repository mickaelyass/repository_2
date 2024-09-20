// src/routes/demandeConges.js
const express = require('express');
const router = express.Router();
const Dossier = require('../models/dossier');
const InfoPro = require('../models/infoPro');
const InfoIdent=require('../models/infoIdent');
const DemandeConges = require('../models/demandeConge');
const Piece_jointe  = require('../models/piece_jointe');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs=require('fs');
const { getIo } = require('../utils/socket');
const Notification = require('../models/notification');
const DetailsMutation = require('../models/detailsMutation');
const nodemailer = require('nodemailer');

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Utiliser le service que vous souhaitez
  auth: {
    user: 'yassegoungbeseton@gmail.com', // Votre email
    pass: 'hher oiai suyf rqni' // Votre mot de passe ou application-specific password
  },
  connectionTimeout: 10000 // Ajustez le délai d'attente à 10 secondes
});

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
router.post('/demande-conges/create', upload.fields([{ name: 'certificat', maxCount: 1 }, { name: 'attestation', maxCount: 1 }]), async (req, res) => {
 console.log(req.body);
 console.log(req.files);
  try {
    // Traiter les pièces jointes
    const pieceJointeData = {};
    if (req.files) {
      if (req.files['certificat']) {
        const certificatFile = req.files['certificat'][0];
        pieceJointeData.url_certificat_non_jouissance = `/doc/${certificatFile.filename}`;
      }
      if (req.files['attestation']) {
        const attestationFile = req.files['attestation'][0];
        pieceJointeData. url_derniere_autorisation_conges= `/doc/${attestationFile.filename}`;
      }

      // Créer une nouvelle pièce jointe
      const newPieceJointe = await Piece_jointe.create(pieceJointeData);

        

 // Créer la demande de congés
    const { matricule, date_debut, annee_jouissance, raison } = req.body;
    const newDemande = await DemandeConges.create({
      matricule:matricule,
      date_debut:date_debut,
      annee_jouissance:annee_jouissance,
      raison:raison,
      piece_jointe: newPieceJointe.id_piece
    });


     // Récupérer le dossier de l'agent par matricule
  const dossier = await Dossier.findOne({
    where: { matricule: matricule },
    include: [{
      model: InfoIdent,
      attributes: ['email'] // Récupérer l'email de l'agent
    }]
  });

  if (!dossier) {
    return res.status(404).json({ error: 'Dossier non trouvé' });
  }

  const agentEmail = dossier.InfoIdent.email;
    const notification = {
      message: `Nouveau demande de congé créé pour l'employé : ${matricule}`,
      user_id: matricule,
    };

    // Émettre une notification via Socket.io
    getIo().emit('receiveNotification', notification); 

  // Envoyer un email au chef de service
  const mailOptions = {
    from: agentEmail,
    to: 'setonmickaelyassegoungbe@gmail.com', // L'email du chef de service
    subject: 'Nouvelle demande de congé',
    text: `Une nouvelle demande de congé a été créée par un subordonné. 
           Matricule: ${matricule}, Date de début: ${date_debut}, Année de jouissance: ${annee_jouissance}.`
  };

  const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé: ' + info.response);

    res.status(201).json(newDemande);
    }
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création de la demande de congés.' });
  }
});

router.get('/demande-conges', async (req, res) => {
  try {
    const demandes = await DemandeConges.findAll({
      include: {
        model: Piece_jointe,
      }
    });

    res.status(200).json(demandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des demandes de congés. Détails :', details: error.message });
  }
});
// Route pour récupérer les demandes de congés par service
router.get('/demandes/service/:service', async (req, res) => {
  const { service } = req.params;

  try {
    // Récupérer les matricules des agents dans le service donné
    const dossiers = await Dossier.findAll({
      include: [{
        model: InfoPro,
        attributes: [
          'statut', 'corps', 'categorie', 'branche_du_personnel', 'fonctions', 'ref_nomination',
          'dat_prise_fonction', 'responsabilite_partiuliere', 'grade_paye', 'indice_paye', 
          'dat_first_prise_de_service', 'dat_de_depart_retraite', 'dat_de_prise_service_dans_departement',
          'ref_acte_de_prise_service_poste_actuel', 'poste_actuel_service', 'type_structure', 
          'zone_sanitaire', 'poste_specifique', 'etat_depart', 'poste_anterieurs', 'autres_diplome'
        ],

        include: [
          {
            model: DetailsMutation,
            attributes: [
              'id_detail','matricule', 'etat_depart', 'poste_actuel', 'service_actuel', 'nouveau_poste',
              'nouveau_service', 'date_prise_fonction', 'date_changement', 'motif_changement',
              'type_changement', 'besoins_formation'
            ]
          }
        ],
        where: {
          poste_actuel_service: service
        }
      }]
    });
   console.log("dossier",dossiers);

    const matricules = dossiers.map(dossier => dossier.matricule);
   
    // Récupérer les demandes de congés pour ces matricules
    const demandes = await DemandeConges.findAll({
      where: {
        matricule: {
          [Op.in]: matricules
        },
        decision_chef_service:'En attente'
        
      },
      include: [{
        model: Piece_jointe // Pour inclure les pièces jointes
      }]
    });

    console.log(demandes);
    res.status(200).json(demandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de congés par service:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes de congés', error });
  }
});


// Route pour récupérer une demande de congé spécifique avec ses pièces jointes
router.get('/demande-conges/:id_cong', async (req, res) => {
  const { id_cong } = req.params;
  
  try {
    // Recherche de la demande de congé par son ID, incluant les pièces jointes
    const demande = await DemandeConges.findByPk(id_cong, {
      include: [Piece_jointe]
    });

    if (!demande) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Réponse avec les détails de la demande de congé et des pièces jointes
    res.status(200).json(demande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande de congés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la demande de congés.' });
  }
});



// Route pour récupérer une demande de congés par matricule
 router.get('/demande-conges/:matricule', async (req, res) => {
   const { matricule } = req.params;
   try {
     const demande = await DemandeConges.findOne({
       where: { matricule },
       include: Piece_jointe
     });

     if (!demande) {
     return res.status(404).json({ error: 'Demande non trouvée' });
     }

     res.status(200).json(demande);
   } catch (error) {
     console.error(error);
     res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de la demande de congés.' });
  }
 });

// Route pour autoriser ou rejeter une demande de congés par le chef de service
router.put('/demande-conges/:id/decision-chef-service', async (req, res) => {
  const { id } = req.params;
  const { decision_chef_service } = req.body;
    // Assurez-vous que la valeur de decision_chef_service est une des valeurs autorisées par l'ENUM
    const validDecisions = ['Autorisée', 'Rejetée', 'En attente'];

    if (!validDecisions.includes(decision_chef_service)) {
      return res.status(400).json({ error: 'Valeur de décision non valide' });
    }
   
  try {
    const demande = await DemandeConges.findByPk(id);

    if (!demande) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }
    demande.decision_chef_service = decision_chef_service;
    await demande.save();
    

     const dossier = await Dossier.findOne({
    where: { matricule: matricule },
    include: [{
      model: InfoIdent,
      attributes: ['email'] // Récupérer l'email de l'agent
    }]
  });

  if (!dossier) {
    return res.status(404).json({ error: 'Dossier non trouvé' });
  }

  const agentEmail = dossier.InfoIdent.email;
    const notification = {
      message: `Nouveau demande de congé créé pour l'employé : ${matricule}`,
      user_id: matricule,
    };

    // Émettre une notification via Socket.io
    getIo().emit('receiveNotification', notification); 

  // Envoyer un email au chef de service
  const mailOptions = {
    from: agentEmail,
    to: 'setonmickaelyassegoungbe@gmail.com', // L'email du chef de service
    subject: 'Nouvelle demande de congé',
    text: `Une nouvelle demande de congé a été créée par un subordonné. 
           Matricule: ${matricule}, Date de début: ${date_debut}, Année de jouissance: ${annee_jouissance}.`
  };

  const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé: ' + info.response);



  

    res.status(200).json(demande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de la décision du chef de service.' });
  }
});

// Route pour valider ou invalider une demande de congés par la directrice
router.put('/demande-conges/:id/decision-directrice', async (req, res) => {
  const { id } = req.params;
  const { decision_directrice } = req.body;

  try {
    const demande = await DemandeConges.findByPk(id);

    if (!demande) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    demande.decision_directrice = decision_directrice;
    if(demande.decision_directrice='Validé'){
      demande.status='Autorisée';
    } 
    if(demande.decision_directrice='Invalidé'){
      demande.status='Rejetée';
    } 
    
    await demande.save();
    const notification = await Notification.create({
      message: `La demande de congé de l'agent ${demande.matricule} est ${demande.decision_directrice}`,
      user_id: demande.matricule,
    });

    // Émettre une notification via Socket.io
    getIo().emit('receiveNotification', notification);

    res.status(200).json(demande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de la décision de la directrice.' });
  }
});

// Route pour récupérer toutes les demandes de congés avec un statut spécifique
router.get('/demande-conges/status/:status', async (req, res) => {
  const { status } = req.params;

  try {
    const demandes = await DemandeConges.findAll({
      where: { decision_chef_service:status
},
      include: Piece_jointe
    });

    res.status(200).json(demandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des demandes de congés.' });
  }
});

// Route pour supprimer une demande de congés
router.delete('/demande-conges/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const demande = await DemandeConges.findByPk(id);

    if (!demande) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    await demande.destroy();
    res.status(200).json({ message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de la demande de congés.' });
  }
});

module.exports = router;