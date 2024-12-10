const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notification = sequelize.define('Notification', {
  id_notif: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,

  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  create_dat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
    tableName: 'notifications',
  timestamps: false
});

module.exports = Notification;
