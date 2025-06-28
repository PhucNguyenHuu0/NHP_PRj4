const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  nhp_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nhp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nhp_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  nhp_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nhp_description: {
    type: DataTypes.TEXT,
  },
  nhp_categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'nhp_Categories',
      key: 'nhp_id',
    },
  },
}, {
  tableName: 'nhp_Products',
  timestamps: true,
  createdAt: 'nhp_createdAt',
  updatedAt: 'nhp_updatedAt',
});

module.exports = Product;