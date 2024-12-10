const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Utilisateur = sequelize.define('Utilisateur', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'utilisateur',
  timestamps: false
});

module.exports = Utilisateur;
