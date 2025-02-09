// models/DemandeConges.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./utilisateur');
const PieceJointe = require('./piece_jointe');

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
  type_de_conge: {
    type: DataTypes.STRING
  },
  date_debut: {
    type: DataTypes.DATE
  },
  annee_jouissance: {
    type: DataTypes.INTEGER
  },
  nombre_de_jour: {
    type: DataTypes.INTEGER
  },

  date_de_fin: {
    type: DataTypes.DATE
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
      model: PieceJointe,
      key: 'id_piece'
    }
  }
}, {
  tableName: 'demande_conges',
  timestamps: false
});



module.exports = DemandeConges;
