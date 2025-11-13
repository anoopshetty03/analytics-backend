const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 15,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      statement_timeout: 60000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

async function connectWithRetry(attempts = 0) {
  const maxAttempts = 8;
  const delayMs = Math.min(30000, 500 * Math.pow(2, attempts));
  try {
    await sequelize.authenticate();
    console.log('DB connected.');
  } catch (err) {
    console.error(`DB connect attempt ${attempts + 1} failed:`, err && err.message ? err.message : err);
    if (attempts < maxAttempts) {
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
      return connectWithRetry(attempts + 1);
    }
    throw err;
  }
}

module.exports = { sequelize, Sequelize, connectWithRetry };
