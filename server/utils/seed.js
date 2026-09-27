/**
 * Run with: npm run seed
 * Creates the admin account (from .env), 3 sample members, and a few
 * September payments so the dashboard/tables have real data to show.
 * Safe to re-run — skips anything that already exists.
 */
const { sequelize, User, Member, Payment } = require('../models');
const { hashPassword } = require('../services/authService');
const config = require('../config/config');

const run = async () => {
  await sequelize.authenticate();
  await sequelize.sync(); // ensure tables exist

  // ── Admin account ────────────────────────────────────────────
  let admin = await User.findOne({ where: { email: config.seedAdmin.email } });
  if (!admin) {
    const hashed = await hashPassword(config.seedAdmin.password);
    admin = await User.create({
      name: config.seedAdmin.name,
      email: config.seedAdmin.email,
      password: hashed,
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email} / (password from .env)`);
  } else {
    console.log(`ℹ️  Admin already exists: ${admin.email}`);
  }

  // ── Sample members ───────────────────────────────────────────
  const sampleMembers = [
    { name: 'Rahul Sharma', email: 'rahul@committee.local', phone: '9876543210', address: 'Block A, Flat 101', join_date: '2025-01-15', monthly_fee: 500 },
    { name: 'Amit Verma', email: 'amit@committee.local', phone: '9876543211', address: 'Block B, Flat 204', join_date: '2025-02-01', monthly_fee: 500 },
    { name: 'Priya Singh', email: 'priya@committee.local', phone: '9876543212', address: 'Block A, Flat 305', join_date: '2025-03-10', monthly_fee: 500 },
  ];

  const createdMembers = [];
  for (const m of sampleMembers) {
    let user = await User.findOne({ where: { email: m.email } });
    if (!user) {
      const hashed = await hashPassword('Member@123'); // default sample password
      user = await User.create({ name: m.name, email: m.email, password: hashed, role: 'member' });
    }

    let member = await Member.findOne({ where: { email: m.email } });
    if (!member) {
      member = await Member.create({
        user_id: user.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        address: m.address,
        join_date: m.join_date,
        monthly_fee: m.monthly_fee,
        status: 'active',
      });
      console.log(`✅ Member created: ${member.name}`);
    } else {
      console.log(`ℹ️  Member already exists: ${member.name}`);
    }
    createdMembers.push(member);
  }

  // ── Sample September 2026 payments ───────────────────────────
  const [rahul, amit, priya] = createdMembers;
  const samplePayments = [
    { member_id: rahul.id, month: 9, year: 2026, amount: 500, status: 'paid', payment_date: '2026-09-05', transaction_id: 'TXN10023456', verified_by: admin.id },
    { member_id: amit.id, month: 9, year: 2026, amount: 500, status: 'due' },
    { member_id: priya.id, month: 9, year: 2026, amount: 500, status: 'paid', payment_date: '2026-09-03', transaction_id: 'TXN10023457', verified_by: admin.id },
  ];

  for (const p of samplePayments) {
    const existing = await Payment.findOne({ where: { member_id: p.member_id, month: p.month, year: p.year } });
    if (!existing) {
      await Payment.create(p);
      console.log(`✅ Payment record created for member #${p.member_id}, ${p.month}/${p.year}`);
    }
  }

  console.log('\n🎉 Seeding complete.');
  console.log(`   Admin login → ${config.seedAdmin.email} / ${config.seedAdmin.password}`);
  console.log(`   Sample member login → rahul@committee.local / Member@123`);
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
