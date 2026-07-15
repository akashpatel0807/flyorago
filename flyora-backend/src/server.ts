import * as fs from 'fs';
import * as path from 'path';
import createApp from './app';
import { env } from './config/env';
import { query } from './services/db.service';

// Run all pending migrations automatically
const runAutoMigrations = async (): Promise<void> => {
  console.log('  🔄  Running auto-migrations...');
  try {
    // Check if users table exists. If not, run schema.sql first
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename  = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('  🔄  Fresh database detected. Initializing database schema from schema.sql...');
      let schemaPath = path.join(__dirname, 'database', 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
      }
      
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await query(schemaSql);
        console.log('  ✅  Database schema initialized successfully from schema.sql');
      } else {
        console.warn('  ⚠️  schema.sql not found at ' + schemaPath + '. Skipping initial schema setup.');
      }
    }

    // 1. Add wallet_balance to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 5000.00;
    `);

    // 2. Add profile_image_url to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    `);

    // 3. Create wallet_transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount      NUMERIC(12,2)   NOT NULL,
        type        VARCHAR(20)     NOT NULL,
        description VARCHAR(255)    NOT NULL,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);`);

    // 4. Create notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       VARCHAR(150)    NOT NULL,
        message     TEXT            NOT NULL,
        type        VARCHAR(50)     NOT NULL,
        is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);

    // 5. Create admins table
    await query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            VARCHAR(50)     PRIMARY KEY,
        username      VARCHAR(100)    UNIQUE NOT NULL,
        password_hash TEXT            NOT NULL,
        created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
    `);

    // 6. Seed default admin if table is empty
    const adminCheck = await query('SELECT COUNT(*) as count FROM admins');
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('adminpassword', salt);
      await query(`
        INSERT INTO admins (id, username, password_hash)
        VALUES ('admin-id-1', 'admin', $1)
      `, [hash]);
      console.log('  ✅  Default admin seeded (admin / adminpassword)');
    }

    // 7. Create contact_messages table
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
    await query(`CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);`);

    console.log('  ✅  Auto-migrations completed successfully');
  } catch (error) {
    console.error('  ❌  Auto-migration error:', error);
    // Don't crash — tables may already exist or DB might not be ready yet
  }
};

const startServer = async (): Promise<void> => {
  const app = createApp();

  // Run migrations before starting
  await runAutoMigrations();

  const server = app.listen(env.port, () => {
    console.log('\n');
    console.log('  ✈️  ════════════════════════════════════════════');
    console.log('  ✈️  FLYORA API SERVER STARTED');
    console.log('  ✈️  ════════════════════════════════════════════');
    console.log(`  🌐  URL:         http://${env.host}:${env.port}`);
    console.log(`  🔧  Environment: ${env.nodeEnv}`);
    console.log(`  📦  Version:     ${env.apiVersion}`);
    console.log('  ✈️  ════════════════════════════════════════════');
    console.log('  📍  Endpoints:');
    console.log(`  →   GET  http://${env.host}:${env.port}/api/health`);
    console.log(`  →   GET  http://${env.host}:${env.port}/api/stats`);
    console.log(`  →   GET  http://${env.host}:${env.port}/api/routes`);
    console.log(`  →   GET  http://${env.host}:${env.port}/api/features`);
    console.log(`  →   POST http://${env.host}:${env.port}/api/waitlist`);
    console.log('  ✈️  ════════════════════════════════════════════\n');
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  const gracefulShutdown = (signal: string): void => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Closing server gracefully...`);
    server.close(() => {
      console.log('[SHUTDOWN] Server closed. Process exiting.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[SHUTDOWN] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
    process.exit(1);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('[FATAL] Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
