// server/seedDemoData.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'cherai',
  password: '8896', // your DB password
  port: 5432,
});

const randomPastDate = () => {
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const seedDemoData = async () => {
  try {
    await client.connect();
    console.log('Seeding demo data...');

    // --- TRUNCATE tables first ---
    await client.query('TRUNCATE TABLE tasks, policies, users RESTART IDENTITY CASCADE');

    // --- 1. Create Demo Admin ---
    const hashedPassword = await bcrypt.hash('Demo1234!', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
    `, ['Demo Admin', 'admin@demo.com', hashedPassword, 'admin']);

    // --- 2. Sample Policies ---
    const policies = [
      { title: 'Data Retention Policy', description: 'Keep data for 7 years' },
      { title: 'Security Policy', description: 'Use 2FA and strong passwords' },
      { title: 'Privacy Policy', description: 'Do not share user data' },
    ];

    for (let p of policies) {
      await client.query(`
        INSERT INTO policies (title, description, owner_id)
        VALUES ($1, $2, $3)
      `, [p.title, p.description, null]);
    }

    // --- 3. Sample Tasks ---
    const tasks = [
      { title: 'Fix server error', description: 'Investigate 500 error on /api/login', status: 'pending' },
      { title: 'Update security settings', description: 'Enable MFA for all users', status: 'in_progress' },
      { title: 'Review policies', description: 'Check compliance with GDPR', status: 'done' }, // matches check constraint
      { title: 'Test new feature', description: 'QA testing of dashboard updates', status: 'pending' },
      { title: 'Backup database', description: 'Perform nightly backup', status: 'in_progress' },
    ];

    for (let t of tasks) {
      await client.query(`
        INSERT INTO tasks (title, description, status, created_at)
        VALUES ($1, $2, $3, $4)
      `, [t.title, t.description, t.status, randomPastDate()]);
    }

    console.log('Demo data seeded successfully! ✅');
  } catch (err) {
    console.error('Error seeding demo data:', err);
  } finally {
    await client.end();
  }
};

seedDemoData();