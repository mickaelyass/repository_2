const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./utilisateur'); // Assurez-vous que le chemin est correct

const DetailsMutation = sequelize.define('DetailsMutation', {
  id_detail: {
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
  etat_depart: {
    type: DataTypes.STRING(100),
    defaultValue:'Actif'
  },
  poste_actuel: {
    type: DataTypes.STRING(100),
    defaultValue:''
  },
  service_actuel: {
    type: DataTypes.STRING(100),
    defaultValue:''
  },
  nouveau_poste: {
    type: DataTypes.STRING(100),
    defaultValue:''
  },
  nouveau_service: {
    type: DataTypes.STRING(100),
    defaultValue:''
  },
  date_prise_fonction: {
    type: DataTypes.DATE,
    defaultValue:null
  },
  date_changement: {
    type: DataTypes.DATE,
    defaultValue:null
  },
  motif_changement: {
    type: DataTypes.STRING(255),
    defaultValue:''
  },
  type_changement: {
    type: DataTypes.STRING(50),
    defaultValue:''
  },
  besoins_formation: {
    type: DataTypes.STRING(255),
    defaultValue:''
  }
}, {
  tableName: 'details',
  timestamps: false
});

Utilisateur.hasMany(DetailsMutation, { foreignKey: 'matricule' });
DetailsMutation.belongsTo(Utilisateur, { foreignKey: 'matricule' });

module.exports = DetailsMutation;
