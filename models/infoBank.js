const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Dossier = require('./dossier');

const InfoBank = sequelize.define('InfoBank', {
  id_infob: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rib: { type: DataTypes.STRING },
  mtn: { type: DataTypes.STRING },
  celtics: { type: DataTypes.STRING },
  moov: { type: DataTypes.STRING }
}, {
  tableName: 'info_bank',
  timestamps: false
});

// Associations


module.exports = InfoBank;
