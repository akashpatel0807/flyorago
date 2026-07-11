import { query } from '../services/db.service';

async function runMigration() {
  console.log('Starting contact messages migration...');
  try {
    console.log('Creating contact_messages table...');
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(150)    NOT NULL,
        email       VARCHAR(255)    NOT NULL,
        phone       VARCHAR(20),
        user_type   VARCHAR(50)     NOT NULL,
        subject     VARCHAR(255)    NOT NULL,
        message     TEXT            NOT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating index on contact_messages email and created_at...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
    `);

    console.log('Contact messages migration completed successfully!');
  } catch (error) {
    console.error('Contact messages migration failed:', error);
    process.exit(1);
  }
}

runMigration();
