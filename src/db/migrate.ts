/**
 * migrate.ts
 * 
 * Safely creates or updates all database tables based on Sequelize models.
 * Uses { alter: true } — adds missing columns/tables but does NOT drop existing data.
 * 
 * Usage:
 *   npm run migrate
 */

import sequelize from './index';
import './models'; // loads all models + associations

async function migrate() {
  console.log('\n🔄 Starting database migration...\n');

  try {
    // Test DB connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    console.log('   Dialect :', (sequelize.getDialect()));

    // Sync all models — creates tables if not exist, alters columns if changed
    // Does NOT drop tables or delete data
    await sequelize.sync({ alter: true });

    console.log('\n✅ Migration complete! Tables created/updated:\n');
    console.log('   - users');
    console.log('   - clinics');
    console.log('   - patients');
    console.log('   - leads');
    console.log('   - appointments');
    console.log('   - consultations');
    console.log('   - hair_analyses');
    console.log('   - treatment_plans');
    console.log('   - surgeries');
    console.log('   - surgery_grafts');
    console.log('   - patient_photos');
    console.log('   - follow_ups');
    console.log('   - payments');
    console.log('   - subscriptions');

  } catch (error: any) {
    console.error('\n❌ Migration failed!\n');

    if (error.original?.code === 'ECONNREFUSED') {
      console.error('   Could not connect to the database.');
      console.error('   → Make sure your DB server is running.');
      console.error('   → Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in .env');
    } else if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Access denied — wrong username or password.');
      console.error('   → Check DB_USER and DB_PASSWORD in .env');
    } else if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('   Database does not exist.');
      console.error('   → Create the database first:');
      console.error(`     CREATE DATABASE ${process.env.DB_NAME || 'graftdesk_db'};`);
    } else {
      console.error('   Error:', error.message);
    }

    process.exit(1);
  }

  process.exit(0);
}

migrate();
