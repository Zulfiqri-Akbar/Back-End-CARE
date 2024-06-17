const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("CARE", "root", "12345", {
  host: "34.128.75.50",
  dialect: "mysql",
});

module.exports = sequelize;
