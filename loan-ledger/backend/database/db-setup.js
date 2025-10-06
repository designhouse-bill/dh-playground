const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

/**
 * Database setup script
 * Creates the SQLite database and initializes schema
 */
async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Create database directory if it doesn't exist
    const dbDir = path.join(__dirname, '../../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('Created database directory:', dbDir);
    }

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Schema file loaded');

    // Create/connect to database
    const dbPath = path.join(dbDir, 'payments.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
      }
      console.log('Connected to database:', dbPath);
    });

    // Execute schema
    await new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          console.error('Error executing schema:', err.message);
          reject(err);
        } else {
          console.log('Database schema created successfully');
          resolve();
        }
      });
    });

    // Close database connection
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
        } else {
          console.log('Database setup completed successfully');
          resolve();
        }
      });
    });

    console.log('\n✓ Database ready at:', dbPath);
    console.log('✓ You can now start the server with: npm start');

  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
