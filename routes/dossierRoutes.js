const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateur'); // Assurez-vous que le chemin est correct
//const { hashPassword, comparePassword, generateToken } = require('../utils/auth'); // Importez vos fonctions utilitaires
const Dossier = require('../models/dossier');
const InfoIdent = require('../models/infoIdent');
const InfoPro = require('../models/infoPro');
const InfoBank = require('../models/infoBank');
const InfoComplementaire = require('../models/infoComplementaire');
const { Op } = require('sequelize');
const { getIo } = require('../utils/socket');
const Notification = require('../models/notification');
const DetailsMutation = require('../models/detailsMutation');

InfoPro.hasMany(DetailsMutation, {
  foreignKey: 'infoProId',
  as: 'mutations'
});

DetailsMutation.belongsTo(InfoPro, {
  foreignKey: 'infoProId',
  as: 'infoPro'
});

// Lire tous les dossiers
router.get('/notifications',async (req, res) => {
  try {
    const notification = await Notification.findAll(
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
    const notification = await Notification.findAll( { order: [['create_dat', 'DESC']],where: { 
      user_id:matricule }
   } );

    res.json(notification);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/dossiers', async (req, res) => {
    try {
      const dossiers = await Dossier.findAll({
        include: [
          {
            model: Utilisateur,
            attributes: ['matricule','role']
          },
          {
            model: InfoIdent,
            attributes: [
              'cnss', 'nom', 'prenom', 'nom_du_conjoint', 'sexe', 'dat_nat', 'lieu_nat', 
              'situat_matri','email', 'dat_mariage', 'nbre_enfants'
            ]
          },
          {
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
                  'id_detail', 'matricule','etat_depart', 'poste_actuel', 'service_actuel', 'nouveau_poste',
                  'nouveau_service', 'date_prise_fonction', 'date_changement', 'motif_changement',
                  'type_changement', 'besoins_formation'
                ]
              }
            ]
          },
          {
            model: InfoBank,
            attributes: [
              'rib', 'mtn', 'celtics', 'libercom'
            ]
          },
          {
            model: InfoComplementaire,
            attributes: [
              'observation_particuliere', 'distinction', 'ref_distinction', 'detail_distinction',
              'situat_sante', 'saction_punitive', 'nature_sanction'
            ]
          }
        ]
      });
      
      res.json(dossiers);
    } catch (err) {
      console.error('Error fetching dossiers', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  router.get('/dossiers/search', async (req, res) => {
    const { nom, service } = req.query;
  
    const whereClause = {};
  
    if (nom) {
        whereClause['$InfoIdent.nom$'] = {
            [Op.iLike]: `%${nom}%`
        };
    }
  
    if (service) {
        whereClause['$InfoPro.poste_actuel_service$'] = {
            [Op.iLike]: `%${service}%`
        };
    }
  
    console.log('Received query parameters:', req.query);
    console.log('Constructed whereClause:', whereClause);
  
    try {
        const dossiers = await Dossier.findAll({
            include: [
                {
                    model: Utilisateur,
                    attributes: ['matricule', 'role']
                },
                {
                    model: InfoIdent,
                    attributes: [
                        'cnss', 'nom', 'prenom', 'nom_du_conjoint', 'sexe', 'dat_nat', 'lieu_nat', 
                        'situat_matri', 'email','dat_mariage', 'nbre_enfants'
                    ]
                },
                {
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
                          'id_detail', 'matricule','etat_depart', 'poste_actuel', 'service_actuel', 'nouveau_poste',
                          'nouveau_service', 'date_prise_fonction', 'date_changement', 'motif_changement',
                          'type_changement', 'besoins_formation'
                        ]
                      }
                    ]
                },
                {
                    model: InfoBank,
                    attributes: [
                        'rib', 'mtn', 'celtics', 'libercom'
                    ]
                },
                {
                    model: InfoComplementaire,
                    attributes: [
                        'observation_particuliere', 'distinction', 'ref_distinction', 'detail_distinction',
                        'situat_sante', 'saction_punitive', 'nature_sanction'
                    ]
                }
            ],
            where: whereClause
        });
  
        console.log('Dossiers found:', dossiers);
        res.json(dossiers);
    } catch (err) {
        console.error('Error fetching dossiers', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });


  
  // Lire un dossier par ID
  router.get('/dossiers/:id', async (req, res) => {
    try {
      const dossier = await Dossier.findByPk(req.params.id, {
        include:  [
          {
            model: Utilisateur,
            attributes: ['matricule','role']
          },
          {
            model: InfoIdent,
            attributes: [
              'cnss', 'nom', 'prenom', 'nom_du_conjoint', 'sexe', 'dat_nat', 'lieu_nat', 
              'situat_matri','email', 'dat_mariage', 'nbre_enfants'
            ]
          },
          {
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
            ]
          },
          {
            model: InfoBank,
            attributes: [
              'rib', 'mtn', 'celtics', 'libercom'
            ]
          },
          {
            model: InfoComplementaire,
            attributes: [
              'observation_particuliere', 'distinction', 'ref_distinction', 'detail_distinction',
              'situat_sante', 'saction_punitive', 'nature_sanction'
            ]
          }
        ]
      });
      if (dossier) {
        res.json(dossier);
      } else {
        res.status(404).json({ error: 'Dossier not found' });
      }
    } catch (err) {
      console.error('Error fetching dossier', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });




  // Création d'un dossier
  router.post('/dossiers', async (req, res) => {
    const { matricule, infoIdent, infoPro, infoBank, infoComplementaire, detailsMutation } = req.body;
  
    try {
      // Créer les détails de mutation s'ils sont fournis, sinon utiliser les valeurs par défaut
      let createdDetailsMutation = null;
    if (detailsMutation) {
      createdDetailsMutation = await DetailsMutation.create(detailsMutation);
    } else {
      // Créer un enregistrement par défaut avec id_detail = 0
      createdDetailsMutation = await DetailsMutation.create({
       // Valeur par défaut pour les cas où detailsMutation est null
        matricule: matricule,
        etat_depart: 'Actif',
        poste_actuel: 'Neant',
        service_actuel: 'Neant',
        nouveau_poste: 'Neant',
        nouveau_service: 'Neant',
        date_prise_fonction: '01/01/01',
        date_changement: '01/01/01',
        motif_changement:'Neant',
        type_changement: 'Neant',
        besoins_formation:'Neant'
      });
    }
      const etatDepart = createdDetailsMutation.id_detail;
      // Créer les informations (identité, bancaires et complémentaires) si nécessaires
      const createdInfoIdent = await InfoIdent.create(infoIdent);
  
      // Créer infoPro avec l'ID du detailsMutation si disponible
      const createdInfoPro = await InfoPro.create({ 
      statut: infoPro.statut,
      corps: infoPro.corps,
      categorie: infoPro.categorie,
      branche_du_personnel: infoPro.branche_du_personnel || null,
      fonctions: infoPro.fonctions,
      ref_nomination: infoPro.ref_nomination || null,
      dat_prise_fonction: infoPro.dat_prise_fonction || null,
      responsabilite_partiuliere: infoPro.responsabilite_partiuliere || null,
      grade_paye: infoPro.grade_paye,
      indice_paye: infoPro.indice_paye,
      dat_first_prise_de_service: infoPro.dat_first_prise_de_service,
      dat_de_depart_retraite: infoPro.dat_de_depart_retraite || null,
      dat_de_prise_service_dans_departement: infoPro.dat_de_prise_service_dans_departement || null,
      ref_acte_de_prise_service_poste_actuel: infoPro.ref_acte_de_prise_service_poste_actuel || null,
      poste_actuel_service: infoPro.poste_actuel_service,
      type_structure: infoPro.type_structure || null,
      zone_sanitaire: infoPro.zone_sanitaire,
      poste_specifique: infoPro.poste_specifique || null,
      etat_depart: etatDepart, // Utiliser la valeur définie pour etat_depart
      poste_anterieurs: infoPro.poste_anterieurs || null,
      autres_diplome: infoPro.autres_diplome || null
      });
  
      const createdInfoBank = await InfoBank.create(infoBank);
      const createdInfoComplementaire = await InfoComplementaire.create(infoComplementaire);
  
      // Créer le dossier avec les références aux informations créées
      const dossier = await Dossier.create({
        matricule,
        id_infoi: createdInfoIdent.id_infoi,
        id_infop: createdInfoPro.id_infop,
        id_infob: createdInfoBank.id_infob,
        id_infoc: createdInfoComplementaire.id_infoc,
        id_details_mutation: createdDetailsMutation ? createdDetailsMutation.id_detail : null,
        // Vous pouvez définir d'autres valeurs par défaut pour le dossier si nécessaire
      });
  
      // Émettre une notification via Socket.io
      const notification = {
        message: `Dossier créé pour l'agent : ${matricule}`,
        user_id: matricule,
      };
      getIo().emit('receiveNotification', notification);
  
      res.status(201).json(dossier);
    } catch (err) {
      console.error('Error creating dossier', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  


  // Route to mark a notification as read

  const markNotificationAsRead = async (notificationId) => {
    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.is_read = true;
      await notification.save();
      return notification;
    } catch (error) {
      throw error;
    }
  };



  // Route pour marquer une notification comme lue
  router.patch('/notifications/:id/read', async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const updatedNotification = await markNotificationAsRead(notificationId);
      res.status(200).json(updatedNotification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


  
  // Mettre à jour un dossier
  router.put('/dossiers/:id_dossier', async (req, res) => {
    const { id_dossier } = req.params;

    try {
        // Vérifier si le dossier existe
        const dossier = await Dossier.findByPk(id_dossier);
        if (!dossier) {
            return res.status(404).json({ error: 'Dossier not found' });
        }

        // Mettre à jour les informations identité, professionnelles, bancaires, et complémentaires si nécessaires
        if (req.body.infoIdent) {
            await InfoIdent.update(req.body.infoIdent, { where: { id_infoi: dossier.id_infoi } });
        }
        if (req.body.infoPro) {
            await InfoPro.update(req.body.infoPro, { where: { id_infop: dossier.id_infop } });
        }
        if (req.body.infoBank) {
            await InfoBank.update(req.body.infoBank, { where: { id_infob: dossier.id_infob } });
        }
        if (req.body.infoComplementaire) {
            await InfoComplementaire.update(req.body.infoComplementaire, { where: { id_infoc: dossier.id_infoc } });
        }

        // Gestion des ajouts pour les champs spécifiques
        const infoPro = await InfoPro.findByPk(dossier.id_infop);
        if (req.body.infoPro && req.body.infoPro.poste_anterieurs) {
            infoPro.poste_anterieurs = (req.body.infoPro.poste_anterieurs || '')+';' ;
            await infoPro.save();
        }
        if (req.body.infoPro && req.body.infoPro.diplome_anterieur) {
            infoPro.diplome_anterieur = (infoPro.diplome_anterieur || '') + ' '+ req.body.infoPro.diplome_anterieur;
            await infoPro.save();
        }
        if (req.body.infoComplementaire && req.body.infoComplementaire.distinction) {
            const infoComplementaire = await InfoComplementaire.findByPk(dossier.id_infoc);
            infoComplementaire.distinction = (req.body.infoComplementaire.distinction || '') + ";";
            await infoComplementaire.save();
        }

        // Mettre à jour le dossier lui-même
        const updatedDossier = await Dossier.update(req.body, {
            where: { id_dossier },
            returning: true // pour obtenir le dossier mis à jour
        });

        // Enregistrer une notification dans la base de données
        const notification = {
            message: `Dossier ${id_dossier} mis à jour.`,
            user_id: dossier.matricule,
        };

        // Émettre une notification via Socket.io
        getIo().emit('receiveNotification', notification);

        console.log(updatedDossier[1][0]);
        res.json(updatedDossier[1][0]); // renvoie le premier dossier mis à jour
    } catch (err) {
        console.error('Error updating dossier', err);
        res.status(500).json({ error: 'Internal server error' });
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



  // Supprimer un dossier
  router.delete('/dossiers/:id', async (req, res) => {
    try {
      const dossier = await Dossier.findByPk(req.params.id);
      /* const notification = await Notification.create({
        message: `Dossier ${dossier.id_dossier} supprimé :`,
        user_id: dossier.matricule,
      });
      
      // Émettre une notification via Socket.io
      getIo().emit('receiveNotification', notification); */
      if (dossier) {
        await dossier.destroy();

// Enregistrer une notification dans la base de données

        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Dossier not found' });
      }
    } catch (err) {
      console.error('Error deleting dossier', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
 // Lire un dossier par matricule
 router.get('/dossiers/user/:matricule', async (req, res) => {

  const { matricule} = req.params;
  try {
    const dossier = await Dossier.findOne({
       where: { 
      matricule:matricule }
      
    ,include:  [
        {
          model: Utilisateur,
          attributes: ['matricule','role']
        },
        {
          model: InfoIdent,
          attributes: [
            'cnss', 'nom', 'prenom', 'nom_du_conjoint', 'sexe', 'dat_nat', 'lieu_nat', 
            'situat_matri','email', 'dat_mariage', 'nbre_enfants'
          ]
        },
        {
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
                'id_detail', 'matricule','etat_depart', 'poste_actuel', 'service_actuel', 'nouveau_poste',
                'nouveau_service', 'date_prise_fonction', 'date_changement', 'motif_changement',
                'type_changement', 'besoins_formation'
              ]
            }
          ]

          
        },
        {
          model: InfoBank,
          attributes: [
            'rib', 'mtn', 'celtics', 'libercom'
          ]
        },
        {
          model: InfoComplementaire,
          attributes: [
            'observation_particuliere', 'distinction', 'ref_distinction', 'detail_distinction',
            'situat_sante', 'saction_punitive', 'nature_sanction'
          ]
        }
      ]
    });
    
    if (dossier) {
      res.json(dossier);
    } else {
      res.status(404).json({ error: 'Dossier not found' });
    }
  } catch (err) {
    console.error('Error fetching dossier', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/mutations/:matricule', async (req, res) => {
  try {
    const { matricule } = req.params;
    const {
      etat_depart,
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

    // Validation des champs requis
    const requiredFields = ['poste_actuel', 'service_actuel', 'nouveau_poste', 'nouveau_service', 'date_prise_fonction', 'date_changement'];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Le champ '${field}' est requis.` });
      }
    }

    // Vérification si une mutation existe déjà pour le matricule donné
    let existingMutation = await DetailsMutation.findOne({ where: { matricule } });

    if (existingMutation) {
      // Si la mutation existe, mettre à jour avec les nouvelles données
      existingMutation = await existingMutation.update({
        etat_depart,
        poste_actuel,
        service_actuel,
        nouveau_poste,
        nouveau_service,
        date_prise_fonction,
        date_changement,
        motif_changement,
        type_changement,
        besoins_formation
      });

      const notification = {
        message: `L'etat de l'agent  ${matricule} est passé à ${etat_depart}.`,
        user_id: existingMutation.matricule,
    };

    // Émettre une notification via Socket.io
     getIo().emit('receiveNotification', notification);

      // Renvoi de la réponse avec les données mises à jour
      res.status(200).json(existingMutation);
    } else {
      // Si la mutation n'existe pas, retourner une erreur ou créer une nouvelle mutation
      return res.status(404).json({ error: `Aucune mutation trouvée pour le matricule '${matricule}'.` });
    }
  } catch (error) {
    // Gestion des erreurs
    console.error('Erreur lors de la mise à jour de la mutation :', error.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la mutation : ' + error.message });
  }
});

  module.exports = router;