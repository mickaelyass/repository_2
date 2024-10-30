const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateur'); // Assurez-vous que le chemin est correct
const { hashPassword, comparePassword,verifyToken, generateToken,authenticate } = require('../utils/auth'); // Importez vos fonctions utilitaires
const { getIo } = require('../utils/socket');
const Notification = require('../models/notification');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const SECRET_KEY = 'DAMSO';


// Lire tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await Utilisateur.findAll();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enregistrement d'un utilisateur
router.post('/users/register', async (req, res) => {
  const { matricule, password, role } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const user = await Utilisateur.create({ matricule, password: hashedPassword, role });

    const notification = {
      message: `Nouveau agent enregistrer : ${matricule}`,
      user_id: matricule,
    };

    // Émettre une notification via Socket.io
    getIo().emit('receiveNotification', notification);

    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connexion d'un utilisateur
router.post('/users/login', async (req, res) => {
  const { matricule, password } = req.body;
  try {
    const user = await Utilisateur.findOne({ where: { matricule } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = generateToken(user);

    res.json({ token, role: user.role, id_user: user.id_user ,matricule:user.matricule});
  } catch (err) {
    console.error('Error logging in', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Lire un utilisateur par ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mettre à jour un utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (user) {
      const { password, role } = req.body;
      const hashedPassword = password ? await hashPassword(password) : user.password;
      await user.update({ password: hashedPassword, role });
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error deleting user', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Request Password Reset
// Assuming Sequelize models are defined
// Request Password Reset
router.post('/users/request-reset', async (req, res) => {
  const { email, matricule } = req.body;

  try {
    const user = await Utilisateur.findOne({ where: { matricule } });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable avec cet e-mail et matricule' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user.id_user, matricule },  SECRET_KEY , { expiresIn: '1h' });

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yassegoungbeseton@gmail.com', // Votre email
        pass: 'hher oiai suyf rqni', // Mot de passe d'application
      },
    });

    // Create reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      to: email,
      from: 'yourapp@domain.com', 
      subject: 'Demande de réinitialisation de mot de passe',
      html: `
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>Cliquez sur ce <a href="${resetLink}">lien</a> pour créer un nouveau mot de passe.</p>
        <p>Ce lien expire dans une heure.</p>
      `,
    });

    res.status(200).json({ message: 'E-mail de réinitialisation envoyé avec succès' });
  } catch (err) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Reset Password
router.post('/users/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const resetToken = req.params.token;
   
 
  try {  
    if (!resetToken) {
      return res.status(400).json({ error: 'Token is required' });
    }
    console.log('Reset Token:', resetToken);
    const decoded = verifyToken(resetToken); // Vérifier le token
    console.log('Decoded:', decoded);

    const matricule = decoded.matricule; // Récupérer le matricule décodé

    const user = await Utilisateur.findOne({ where: { matricule } }); // Trouver l'utilisateur par ID
   console.log(user);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du mot de passe', err);
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Token invalide ou mal formé' });
    }
    return res.status(400).json({ error: 'Token invalide ou expiré' });
  }
});

module.exports = router;
