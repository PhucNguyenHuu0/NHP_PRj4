const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  nhp_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nhp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nhp_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nhp_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nhp_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'nhp_Customers',
  timestamps: true,
  createdAt: 'nhp_createdAt',
  updatedAt: 'nhp_updatedAt',
});

module.exports = Customer;