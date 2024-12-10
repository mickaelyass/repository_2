const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Dossier = require('./dossier');

const InfoIdent = sequelize.define('InfoIdent', {
  id_infoi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cnss: { type: DataTypes.STRING },
  nom: { type: DataTypes.STRING },
  prenom: { type: DataTypes.STRING },
  dat_nat: { type: DataTypes.DATE },
  lieu_nat: { type: DataTypes.STRING },
  situat_matri: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  sexe: { type: DataTypes.STRING(1), allowNull: false, validate: { isIn: [['F', 'M']] } },
  nom_du_conjoint: { type: DataTypes.STRING ,allowNull: true},
  dat_mariage: { type: DataTypes.DATE,allowNull: true },
  nbre_enfants: { type: DataTypes.INTEGER }
}, {
  tableName: 'info_ident',
  timestamps: false
});

// Associations

module.exports = InfoIdent;
