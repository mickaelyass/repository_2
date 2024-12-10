const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Details = sequelize.define('Details', {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matricule: { type: DataTypes.INTEGER, allowNull: true},
  etat: { type: DataTypes.STRING },
  poste_actuel: { type: DataTypes.STRING },
  service_actuel: { type: DataTypes.STRING },
  nouveau_poste: { type: DataTypes.STRING },
  nouveau_service: { type: DataTypes.STRING },
  date_prise_fonction: { type: DataTypes.DATE },
  date_changement: { type: DataTypes.DATE },
  motif_changement: { type: DataTypes.STRING },
  type_changement: { type: DataTypes.STRING },
  besoins_formation: { type: DataTypes.STRING },
  infop: { type: DataTypes.INTEGER},
}, {
  tableName: 'details',
  timestamps: false
});

module.exports = Details;
