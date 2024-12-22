const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const InfoComplementaire = sequelize.define('InfoComplementaire', {
  id_infoc: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  observation_particuliere: { type: DataTypes.TEXT },
  situat_sante: { type: DataTypes.STRING },
}, {
  tableName: 'info_complementaire',
  timestamps: false
});

// Associations


module.exports = InfoComplementaire;
