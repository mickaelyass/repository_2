const express= require('express');

const router = express.Router();
//const { hashPassword, comparePassword, generateToken } = require('../utils/auth'); // Importez vos fonctions utilitaires
const { InfoIdent,
  Dossier,
  Utilisateur,
  UserProfile,
  Diplome,
  PosteAnterieur,
  Sanction,
  Distinction,
  PieceJointe,
  Notifications,
  Details,
  InfoComplementaire,
  InfoPro,
  InfoBank,
  DemandeConges}=require('../models/association');

const { Op ,Sequelize} = require('sequelize');
const { getIo } = require('../utils/socket');
const sequelize=require('../db.js');


// Lire tous les dossiers


  // Création d'un dossier
  router.post('/dossiers', async (req, res) => {
    const {
      matricule,
      infoIdent,
      infoPro,
      infoBank,
      infoComplementaire,
      detailsMutation,
      sanction,
      diplome,
      poste,
      distinction,
    } = req.body;
  
    if (!matricule || !infoIdent || !infoPro || !infoBank) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const transaction = await sequelize.transaction();
    try {
      // Créer infoIdent
      const createdInfoIdent = await InfoIdent.create(infoIdent, { transaction });
      console.log(createdInfoIdent)
  
      // Créer un Details (par défaut ou avec les données fournies)
      const detail = detailsMutation || {
        matricule: matricule,
        etat: 'Actif',
        poste_actuel: 'Neant',
        service_actuel: 'Neant',
        nouveau_poste: 'Neant',
        nouveau_service: 'Neant',
        date_prise_fonction: '01/01/01',
        date_changement: '01/01/01',
        motif_changement: 'Neant',
        type_changement: 'Neant',
        besoins_formation: 'Neant',
      };
      
  
     
      // Créer infoPro
      const createdInfoPro = await InfoPro.create(
        {
          ...infoPro,
    
        },
        { transaction }
      );
      console.log(createdInfoPro);

     await Details.create({
        matricule: detail.matricule,
        etat: detail.etat,
        poste_actuel: detail.poste_actuel,
        service_actuel: detail.service_actuel,
        nouveau_poste: detail.nouveau_poste,
        nouveau_service: detail.nouveau_service,
        date_prise_fonction: detail.date_prise_fonction,
        date_changement: detail.date_changement,
        motif_changement: detail.motif_changement,
        type_changement: detail.type_changement,
        besoins_formation: detail.besoins_formation,
        infop: createdInfoPro.id_infop,
      }, { transaction });

      console.log(detail);
      // Créer un PosteAnterieur si fourni
      if (poste) {
        await PosteAnterieur.create(
          {
            nom_poste: poste.nom_poste,
            date_debut: poste.date_debut || null,
            date_fin: poste.date_fin || null,
            institution: poste.institution,
            infop: createdInfoPro.id_infop,
          },
          { transaction }
        );
      }
  
      // Créer un Diplome si fourni
      if (diplome) {
        await Diplome.create(
          {
            nom_diplome: diplome.nom_diplome,
            date_obtention: diplome.date_obtention,
            institution: diplome.institution,
            infop: createdInfoPro.id_infop,
          },
          { transaction }
        );
      }
  
      // Créer infoBank
      const createdInfoBank = await InfoBank.create(infoBank, { transaction });
      console.log(createdInfoBank)


      // Créer infoComplementaire
      const createdInfoComplementaire = await InfoComplementaire.create(
        {
          observation_particuliere: infoComplementaire?.observation_particuliere || '',
          situat_sante: infoComplementaire?.situat_sante || '',
        },
        { transaction }
      );
    console.log(createdInfoComplementaire)

      // Créer une Sanction si fournie
      if (sanction) {
        await Sanction.create(
          {
            sanction: sanction.saction_punitive,
            nature_sanction: sanction.nature_sanction,
            infoc: createdInfoComplementaire.id_infoc,
          },
          { transaction }
        );
      }
  
      // Créer une Distinction si fournie
      if (distinction) {
        await Distinction.create(
          {
            ref_distinction: distinction.ref_distinction,
            detail_distinction: distinction.detail_distinction,
            infoc: createdInfoComplementaire.id_infoc,
          },
          { transaction }
        );
      }
        
        // Vérifier si un dossier existe déjà pour ce matricule
    const existingDossier = await Dossier.findOne({ where: { matricule } });

    if (existingDossier) {
      return res.status(400).json({ error: 'Un dossier existe déjà pour ce matricule.' });
    }
      // Créer le dossier
      const dossier = await Dossier.create(
        {
          matricule,
          infoi: createdInfoIdent.id_infoi,
          infop: createdInfoPro.id_infop,
          infob: createdInfoBank.id_infob,
          infoc: createdInfoComplementaire.id_infoc,
        },
        { transaction }
      );
  
      // Commit de la transaction
      await transaction.commit();
  
      // Émettre une notification via Socket.io
      const notification = {
        message: `Dossier créé pour l'agent : ${matricule}`,
        user_id: matricule,
      };
      getIo().emit('receiveNotification', notification);
  
      res.status(201).json(dossier);
    } catch (err) {
      // Rollback en cas d'erreur
      await transaction.rollback();
      console.error('Error creating dossier', err);
      if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  // Route pour récupérer tous les dossiers avec leurs associations
router.get('/dossiers', async (req, res) => {
  try {
    // Chercher tous les dossiers avec leurs associations
    const dossiers = await Dossier.findAll({
      include: [
        {
          model:Utilisateur,
        },
        {
          model: InfoIdent,
        },
        {
          model: InfoPro,
         
          include: [
            {
              model: PosteAnterieur,
          
            },
            {
              model: Diplome,

            },
            {
              model: Details,
              
            },
          ],
        },
        {
          model: InfoBank,
      
        },
        {
          model: InfoComplementaire,
        
          include: [
            {
              model: Sanction,
            
            },
            {
              model: Distinction,
             
            },
          ],
        }
       
      ],
    });

    // Vérifier si des dossiers ont été trouvés
    if (!dossiers || dossiers.length === 0) {
      return res.status(404).json({ error: 'No dossiers found' });
    }

    // Retourner la liste de tous les dossiers avec leurs associations
    res.status(200).json(dossiers);
  } catch (err) {
    console.error('Error fetching dossiers', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour récupérer des dossiers filtrés par nom et/ou service
router.get('/dossiers/search', async (req, res) => {
  try {
    const { nom, service } = req.query;  // Récupérer les paramètres de recherche de la requête

    const conditions = {};

    if (nom && typeof nom === "string" && nom.trim() !== "") {
      conditions['$InfoIdent.nom$'] = { [Op.iLike]: `%${nom}%` };
    }
    
    if (service && typeof service === "string" && service.trim() !== "") {
      conditions['$InfoPro.service$'] = { [Op.iLike]: `%${service}%` };
    }
    


    // Rechercher les dossiers avec les conditions définies
    const dossiers = await Dossier.findAll({
      where: conditions,  // On applique les conditions de recherche
      include: [
        {
          model: Utilisateur,
        },
        {
          model: InfoIdent,
        },
        {
          model: InfoPro,
          include: [
            {
              model: PosteAnterieur,
            },
            {
              model: Diplome,
            },
            {
              model: Details,
            },
          ],
        },
        {
          model: InfoBank,
        },
        {
          model: InfoComplementaire,
          include: [
            {
              model: Sanction,
            },
            {
              model: Distinction,
            },
          ],
        },
      ],
    });

    // Vérifier si des dossiers ont été trouvés
    if (!dossiers || dossiers.length === 0) {
      return res.status(404).json({ error: 'No dossiers found matching the search criteria' });
    }

    // Retourner les dossiers trouvés
    res.status(200).json(dossiers);
  } catch (err) {
    console.error('Error searching dossiers', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dossiers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher le dossier avec l'id spécifié et ses associations
    const dossier = await Dossier.findOne({
      where: { id_dossier:id },  // Recherche le dossier avec cet id
      include: [
        {
          model: Utilisateur,
        },
        {
          model: InfoIdent,
        },
        {
          model: InfoPro,
          include: [
            {
              model: PosteAnterieur,
            },
            {
              model: Diplome,
            },
            {
              model: Details,
            },
          ],
        },
        {
          model: InfoBank,
        },
        {
          model: InfoComplementaire,
          include: [
            {
              model: Sanction,
            },
            {
              model: Distinction,
            },
          ],
        },
      ],
    });

    // Vérifier si le dossier a été trouvé
    if (!dossier) {
      return res.status(404).json({ error: `Dossier with id ${id} not found` });
    }

    // Retourner le dossier trouvé avec ses associations
    res.status(200).json(dossier);
  } catch (err) {
    console.error('Error fetching dossier by id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 

router.get('/dossiers/user/:matricule', async (req, res) => {
  try {
    const { matricule } = req.params;

    // Chercher le dossier associé à l'utilisateur avec ce matricule et ses associations
    const dossier = await Dossier.findOne({
      include: [
        {
          model: Utilisateur,
          where: { matricule },  // Recherche l'utilisateur avec ce matricule
        },
        {
          model: InfoIdent,
        },
        {
          model: InfoPro,
          include: [
            {
              model: PosteAnterieur,
            },
            {
              model: Diplome,
            },
            {
              model: Details,
            },
          ],
        },
        {
          model: InfoBank,
        },
        {
          model: InfoComplementaire,
          include: [
            {
              model: Sanction,
            },
            {
              model: Distinction,
            },
          ],
        },
      ],
    });

    // Vérifier si le dossier a été trouvé
    if (!dossier) {
      return res.status(404).json({ error: `Dossier with matricule ${matricule} not found` });
    }

    // Retourner le dossier trouvé avec ses associations
    res.status(200).json(dossier);
  } catch (err) {
    console.error('Error fetching dossier by matricule', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  


// Route pour mettre à jour un dossier
router.put('/dossiers/:id', async (req, res) => {
  const {
    matricule,
    infoIdent,
    infoPro,
    infoBank,
    infoComplementaire,
    detailsMutation,
    sanction,
    diplome,
    poste,
    distinction,
  } = req.body;

  const { id } = req.params;

  if (!matricule || !infoIdent || !infoPro || !infoBank) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transaction = await sequelize.transaction();
  try {
    // Chercher le dossier existant
    const dossier = await Dossier.findByPk(id, {
      include: [
        {
          model: Utilisateur,
        },
        {
          model: InfoIdent,
        },
        {
          model: InfoPro,
          include: [
            { model: PosteAnterieur },
            { model: Diplome },
            { model: Details },
          ],
        },
        {
          model: InfoBank,
        },
        {
          model: InfoComplementaire,
          include: [
            { model: Sanction },
            { model: Distinction },
          ],
        },
      ],
    });

    if (!dossier) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    // Commencer la transaction pour la mise à jour
    const infoIdentToUpdate = await dossier.getInfoIdent();
    const infoProToUpdate = await dossier.getInfoPro();
    const infoBankToUpdate = await dossier.getInfoBank();
    const infoComplementaireToUpdate = await dossier.getInfoComplementaire();

    // Mettre à jour infoIdent
    await infoIdentToUpdate.update(infoIdent, { transaction });
    console.log("Dossier récupéré :", detailsMutation)
    // Mettre à jour infoPro
    const detail = detailsMutation && Object.keys(detailsMutation).length > 0
    ? detailsMutation
    : {
        matricule: dossier.matricule,
        etat: 'Actif',
        poste_actuel: 'Neant',
        service_actuel: 'Neant',
        nouveau_poste: 'Neant',
        nouveau_service: 'Neant',
        date_prise_fonction: '01/01/01',
        date_changement: '01/01/01',
        motif_changement: 'Neant',
        type_changement: 'Neant',
        besoins_formation: 'Neant',
      };

 
    
    await infoProToUpdate.update(
      {
        ...infoPro,
  
      },
      { transaction }
    );


    await Details.create({
      matricule: detail.matricule,
      etat: detail.etat,
      poste_actuel: detail.poste_actuel,
      service_actuel: detail.service_actuel,
      nouveau_poste: detail.nouveau_poste,
      nouveau_service: detail.nouveau_service,
      date_prise_fonction: detail.date_prise_fonction,
      date_changement: detail.date_changement,
      motif_changement: detail.motif_changement,
      type_changement: detail.type_changement,
      besoins_formation: detail.besoins_formation,
      infop: infoProToUpdate.id_infop,
    }, { transaction });

    // Mise à jour de PosteAnterieur et Diplome si fournis
    if (poste) {
      await PosteAnterieur.create(
        {
          nom_poste: poste.nom_poste,
          date_debut: poste.date_debut || null,
          date_fin: poste.date_fin || null,
          institution: poste.institution,
          infop: infoProToUpdate.id_infop,
        },
        { transaction }
      );
    }

    if (diplome) {
      await Diplome.create(
        {
          nom_diplome: diplome.nom_diplome,
          date_obtention: diplome.date_obtention,
          institution:diplome.institution,
          infop: infoProToUpdate.id_infop,
        },
        { transaction }
      );
    }

    // Mettre à jour infoBank
    await infoBankToUpdate.update(infoBank, { transaction });

    // Mettre à jour infoComplementaire
    await infoComplementaireToUpdate.update(
      {
        observation_particuliere: infoComplementaire?.observation_particuliere || '',
        situat_sante: infoComplementaire?.situat_sante || '',
      },
      { transaction }
    );

    // Mise à jour des sanctions et distinctions si fournis
    if (sanction) {
      await Sanction.create(
        {
          sanction: sanction.saction_punitive,
          nature_sanction: sanction.nature_sanction,
          infoc: infoComplementaireToUpdate.id_infoc,
        },
        { transaction }
      );
    }

    if (distinction) {
      await Distinction.create(
        {
          ref_distinction: distinction.ref_distinction,
          detail_distinction: distinction.detail_distinction,
          infoc: infoComplementaireToUpdate.id_infoc,
        },
        { transaction }
      );
    }

    // Mettre à jour le dossier
    await dossier.update(
      {
        matricule,
        infoi: infoIdentToUpdate.id_infoi,
        infop: infoProToUpdate.id_infop,
        infob: infoBankToUpdate.id_infob,
        infoc: infoComplementaireToUpdate.id_infoc,
      },
      { transaction }
    );

    // Commit de la transaction
    await transaction.commit();

    // Émettre une notification via Socket.io
    const notification = {
      message: `Dossier mis à jour pour l'agent : ${matricule}`,
      user_id: matricule,
    };
    getIo().emit('receiveNotification', notification);

    res.status(200).json(dossier);
  } catch (err) {
    // Rollback en cas d'erreur
    await transaction.rollback();
    console.error('Error updating dossier', err);
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});



// Route to update the etat_depart field in the Dossier
router.put('/dossiers/:id_dossier/etat', async (req, res) => {
  const { id_dossier } = req.params;
  const { etat } = req.body;

  if (!etat) {
    return res.status(400).json({ error: 'etat_ is required' });
  }

  try {
    // Find the dossier by id_dossier
    const dossier = await Dossier.findByPk(id_dossier);

    if (!dossier) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    // Update the etat_depart field
    dossier.InfoPro.Details.etat= etat;

    // Save the updated dossier
    await dossier.save();

    res.status(200).json(dossier);
  } catch (err) {
    console.error('Error updating dossier state:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/dossiers/:id_dossier', async (req, res) => {
  const { id_dossier } = req.params;

  try {
    // Find the dossier by id_dossier
    const dossier = await Dossier.findByPk(id_dossier);

    if (!dossier) {
      return res.status(404).json({ error: 'Dossier not found' });
    }

    // Delete the dossier
    await dossier.destroy();

    res.status(200).json({ message: 'Dossier deleted successfully' });
  } catch (err) {
    console.error('Error deleting dossier:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/notifications',async (req, res) => {
  try {
    const notification = await Notifications.findAll(
      {
        order: [['create_dat', 'DESC']],
        limit: 9
      }
    );
    res.json(notification);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/notifications/:matricule',async (req, res) => {
  const { matricule} = req.params;
  try {
    const dossier = await Dossier.findOne({
      where: { matricule: matricule },
      include: [{
        model: InfoIdent,
        attributes: ['email'] // Récupérer l'email de l'agent
      },
      {
        model: Utilisateur,
        attributes: ['id_user'] // Récupérer l'email de l'agent
      }]
    }); 
  
    if (!dossier) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
  console.log("mon dossier",dossier)

    const user=dossier.Utilisateur.id_user
          
    const notification = await Notifications.findAll( { order: [['create_dat', 'DESC']],where: { 
      id_user:user }
   } );

    res.json(notification);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  // Route to mark a notification as read
// Import des modèles

// Route pour marquer une notification comme lue
router.put("/notifications/read/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Recherche de la notification par son ID
    const notification = await Notifications.findByPk(id);
    console.log(notification);
    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    // Mise à jour de l'état de lecture
    notification.is_read = true;
    await notification.save();
    console.log(notification);

    // Retour de la notification mise à jour
    res.status(200).json({
      message: "Notification marquée comme lue avec succès",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la notification",
      error: error.message,
    });
  }
});

  

/* router.put('/dossiers/:id_dossier/etat', async (req, res) => {
  const { id_dossier } = req.params;
  const { etat_depart } = req.body; // Get the new state from the request body
  
  try {console.log(req.body);
      // Vérifier si le dossier existe
      const dossier = await Dossier.findByPk(id_dossier);
      if (!dossier) {
          return res.status(404).json({ error: 'Dossier not found' });
      }

      // Vérifier si l'InfoPro associé existe
      const infoPro = await InfoPro.findByPk(dossier.id_infop);
      if (!infoPro) {
          return res.status(404).json({ error: 'InfoPro not found' });
      }

      // Mettre à jour l'état de départ
      infoPro.etat_depart = etat_depart;
      await infoPro.save();

     

      // Enregistrer une notification dans la base de données
      const notification = await Notification.create({
          message: `L'état  du dossier ${id_dossier} est passer à ${infoPro.etat_depart}.`,
          user_id: dossier.matricule,
      });

      // Émettre une notification via Socket.io
      getIo().emit('receiveNotification', notification);

      res.json({ message: 'État de départ mis à jour avec succès', dossier });
  } catch (err) {
      console.error('Error updating etat_depart', err);
      res.status(500).json({ error: 'Internal server error' });
  }
}); */



 router.post('/mutations/:matricule', async (req, res) => {
  
 const {
      etat,
      poste_actuel,
      service_actuel,
      nouveau_poste,
      nouveau_service,
      date_prise_fonction,
      date_changement,
      motif_changement,
      type_changement,
      besoins_formation
    } = req.body;
    const { matricule } = req.params;
  try {
   
    console.log("info",req.body);

    const dossier = await Dossier.findOne({
      where: { matricule: matricule },
      include: [{
        model: Utilisateur,
        attributes: ['id_user'] // Récupérer l'email de l'agent
      }]
    }); 
  
    if (!dossier) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    console.log("mon dossier",dossier)

    const infop=dossier.infop;
    const user=dossier.Utilisateur.id_user

     
     const  Mutation = await Details.create({
        matricule:matricule,
        etat:etat,
        poste_actuel:poste_actuel,
        service_actuel:service_actuel,
        nouveau_poste:nouveau_poste,
        nouveau_service:nouveau_service,
        date_prise_fonction:date_prise_fonction,
        date_changement :date_changement,
        motif_changement:motif_changement,
        type_changement:type_changement,
        besoins_formation:besoins_formation,
        infop:infop

      });
     const etatt=etat;


      const notification = {
        message: `L'agent  ${matricule} est ${etatt}.`,
        user_id: user,
    };

    // Émettre une notification via Socket.io
     getIo().emit('receiveNotification', notification);

      // Renvoi de la réponse avec les données mises à jour
      res.status(200).json(Mutation);

  } catch (error) {
    // Gestion des erreurs
    console.error('Erreur lors de la mise à jour de la mutation :', error.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la mutation : ' + error.message });
  }
}); 

  module.exports = router;