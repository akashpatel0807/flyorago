const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query('ALTER TABLE shipments ADD COLUMN images TEXT[] DEFAULT \'{}\';');
    console.log('Successfully added images column');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error('Error:', err);
    }
  } finally {
    await pool.end();
  }
}

run();
