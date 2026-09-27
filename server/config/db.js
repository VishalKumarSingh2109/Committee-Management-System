const { Sequelize } = require('sequelize');
const config = require('./config');

// Pool is kept small/conservative on purpose — most affordable managed MySQL
// tiers (Railway, Render, small VPS) cap total connections low. Raise `max`
// only if your DB plan comfortably supports more concurrent connections.
const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,   // snake_case columns (matches our SQL schema)
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
