require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;

const server = process.env.DB_HOST;
const dialect = 'postgres';
const logging = false;

const Sequelize = require('sequelize');

const db = new Sequelize(database, username, password, {
  host: server,
  dialect,
  define: { timestamps: false },
  logging,
});

module.exports = db;
