const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product_category extends Model {

  }

  Product_category.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },

    },
    {
      sequelize,
      modelName: 'product_category',
      timestamps: true,
      updatedAt: false,
      createdAt: 'created_at',
    });
  return Product_category;
}