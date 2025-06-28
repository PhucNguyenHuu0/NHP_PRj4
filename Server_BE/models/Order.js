const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  nhp_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nhp_customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'nhp_Customers',
      key: 'nhp_id',
    },
  },
  nhp_productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'nhp_Products',
      key: 'nhp_id',
    },
  },
  nhp_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nhp_totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  nhp_status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
}, {
  tableName: 'nhp_Orders',
  timestamps: true,
  createdAt: 'nhp_createdAt',
  updatedAt: 'nhp_updatedAt',
});

module.exports = Order;