const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Distinction = require('./distinction');
const Sanction = require('./sanction');

const InfoComplementaire = sequelize.define('InfoComplementaire', {
  id_infoc: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  observation_particuliere: { type: DataTypes.TEXT },
  situat_sante: { type: DataTypes.STRING },
  sanction:{type:DataTypes.INTEGER,unique:true},
  distinction:{type:DataTypes.INTEGER,unique:true}

}, {
  tableName: 'info_complementaire',
  timestamps: false
});

// Associations


module.exports = InfoComplementaire;
