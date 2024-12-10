// models/Piece_jointe.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PieceJointe = sequelize.define('Piece_jointe', {
  id_piece: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  url_certificat_non_jouissance: {
    type: DataTypes.TEXT
  },
  url_derniere_autorisation_conges: {
    type: DataTypes.TEXT
  },
  demande_conge: { // Clé étrangère pour relier à DemandeConges
    type: DataTypes.INTEGER
}}, {
  tableName: 'piece_jointe',
  timestamps: false
});

module.exports = PieceJointe;
