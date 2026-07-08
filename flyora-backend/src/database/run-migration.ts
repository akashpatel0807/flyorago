import { query } from '../services/db.service';

async function runMigration() {
  console.log('Starting migration...');
  try {
    // 1. Add wallet_balance to users table
    console.log('Adding wallet_balance column to users table...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 5000.00;
    `);

    // 2. Create wallet_transactions table
    console.log('Creating wallet_transactions table...');
    await query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount      NUMERIC(12,2)   NOT NULL,
        type        VARCHAR(20)     NOT NULL, -- 'credit' or 'debit'
        description VARCHAR(255)    NOT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Create index for transactions
    console.log('Creating index on wallet_transactions...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
    `);

    // 4. Create admins table
    console.log('Creating admins table...');
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            VARCHAR(50)     PRIMARY KEY,
        username      VARCHAR(100)    UNIQUE NOT NULL,
        password_hash TEXT            NOT NULL,
        created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default admin if table is empty
    const adminCheck = await query('SELECT COUNT(*) as count FROM admins');
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      console.log('Seeding default admin credentials...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('adminpassword', salt);
      await query(`
        INSERT INTO admins (id, username, password_hash)
        VALUES ('admin-id-1', 'admin', $1)
      `, [hash]);
      console.log('Default admin seeded with username: admin and password: adminpassword');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
