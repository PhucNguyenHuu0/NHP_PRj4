const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  nhp_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nhp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'nhp_Categories',
  timestamps: true,
  createdAt: 'nhp_createdAt',
  updatedAt: 'nhp_updatedAt',
});

module.exports = Category;