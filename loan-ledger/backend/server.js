const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database/db');
const transactionsRoutes = require('./routes/transactions');
const statementsRoutes = require('./routes/statements');
const reportsRoutes = require('./routes/reports');
const loanRoutes = require('./routes/loan');
const fileWatcher = require('./services/file-watcher');
const config = require('./config/config.json');

const app = express();

/**
 * Middleware
 */
app.use(cors({
  origin: 'http://localhost:3001'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Routes
 */
app.use('/api/transactions', transactionsRoutes);
app.use('/api/statements', statementsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/loan', loanRoutes);

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    fileWatcher: fileWatcher.getStatus()
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

/**
 * Initialize and start server
 */
async function startServer() {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../database/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory:', uploadsDir);
    }

    // Initialize database connection
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully');

    // Start Express server
    const PORT = config.server.port || 3000;
    const HOST = config.server.host || 'localhost';

    app.listen(PORT, HOST, () => {
      console.log('\n=================================');
      console.log(`LoanLedger Backend Server`);
      console.log(`Running on http://${HOST}:${PORT}`);
      console.log('=================================\n');

      console.log('Available endpoints:');
      console.log(`  GET    /api/health`);
      console.log(`  GET    /api/transactions`);
      console.log(`  POST   /api/transactions`);
      console.log(`  GET    /api/statements`);
      console.log(`  POST   /api/statements/upload`);
      console.log(`  GET    /api/reports/summary`);
      console.log(`  GET    /api/loan/info`);
      console.log('');

      // Start file watcher if enabled
      if (config.fileWatcher.enabled) {
        console.log('Starting file watcher...');

        if (!config.dropboxPath || config.dropboxPath === '/PATH/TO/DROPBOX/FOLDER') {
          console.warn('⚠️  Warning: Dropbox path not configured in config.json');
          console.warn('   File watcher will not start. Update config.json with your Dropbox path.');
        } else if (!fs.existsSync(config.dropboxPath)) {
          console.warn(`⚠️  Warning: Dropbox path does not exist: ${config.dropboxPath}`);
          console.warn('   File watcher will not start.');
        } else {
          fileWatcher.start(config.dropboxPath, {
            extensions: config.fileWatcher.watchExtensions,
            pollInterval: config.fileWatcher.pollInterval
          });
          console.log(`✓ File watcher started on: ${config.dropboxPath}`);
        }
      } else {
        console.log('File watcher is disabled (enable in config.json)');
      }

      console.log('\nServer ready! Press Ctrl+C to stop.\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');

  if (fileWatcher.getStatus().isWatching) {
    await fileWatcher.stop();
  }

  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');

  if (fileWatcher.getStatus().isWatching) {
    await fileWatcher.stop();
  }

  process.exit(0);
});
