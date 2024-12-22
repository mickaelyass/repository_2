const { Sequelize } = require('sequelize');
require('dotenv').config();

// Assurez-vous que l'URL de connexion est correctement définie dans .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  // si Render utilise SSL, sinon retirer ces options
    }
  },
});

module.exports = sequelize;
