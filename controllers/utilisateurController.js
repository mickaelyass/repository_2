const { Utilisateur, Notifications } = require('../models/association');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../utils/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const SECRET_KEY = 'DAMSO';

exports.register = async (req, res) => {
  const { matricule, password, role } = req.body;
  try {
    const existingUser = await Utilisateur.findOne({ where: { matricule } });
    if (existingUser) return res.status(409).json({ error: 'Matricule déjà utilisé' });

    const hashedPassword = await hashPassword(password);
    const user = await Utilisateur.create({ matricule, password: hashedPassword, role });

    res.status(201).json(user);
  } catch (err) {
    console.error('Error register:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  const { matricule, password } = req.body;
  try {
    const user = await Utilisateur.findOne({ where: { matricule } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = generateToken(user);
    res.json({ token, role: user.role, id_user: user.id_user, matricule: user.matricule });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await Utilisateur.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const { password, role } = req.body;
    const hashedPassword = password ? await hashPassword(password) : user.password;
    await user.update({ password: hashedPassword, role });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    await user.destroy();
    await Notifications.create({
      message: `L'utilisateur ${user.matricule} a été supprimé.`,
      id_user: user.id_user,
    });

    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    if (err.original?.code === '23503') {
      return res.status(400).json({ error: 'Utilisateur référencé ailleurs (congés, etc.)' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.requestReset = async (req, res) => {
  const { email, matricule } = req.body;
  try {
    const user = await Utilisateur.findOne({ where: { matricule } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const resetToken = jwt.sign({ id: user.id_user, matricule }, SECRET_KEY, { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yassegoungbeseton@gmail.com',
        pass: 'hher oiai suyf rqni',
      },
    });

    await transporter.sendMail({
      to: email,
      from: 'no-reply@tonapp.com',
      subject: 'Réinitialisation du mot de passe',
      html: `<p>Réinitialiser votre mot de passe via <a href="${resetLink}">ce lien</a></p>`,
    });

    res.json({ message: 'Lien envoyé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur d’envoi du lien' });
  }
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    const decoded = verifyToken(token);
    const user = await Utilisateur.findOne({ where: { matricule: decoded.matricule } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    user.password = await hashPassword(password);
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé' });
  } catch (err) {
    res.status(400).json({ error: 'Token invalide ou expiré' });
  }
};
