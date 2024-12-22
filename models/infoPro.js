const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Details = require('./detailsMutation');
const Diplome = require('./diplome');
const PosteAnterieur = require('./posteAnterieur');

const InfoPro = sequelize.define('InfoPro', {
  id_infop: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  statut: { type: DataTypes.STRING },
  corps: { type: DataTypes.STRING },
  categorie: { type: DataTypes.STRING },
  branche_du_personnel: { type: DataTypes.STRING },
  fonctions: { type: DataTypes.STRING },
  dat_prise_fonction: { type: DataTypes.DATE },
  responsabilite_partiuliere: { type: DataTypes.STRING },
  grade_paye: { type: DataTypes.STRING },
  indice_paye: { type: DataTypes.INTEGER },
  dat_first_prise_de_service: { type: DataTypes.DATE },
  dat_de_depart_retraite: { type: DataTypes.DATE },
  dat_de_prise_service_dans_departement: { type: DataTypes.DATE },
  ref_acte_de_prise_service_poste_actuel: { type: DataTypes.STRING },
  poste_actuel_service: { type: DataTypes.STRING },
  type_structure: { type: DataTypes.STRING },
  ref_nomination: { type: DataTypes.STRING },
  zone_sanitaire: { type: DataTypes.STRING },
  poste_specifique: { type: DataTypes.STRING },
},
  {   tableName: 'info_pro',
  timestamps: false  
  
});

// Associations


module.exports = InfoPro;
