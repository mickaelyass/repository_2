const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Utilisateur = require('./utilisateur');
const PieceJointe = require('./piece_jointe');
const InfoIdent = require('./infoIdent');
const InfoPro = require('./infoPro');
const InfoBank = require('./infoBank');
const InfoComplementaire = require('./infoComplementaire');
const Distinction = require('./distinction');
const Sanction = require('./sanction');
const Details = require('./detailsMutation');
const Diplome = require('./diplome');
const PosteAnterieur = require('./posteAnterieur');
const Notifications = require('./notification');
const UserProfile = require('./userProfile');
const DemandeConges = require('./demandeConge');

const Dossier = sequelize.define('Dossier', {
  id_dossier: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matricule: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique:true,
    references: {
      model:{ tableName: 'utilisateur' } ,// Assurez-vous que ce modèle est bien défini
      key: 'matricule'
    }
  },
  infoi: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model:{ tableName: 'info_ident' } ,// Assurez-vous que ce modèle est bien défini
      key: 'id_infoi'
    }
  },
  infop: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: { tableName: 'info_pro' } , // Assurez-vous que ce modèle est bien défini
      key: 'id_infop'
    }
  },
  infob: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: { tableName: 'info_bank' } ,  // Assurez-vous que ce modèle est bien défini
      key: 'id_infob'
    }
  },
  infoc: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: { tableName: 'info_complementaire' } ,  // Assurez-vous que ce modèle est bien défini
      key: 'id_infoc'
    }
  }
}, {
  tableName: 'dossier',
  timestamps: false
});




DemandeConges.belongsTo(Utilisateur, { foreignKey: 'matricule', });

DemandeConges.hasOne(PieceJointe, {
   foreignKey: 'id_piece',sourceKey: 'piece_jointe',
   as: 'piecesJointes', // Alias pour les relations
   onDelete: 'CASCADE' });
   

   PieceJointe.belongsTo(DemandeConges, {
    foreignKey: 'id_piece',sourceKey: 'piece_jointe',
    as: 'demandeConge',
  });


Dossier.hasOne(InfoIdent, { foreignKey: 'id_infoi', sourceKey: 'infoi' });
InfoIdent.belongsTo(Dossier, { foreignKey: 'id_infoi',targetKey: 'infoi' });

Dossier.hasOne(InfoPro, { foreignKey: 'id_infop', sourceKey: 'infop' });
InfoPro.belongsTo(Dossier, { foreignKey: 'id_infop', targetKey: 'infop' });

Dossier.hasOne(InfoBank, { foreignKey: 'id_infob', sourceKey: 'infob' });
InfoBank.belongsTo(Dossier, { foreignKey: 'id_infob', targetKey: 'infob' });

Dossier.hasOne(InfoComplementaire, { foreignKey: 'id_infoc', sourceKey: 'infoc' });
InfoComplementaire.belongsTo(Dossier, { foreignKey: 'id_infoc', targetKey: 'infoc' });




// Relation entre InfoComplementaire et Distinction
InfoComplementaire.hasMany(Distinction, { foreignKey: 'infoc', sourceKey: 'id_infoc' });
Distinction.belongsTo(InfoComplementaire, { foreignKey: 'infoc', targetKey: 'id_infoc' });

// Relation entre InfoComplementaire et Sanction
InfoComplementaire.hasMany(Sanction, { foreignKey: 'infoc', sourceKey: 'id_infoc' });
Sanction.belongsTo(InfoComplementaire, { foreignKey: 'infoc', targetKey: 'id_infoc' });





InfoPro.hasMany(Diplome, { foreignKey: 'infop', sourceKey: 'id_infop' });
Diplome.belongsTo(InfoPro, { foreignKey: 'infop', targetKey: 'id_infop' });

InfoPro.hasMany(PosteAnterieur, { foreignKey: 'infop', sourceKey: 'id_infop' });
PosteAnterieur.belongsTo(InfoPro, { foreignKey: 'infop', targetKey: 'id_infop' });

InfoPro.hasMany(Details, { foreignKey: 'infop', sourceKey: 'id_infop' });
Details.belongsTo(InfoPro, { foreignKey: 'infop', targetKey: 'id_infop' });



Utilisateur.hasOne(Dossier, { foreignKey: 'matricule' ,sourceKey:'matricule'});
Dossier.belongsTo(Utilisateur, { foreignKey: 'matricule', targetKey: 'matricule' });




Utilisateur.hasMany(DemandeConges, { foreignKey: 'matricule' ,sourceKey: 'matricule'});
DemandeConges.belongsTo(Utilisateur, { foreignKey:'matricule', targetKey:'matricule' });





Utilisateur.hasOne(UserProfile, { foreignKey: 'matricule', sourceKey: 'matricule' });
UserProfile.belongsTo(Utilisateur, { foreignKey: 'matricule', targetKey: 'matricule' });


Utilisateur.hasMany(Notifications, { foreignKey: 'id_user' ,source: 'id_user'});
Notifications.belongsTo(Utilisateur,{foreignKey: 'id_user',targetKey: 'id_user'});




module.exports = {
    InfoIdent,
    Dossier,
    Utilisateur,
    UserProfile,
    Diplome,
    PosteAnterieur,
    Details,
    Sanction,
    Distinction,
    PieceJointe,
    Notifications,
    InfoComplementaire,
    InfoPro,
    InfoBank,
    DemandeConges,
    UserProfile

  };