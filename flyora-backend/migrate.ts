import { query } from './src/services/db.service';

async function run() {
  try {
    await query('ALTER TABLE shipments ADD COLUMN images TEXT[] DEFAULT \'{}\';');
    console.log('Successfully added images column');
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error('Error:', err);
    }
  }
  process.exit(0);
}

run();
