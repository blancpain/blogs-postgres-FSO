const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");

const Session = sequelize.define(
  "session",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    timestamps: false,
  }
);

module.exports = Session;
