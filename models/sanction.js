const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const InfoComplementaire = require('./infoComplementaire');

const Sanction = sequelize.define('Sanction', {
  id_sanction: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sanction_punitive: { type: DataTypes.STRING },
  nature_sanction: { type: DataTypes.STRING },
  infoc: {type: DataTypes.INTEGER}
}, {
  tableName: 'sanction',
  timestamps: false
});

// Associations


module.exports = Sanction;
