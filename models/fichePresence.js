const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const FichePresence = sequelize.define("FichePresence", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: { tableName: 'dossier' } ,  // Associe au dossier de l’agent
      key: "matricule",
    },
  },
  date_presence: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  heure_arrivee: {
    type: DataTypes.TIME,
    allowNull: true, // Peut être null si l’agent est absent
  },
  heure_depart: {
    type: DataTypes.TIME,
    allowNull: true, // Peut être null si l’agent est absent ou en congé
  },
  statut: {
    type: DataTypes.ENUM("Présent", "Absent", "Retard", "Permission", "Congé", "Maladie"),
    allowNull: false,
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
},
{
    tableName: 'fichepresence',
    timestamps: false
  });

module.exports = FichePresence;
