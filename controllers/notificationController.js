const { InfoIdent,
    Dossier,
    Utilisateur,
    Notifications,}=require('../models/association.js');
  
  const { Op ,Sequelize} = require('sequelize');
  const { getIo } = require('../utils/socket');
  const sequelize=require('../db.js');
  


  exports.getAllNotification=async (req, res) => {
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
  }
  
  exports.getNotificationByMatricule=async (req, res) => {
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
  }

  exports.updateNotificationRead=async (req, res) => {
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
  }




