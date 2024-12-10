const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const InfoComplementaire = require('./infoComplementaire');

const Distinction = sequelize.define('Distinction', {
  id_distinction: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ref_distinction: { type: DataTypes.STRING },
  detail_distinction: { type: DataTypes.TEXT },
  infoc: { type: DataTypes.INTEGER}

}, {
  tableName: 'distinction',
  timestamps: false
});

// Associations

module.exports = Distinction;
