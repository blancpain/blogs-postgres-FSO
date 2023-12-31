const { DataTypes } = require("sequelize");

const { sequelize } = require("../utils/db");

const Blog = sequelize.define(
  "blog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1991,
        max: new Date().getFullYear(),
      },
    },
  },
  {
    underscored: true,
  }
);

module.exports = Blog;
