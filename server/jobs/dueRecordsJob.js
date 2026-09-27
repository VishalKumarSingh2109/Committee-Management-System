const cron = require('node-cron');
const { ensureDuePaymentsForMonth } = require('../services/paymentService');

/**
 * Runs once a day (not just on the 1st) so this is resilient to the server
 * being down at midnight on the 1st, timezone edge cases, or a missed
 * restart — ensureDuePaymentsForMonth is idempotent (findOrCreate), so
 * running it daily costs nothing extra and guarantees every active member
 * always has a 'due' record for the current month without anyone needing
 * to open the admin panel first.
 */
const startDueRecordsJob = () => {
  // Runs at 00:05 server time, every day.
  cron.schedule('5 0 * * *', async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    try {
      const results = await ensureDuePaymentsForMonth(month, year);
      const createdCount = results.filter((r) => r.created).length;
      if (createdCount > 0) {
        console.log(`📅 Due-records job: created ${createdCount} new due record(s) for ${month}/${year}`);
      }
    } catch (err) {
      console.error('📅 Due-records job failed:', err.message);
    }
  });

  console.log('📅 Due-records job scheduled (daily at 00:05).');
};

module.exports = startDueRecordsJob;
