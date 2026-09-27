const app = require('./app');
const config = require('./config/config');
const { sequelize, testConnection } = require('./config/db');
require('./models'); // registers associations
const startDueRecordsJob = require('./jobs/dueRecordsJob');

const start = async () => {
  await testConnection();

  // sync() creates tables from the models if they don't exist yet.
  // In production, prefer running schema.sql / migrations explicitly
  // instead of relying on sync — kept here for local dev convenience.
  if (config.nodeEnv === 'development') {
    await sequelize.sync({ alter: false });
    console.log('📦 Models synced.');
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    startDueRecordsJob();
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
