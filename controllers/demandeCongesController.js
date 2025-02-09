const { Op } = require('sequelize');
const path = require('path');
const { getIo } = require('../utils/socket');
const { Resend } = require('resend');

const resend = new Resend('re_cQUpPLTK_4bXFnAcZsofhS3ns1ofhXCJg');

const { InfoIdent,
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
  DemandeConges,}=require('../models/association');

  exports.createDemandeConge = async (req, res) => {
    console.log(req.body);
    console.log(req.files);
 try {
    console.log(req.body);
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
      const newPieceJointe = await PieceJointe.create(pieceJointeData);

        

 // Créer la demande de congés
    const { matricule,type_conge, date_debut, annee_jouissance,nombre_de_jour,date_de_fin, raison } = req.body;
    const newDemande = await DemandeConges.create({
      matricule:matricule  ,  
      type_de_conge:type_conge,                                   
      date_debut:date_debut,
      annee_jouissance:annee_jouissance,
      nombre_de_jour:nombre_de_jour,
      date_de_fin:date_de_fin,
      raison:raison,
      piece_jointe: newPieceJointe.id_piece
    });


     // Récupérer le dossier de l'agent par matricule
    const dossierAgent = await Dossier.findOne({
   
    include: [{
      model: InfoIdent,
    },
    {
      model: InfoPro,
     
    }
    ,
    {
      model: Utilisateur,
     // Assurez-vous que cette colonne existe
    },] ,
    where: { matricule: matricule },
  });



  if (!dossierAgent) {
    return res.status(404).json({ error: 'Dossier non trouvé' });
  }


console.log(dossierAgent);

const posteActuelService = dossierAgent.InfoPro?.poste_actuel_service;

console.log(posteActuelService);
  
      if (!posteActuelService) {
        return res.status(400).json({ error: 'Le poste actuel du service est introuvable.' });
      }
     
      const infoPro = dossierAgent.InfoPro;

      if (!infoPro) {
        return res.status(400).json({ error: "Informations professionnelles introuvables." });
      }
  
      const joursDisponibles = infoPro.nombre_jour_conges_disponible;
  
      if (joursDisponibles < nombre_de_jour) {
        return res.status(400).json({ error: "Nombre de jours de congés insuffisant." });
      }
      if( joursDisponibles > nombre_de_jour && type_conge =="Congé administratif")
      {
      const joursRestants = joursDisponibles - nombre_de_jour;
      await infoPro.update({ nombre_jour_conges_disponible: joursRestants });
  
      console.log(`Jours restants après congés: ${joursRestants}`);
      }
     
  
     const dossierChef = await Dossier.findAll({
      
      include: [   {
        model: InfoPro,
        attributes: ['poste_actuel_service'], // Fetch only the `poste_actuel_service` attribute
        where: { poste_actuel_service: posteActuelService },
        required: true,
      },
      {
        model: InfoIdent,
      },
      {
        model: Utilisateur,
       // Fetch only the `id_user` and `role` attributes
        where: { role: 'chef_service' },
        required: true,
      },]
    });
    console.log(dossierChef);



  


    const notification = await Notifications.create({
      message: `Nouveau demande de congé faire par l'agent : ${matricule}`,
      id_user: dossierAgent.Utilisateur.id_user,
    });
    
    console.log('notification',notification);

  const chefEmail='yassegoungbeseton@gmail.com';

  const agentEmail = dossierAgent.InfoIdent.email;

   
    // Émettre une notification via Socket.io
    getIo().emit('receiveNotification', notification); 
 
    
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: chefEmail,
      subject: 'Nouvelle demande de congé',
      text: `Une nouvelle demande de congé a été créée par un subordonné. 
           Matricule: ${matricule}, Date de début: ${date_debut}, Année de jouissance: ${annee_jouissance}.`
    });
  // Envoyer un email au chef de service
  console.log("mail envoyé");

    res.status(201).json(newDemande);
    }
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création de la demande de congés.' });
  }

  }

  exports.listesDemandeConge=async (req, res) => {
    try {
      const demandes = await DemandeConges.findAll({
        include: {
          model: PieceJointe,
          as: 'piecesJointes',
      
        }
      });
  
      res.status(200).json(demandes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des demandes de congés. Détails :', details: error.message });
    }}

exports.listesCongeParServices= async (req, res) => {
    const { service } = req.params;
  
    try {
      // Récupérer les matricules des agents dans le service donné
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
            where: {
              poste_actuel_service: service,
            }
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
  
     
  
      const matricules = dossiers.map(dossier => dossier.matricule);
      console.log("dossier",matricules);
     
      // Récupérer les demandes de congés pour ces matricules
      const demandes = await DemandeConges.findAll({
        where: {
          matricule: {
            [Op.in]: matricules
          },
          decision_chef_service:'En attente'
          
        },
        include: [{
          model: PieceJointe,
          as: 'piecesJointes',
           // Pour inclure les pièces jointes
        }]
      }); 
  
      console.log(demandes);
      res.status(200).json(demandes);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de congés par service:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des demandes de congés', error });
    }
  }

exports.findCongeId= async (req, res) => {
  const { id_cong } = req.params;
  
  try {
    // Recherche de la demande de congé par son ID, incluant les pièces jointes
    const demande = await DemandeConges.findByPk(id_cong, {
      include: {
        model: PieceJointe,
        as: 'piecesJointes',
    
      }
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
}

exports.findCongeMatricule=async (req, res) => {
   const { matricule } = req.params;
   try {
     const demande = await DemandeConges.findOne({
       where: { matricule },
       include: {
        model: PieceJointe,
        as: 'piecesJointes',
    
      }
     });

     if (!demande) {
     return res.status(404).json({ error: 'Demande non trouvée' });
     }

     res.status(200).json(demande);
   } catch (error) {
     console.error(error);
     res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de la demande de congés.' });
  }
 }

exports.decisionChef=async (req, res) => {
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
    
    if(decision_chef_service=='Rejetée'){
      demande.status='Rejetée';
    } 
   

    await demande.save();
    const mat= demande.matricule

      const dossier = await Dossier.findOne({
    where: { matricule: mat },
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
   const agentEmail = dossier.InfoIdent.email;
  const user=dossier.Utilisateur.id_user


   const notification = await Notifications.create({
    message: `La demande de congé de l'agent ${demande.matricule} est ${demande.decision_chef_service}`,
    id_user: user,
  }); 

    // Émettre une notification via Socket.io
    getIo().emit('receiveNotification', notification); 

  // Envoyer un email au chef de service
  resend.emails.send({
    from: 'onboarding@resend.dev',
    to: agentEmail,
    subject: 'Décision chef service pour la demande  de congé',
    text: `La demande de congé de l'agent ${demande.matricule} est ${demande.decision_chef_service}`
  });

    res.status(200).json(demande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de la décision du chef de service.' });
  }
}
exports.decisionDirectrice= async (req, res) => {
    const { id } = req.params;
    const { decision_directrice } = req.body;
  
    try {
      const demande = await DemandeConges.findByPk(id);
  
      if (!demande) {
        return res.status(404).json({ error: 'Demande non trouvée' });
      }
  
      demande.decision_directrice = decision_directrice;
      if(decision_directrice=='Validé'){
        demande.status='Autorisée';
      } 
      if(decision_directrice=='Invalidé'){
        demande.status='Rejetée';
      } 
      
      await demande.save();
      const mat=demande.matricule;
  
      const dossier = await Dossier.findOne({
        where: { matricule: mat },
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
  
       const agentEmail = dossier.InfoIdent.email;
  
      const user=dossier.Utilisateur.id_user
  
       const notification = await Notifications.create({
        message: `La demande de congé de l'agent ${mat} est ${demande.decision_directrice}`,
        id_user: user,
      }); 
  
      // Émettre une notification via Socket.io
      getIo().emit('receiveNotification', notification);
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: agentEmail,
        subject: 'Décision chef service pour la demande  de congé',
        text: `La demande de congé de l'agent ${mat} est ${demande.decision_directrice}`
      });
    
  
      res.status(200).json(demande);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de la décision de la directrice.' });
    }
  }

exports.listescongeParStatus=async (req, res) => {
  const { status } = req.params;

  try {
    const demandes = await DemandeConges.findAll({
      where: { decision_chef_service:status
},
        include: {
          model: PieceJointe,
          as: 'piecesJointes',

         }
    });

    res.status(200).json(demandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des demandes de congés.' });
  }
}
exports.listescongeParStatusAutoriser = async (req, res) => {
  const status = "Autorisée";
  try {
    // 1. Récupérer les demandes de congé avec status "Autorisée"
    const demandes = await DemandeConges.findAll({
      where: { status },
      attributes: ["id_cong", "matricule", "type_de_conge", "date_debut", "date_de_fin", "raison", "status"], // On récupère les champs nécessaires de la demande de congé
    });

    // 2. Récupérer les informations des utilisateurs (Dossier et InfoIdent)
    const dossiers = await Dossier.findAll({
      include: [
        {
          model: InfoIdent,
          attributes: ["nom", "prenom"], // Récupérer nom et prénom
        },
      ],
      attributes: ["matricule"], // On récupère le matricule pour associer aux demandes
    });

    // 3. Combiner les informations des demandes de congé et des dossiers par matricule
    const result = demandes.map(demande => {
      const dossier = dossiers.find(d => d.matricule === demande.matricule); // Trouver le dossier correspondant à la demande de congé
      if (dossier && dossier.InfoIdent) {
        return {
          ...demande.dataValues, // Inclure toutes les données de la demande de congé
          nom: dossier.InfoIdent.nom, // Ajouter le nom de l'agent
          prenom: dossier.InfoIdent.prenom, // Ajouter les prénoms de l'agent
        };
      }
      return demande;
    });

    // 4. Retourner les données combinées
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération des demandes de congés.",
    });
  }
};



exports.deleteConge=async (req, res) => {
    const { id } = req.params;
  
    try {
      const demande = await DemandeConges.findByPk(id);
  
      if (!demande) {
        return res.status(404).json({ error: 'Demande non trouvée' });
      }
  
      await demande.destroy();
      const notification = {
        message: `Le demande de l'agent  ${demande.matricule} est  supprimer.`,
    };

    // Émettre une notification via Socket.io
     getIo().emit('receiveNotification', notification);
      res.status(200).json({ message: 'Demande supprimée avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de la demande de congés.' });
    }
  }