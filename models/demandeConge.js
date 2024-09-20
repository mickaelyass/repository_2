// models/DemandeConges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./utilisateur');
const Piece_jointe = require('./piece_jointe');

const DemandeConges = sequelize.define('DemandeConges', {
  id_cong: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matricule: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: Utilisateur,
      key: 'matricule'
    }
  },
  date_debut: {
    type: DataTypes.DATE
  },
  annee_jouissance: {
    type: DataTypes.INTEGER
  },
  raison: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'En attente',
    validate: {
      isIn: [['En attente', 'Autorisée', 'Rejetée']] // Validation des valeurs possibles
    }
  },
  decision_chef_service: {
    type: DataTypes.STRING(50),
    defaultValue: 'En attente',
    validate: {
      isIn: [['En attente', 'Autorisée', 'Rejetée']] // Validation des valeurs possibles
    }
  },
  decision_directrice: {
    type: DataTypes.STRING(50),
    defaultValue: 'En attente',
    validate: {
      isIn: [['Validé', 'Invalidé', 'En attente']]
    }
  }

  , piece_jointe: {
    type: DataTypes.INTEGER,
    references: {
      model: Piece_jointe,
      key: 'id_piece'
    }
  }
}, {
  tableName: 'demande_conges',
  timestamps: false
});

Utilisateur.hasMany(DemandeConges, { foreignKey: 'matricule' });
DemandeConges.belongsTo(Utilisateur, { foreignKey: 'matricule' });

DemandeConges.belongsTo(Piece_jointe, { foreignKey: 'piece_jointe', targetKey: 'id_piece' });

module.exports = DemandeConges;
