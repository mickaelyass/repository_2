
const { FichePresence, Dossier,InfoIdent}=require('../models/association.js');
const { getIo } = require('../utils/socket');
const { Op } = require("sequelize");

// 📌 Récupérer toutes les fiches de présence
exports.getAllPresences = async (req, res) => {
  try {
    const presences = await FichePresence.findAll();
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
    const result = presences.map(presence => {
      const dossier = dossiers.find(d => d.matricule === presence.matricule); // Trouver le dossier correspondant à la demande de congé
      if (dossier && dossier.InfoIdent) {
        return {
          ...presence.dataValues, // Inclure toutes les données de la demande de congé
          nom: dossier.InfoIdent.nom, // Ajouter le nom de l'agent
          prenom: dossier.InfoIdent.prenom, // Ajouter les prénoms de l'agent
        };
      }
      return demande;
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des présences", error });
  }
};

// 📌 Récupérer les présences pour une date spécifique
exports.getPresencesByDate = async (req, res) => {
    const { date } = req.params;
  
    try {
      const presences = await FichePresence.findAll({
        where: {
          date_presence: { [Op.eq]: date },
        },
      });
  
      // Vérifiez si la liste des présences est vide
      if (presences.length === 0) {
        return res.status(404).json({ message: "Aucune présence enregistrée pour cette date" });
      }
  
      res.status(200).json(presences);
    } catch (error) {
      res.status(500).json({ message: "Erreur récupération présences", error });
    }
  };
  

// 📌 Ajouter une nouvelle présence ou mettre à jour (upsert)


exports.savePresence = async (req, res) => {
    const { fiches } = req.body; // tableau des fiches de présence
  
    // Vérifier si le tableau 'fiches' est présent et contient des données
    if (!fiches || !Array.isArray(fiches) || fiches.length === 0) {
      return res.status(400).json({ message: "Aucune fiche de présence à enregistrer" });
    }

    try {
      // Itérer sur chaque fiche de présence et effectuer l'opération de création ou de mise à jour
      const result = await Promise.all(
        fiches.map(async (fiche) => {
          const { matricule, statut, heure_arrivee, heure_depart, observations, date_presence } = fiche;
          
          // Assurer que les champs obligatoires sont présents
          if (!matricule || !date_presence) {
            throw new Error("Le matricule et la date sont requis pour chaque fiche de présence.");
          }

          // Chercher si une fiche existe déjà pour l'agent avec cette date
          const existingFiche = await FichePresence.findOne({
            where: { matricule, date_presence }
          });

          if (existingFiche) {
            // Si une fiche existe, effectuer une mise à jour (modification)
            existingFiche.statut = statut || existingFiche.statut;
            existingFiche.heure_arrivee = heure_arrivee || existingFiche.heure_arrivee;
            existingFiche.heure_depart = heure_depart || existingFiche.heure_depart;
            existingFiche.observations = observations || existingFiche.observations;

            await existingFiche.save(); // Enregistrer les changements de la fiche existante
            return { matricule, date_presence, message: "Fiche mise à jour", fiche: existingFiche };
          } else {
            // Si aucune fiche n'existe, créer une nouvelle fiche
            const newFiche = await FichePresence.create({
              matricule, 
              statut, 
              heure_arrivee, 
              heure_depart, 
              observations, 
              date_presence 
            });
            return { matricule, date_presence, message: "Fiche créée", fiche: newFiche };
          }
        })
      );
      
      const notification = {
        message: `La fiche de presence du  ${fiches[0].date_presence} est enregistrer.`,
        user_id: "Agent",
    };
     getIo().emit('receiveNotification', notification);
     console.log(notification.message);
    // Émettre une notification via Socket.io
   
      // Envoyer la réponse avec le résultat des fiches traitées
      res.status(200).json({
        message: "Fiches de présence traitées",
        result});
    } catch (error) {
      console.error("Erreur d'enregistrement :", error);
      res.status(500).json({ message: "Erreur d'enregistrement des présences", error: error.message });
    }
};
