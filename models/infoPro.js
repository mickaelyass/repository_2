const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const DetailsMutation = require('./detailsMutation');

const InfoPro = sequelize.define('InfoPro', {
  id_infop: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  statut: {
    type: DataTypes.STRING(50)
  },
  corps: {
    type: DataTypes.STRING(50)
  },
  categorie: {
    type: DataTypes.STRING(50)
  },
  branche_du_personnel: {
    type: DataTypes.STRING(50)
  },
  fonctions: {
    type: DataTypes.STRING(100)
  },
  ref_nomination: {
    type: DataTypes.STRING(50)
  },
  dat_prise_fonction: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responsabilite_partiuliere: {
    type: DataTypes.STRING(100)
  },
  grade_paye: {
    type: DataTypes.STRING(50)
  },
  indice_paye: {
    type: DataTypes.INTEGER
  },
  dat_first_prise_de_service: {
    type: DataTypes.DATE,
    allowNull:true
  },
  dat_de_depart_retraite: {
    type: DataTypes.DATE,
    allowNull:true
  },
  dat_de_prise_service_dans_departement: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ref_acte_de_prise_service_poste_actuel: {
    type: DataTypes.STRING(100)
  },
  poste_actuel_service: {
    type: DataTypes.STRING(100)
  },
  type_structure: {
    type: DataTypes.STRING(50)
  },
  zone_sanitaire: {
    type: DataTypes.STRING(50)
  },
  poste_specifique: {
    type: DataTypes.STRING(100)
  },
  etat_depart: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DetailsMutation,
      key: 'id_detail'
    }
  },
  poste_anterieurs: {
    type: DataTypes.STRING(400)
  },
  autres_diplome: {
    type: DataTypes.STRING(400)
  }
}, {
  tableName: 'info_pro',
  timestamps: false
});

InfoPro.belongsTo(DetailsMutation, { foreignKey: 'etat_depart', targetKey: 'id_detail' });


module.exports = InfoPro;
