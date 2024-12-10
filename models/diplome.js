const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Diplome = sequelize.define('Diplome', {
  id_diplome: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_diplome: { type: DataTypes.STRING },
  date_obtention: { type: DataTypes.DATE },
  institution: { type: DataTypes.STRING },
  infop: { type: DataTypes.INTEGER}
}, {
  tableName: 'diplome',
  timestamps: false
});

// Associations


module.exports = Diplome;
