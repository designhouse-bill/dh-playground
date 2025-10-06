const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database wrapper class providing connection and query helpers
 */
class Database {
  constructor(dbPath = null) {
    const defaultPath = path.join(__dirname, '../../database/payments.db');
    this.dbPath = dbPath || defaultPath;
    this.db = null;
  }

  /**
   * Open database connection
   * @returns {Promise<void>}
   */
  async open() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          reject(err);
        } else {
          console.log('Connected to database:', this.dbPath);
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON');
          resolve();
        }
      });
    });
  }

  /**
   * Run a SQL query (INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - { lastID, changes }
   */
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Query error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Get a single row
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|undefined>}
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Query error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all rows
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err.message);
          console.error('SQL:', sql);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Execute a transaction
   * @param {Function} callback - Async function to execute within transaction
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

// Singleton instance
let dbInstance = null;

/**
 * Get database instance
 * @returns {Database}
 */
function getDatabase() {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

/**
 * Initialize database connection
 * @returns {Promise<Database>}
 */
async function initDatabase() {
  const db = getDatabase();
  if (!db.db) {
    await db.open();
  }
  return db;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (dbInstance) {
    await dbInstance.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (dbInstance) {
    await dbInstance.close();
  }
  process.exit(0);
});

module.exports = {
  Database,
  getDatabase,
  initDatabase
};
