const { InfoIdent,
    Dossier,
    InfoPro,
  Evaluation,}=require('../models/association.js');
  
  const { Op ,Sequelize} = require('sequelize');
  const { getIo } = require('../utils/socket');
  const sequelize=require('../db.js');
  

exports.createEvaluation = async (req, res) => {
  try {
    const {
      nomPrenom,
      dateLieuNaissance,
      telephone,
      email,
      situationFamiliale,
      situationMilitaire,
      echelle,
      echelon,
      periodeDebut,
      periodeFin,
      contratInitial,
      contratRenouvele,
      cdi,adresse,diplome,
      avenants,
      matricule,
      cnss,
      datePriseService,
      gradeActuel,
      categorie,
      emploi,
      objectifs,
      resultats,
      contraintes,
      superiorNotes,
      committeeNotes,
    } = req.body;

    // Vérification des champs obligatoires
    if (!nomPrenom || !dateLieuNaissance || !telephone || !email || !matricule || !datePriseService || !gradeActuel || !categorie || !emploi) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    // Création de l'évaluation
    const evaluation = await Evaluation.create({
      nom_prenom: nomPrenom, // Correction de nom_prenon → nom_prenom
      date_lieu_naissance: dateLieuNaissance, // Correction de date_lieu_naisance → date_lieu_naissance
      telephone,
      email,
      situation_familiale: situationFamiliale,
      situation_militaire:situationMilitaire, // Correction de situationFamiliale → situation_familiale
      matricule,
      cnss,
      date_prise_service: datePriseService, // Correction de datePriseService → date_prise_service
      grade_actuel: gradeActuel,
      categorie,
      contrat_initial:contratInitial,
      contrat_renouvele:contratRenouvele,
      cdi,
      adresse,
      diplome,
      avenants:avenants,
      periode_debut:periodeDebut,
      periode_fin:periodeFin,
      echelon,
      echelle,
      emploi,
      objectifs,
      resultats,
      contraintes,
      superior_notes: superiorNotes, // Correction de superiorNotes → superior_notes
      committee_notes: committeeNotes, // Correction de committeeNotes → committee_notes
    });
  console.log(evaluation);
    return res.status(201).json({
      message: "Évaluation créée avec succès.",
      evaluation,
    });

  } catch (error) {
    console.error("Erreur lors de la création de l'évaluation :", error);
    return res.status(500).json({ message: "Erreur interne du serveur.", error });
  }
};

exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll();

    res.status(200).json(evaluations);;
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations :", error);
    throw new Error("Impossible de récupérer les évaluations");
  }
};

exports.findEvaluationId= async (req, res) => {
  const { id } = req.params;
  
  try {
    // Recherche de la demande de congé par son ID, incluant les pièces jointes
    const evaluation = await Evaluation.findByPk(id);

    if (!evaluation) {
      return res.status(404).json({ error: 'enaluation non trouvé' });
    }

    // Réponse avec les détails de la demande de congé et des pièces jointes
    res.status(200).json(evaluation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la fiche:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la fiche .' });
  }
}

exports.updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nomPrenom,
      dateLieuNaissance,
      telephone,
      email,
      situationFamiliale,
      situationMilitaire,
      echelle,
      echelon,
      periodeDebut,
      periodeFin,
      contratInitial,
      contratRenouvele,
      cdi,adresse,diplome,
      avenants,
      matricule,
      cnss,
      datePriseService,
      gradeActuel,
      categorie,
      emploi,
      objectifs,
      resultats,
      contraintes,
      superiorNotes,
      committeeNotes,
    } = req.body;

    // Vérifier si l'évaluation existe
    const evaluation = await Evaluation.findByPk(id);


    if (!evaluation) {
      return res.status(404).json({ message: "Évaluation non trouvée." });
    }

    // Mise à jour des champs
    await evaluation.update({
      nom_prenom: nomPrenom, // Correction de nom_prenon → nom_prenom
      date_lieu_naissance: dateLieuNaissance, // Correction de date_lieu_naisance → date_lieu_naissance
      telephone,
      email,
      situation_familiale: situationFamiliale,
      situation_millitaire:situationMilitaire, // Correction de situationFamiliale → situation_familiale
      matricule,
      cnss,
      date_prise_service: datePriseService, // Correction de datePriseService → date_prise_service
      grade_actuel: gradeActuel,
      categorie,
      contrat_initial:contratInitial,
      contrat_renouvele:contratRenouvele,
      cdi,
      adresse,
      diplome,
      avenants:avenants,
      periode_debut:periodeDebut,
      periode_fin:periodeFin,
      echelon,
      echelle,
      emploi,
      objectifs,
      resultats,
      contraintes,
      superior_notes: superiorNotes, // Correction de superiorNotes → superior_notes
      committee_notes: committeeNotes, // Correction de committeeNotes → committee_notes
    });

    return res.status(200).json({
      message: "Évaluation mise à jour avec succès.",
      evaluation,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évaluation :", error);
    return res.status(500).json({ message: "Erreur interne du serveur.", error });
  }
};



exports.getAllEvaluationService = async (req, res) => {
  const { service } = req.params;
  
  try {

    const dossiers = await Dossier.findAll({
      include: [
        {
          model: InfoPro,
         
          where: {
            poste_actuel_service: service,
          }
        }

      ],
    });
    
    
    
    const matricules = dossiers.map(dossier => dossier.matricule);
    console.log("dossier",matricules);
    
   
    const evaluations = await Evaluation.findAll({
      where: {
        matricule: {
          [Op.in]: matricules
        }      
      }
    }); 
    
   
    console.log(evaluations);
    res.status(200).json(evaluations);;
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations :", error);
    throw new Error("Impossible de récupérer les évaluations");
  }
};



