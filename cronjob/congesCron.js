const cron = require('node-cron');
const sequelize = require('../db'); // Importez votre instance Sequelize
const InfoPro = require('../models/infoPro'); // Importez le modèle InfoPro

// Fonction pour ajouter 2 jours de congés
const incrementerJoursConges = async () => {
  try {
    await InfoPro.update(
      { nombre_jour_conges_disponible: sequelize.literal('nombre_jour_conges_disponible + 2') },
      { where: {} } // Appliquer à tous les enregistrements
    );
    console.log('Les jours de congés ont été mis à jour.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des jours de congés :', error);
  }
};

// Programmation de la tâche cron (1er jour du mois à minuit)
const planifierCronConges = () => {
  cron.schedule('0 0 1 * *', incrementerJoursConges);
  console.log('Tâche Cron pour les congés programmée.');
};

// Exporter la fonction pour l’exécuter dans le serveur principal
module.exports = { planifierCronConges };