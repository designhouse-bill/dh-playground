const chokidar = require('chokidar');
const path = require('path');
const { processFile, determineParserType } = require('./ocr-processor');
const { parseMOHELA } = require('./parsers/mohela-parser');
const { parseNAVIENT } = require('./parsers/navient-parser');
const { parseKeyBank } = require('./parsers/keybank-parser');
const { parseTruist } = require('./parsers/truist-parser');
const { parseQuickBooks } = require('./parsers/quickbooks-parser');
const { getDatabase } = require('../database/db');

/**
 * File Watcher Service
 * Monitors Dropbox folder for new documents and processes them automatically
 */

let watcher = null;
let isWatching = false;

/**
 * Start watching directory
 * @param {string} watchPath - Directory to watch
 * @param {Object} options - Watcher options
 */
function start(watchPath, options = {}) {
  if (isWatching) {
    console.log('File watcher is already running');
    return;
  }

  const extensions = options.extensions || ['.pdf', '.jpg', '.png', '.jpeg', '.csv'];
  const pollInterval = options.pollInterval || 5000;

  console.log(`Starting file watcher on: ${watchPath}`);
  console.log(`Watching for: ${extensions.join(', ')}`);

  watcher = chokidar.watch(watchPath, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't process existing files on startup
    usePolling: true,
    interval: pollInterval,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  watcher
    .on('add', async (filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      if (extensions.includes(ext)) {
        console.log(`New file detected: ${filePath}`);
        await processNewFile(filePath);
      }
    })
    .on('error', (error) => {
      console.error('File watcher error:', error);
    });

  isWatching = true;
  console.log('File watcher started successfully');
}

/**
 * Stop watching directory
 */
async function stop() {
  if (watcher) {
    await watcher.close();
    watcher = null;
    isWatching = false;
    console.log('File watcher stopped');
  }
}

/**
 * Process newly detected file
 * @param {string} filePath - Path to new file
 */
async function processNewFile(filePath) {
  const db = getDatabase();
  const fileName = path.basename(filePath);

  try {
    console.log(`Processing new file: ${fileName}`);

    // Extract text from file
    const extractionResult = await processFile(filePath);
    const text = extractionResult.text;

    // Determine parser type
    const parserType = determineParserType(text, fileName);

    if (!parserType) {
      console.log(`Could not determine parser type for: ${fileName}`);
      await createStatement(db, filePath, fileName, 'error', null, 'Unknown document type');
      return;
    }

    console.log(`Using ${parserType} parser for: ${fileName}`);

    // Parse document
    let parseResult;
    switch (parserType) {
      case 'mohela':
        parseResult = parseMOHELA(text);
        break;
      case 'navient':
        parseResult = parseNAVIENT(text);
        break;
      case 'keybank':
        parseResult = parseKeyBank(text);
        break;
      case 'truist':
        parseResult = parseTruist(text);
        break;
      case 'quickbooks':
        parseResult = parseQuickBooks(text);
        break;
      default:
        throw new Error(`Unknown parser type: ${parserType}`);
    }

    // Create statement record
    const statementId = await createStatement(
      db,
      filePath,
      fileName,
      'processed',
      parserType,
      null,
      parseResult.statementDate
    );

    // Create transaction records
    const transactions = parseResult.transactions || [];
    let transactionCount = 0;

    for (const transaction of transactions) {
      await createTransaction(db, statementId, transaction, text, parserType);
      transactionCount++;
    }

    console.log(`✓ Processed ${fileName}: ${transactionCount} transactions created`);

  } catch (error) {
    console.error(`Error processing ${fileName}:`, error.message);

    // Create error statement record
    await createStatement(db, filePath, fileName, 'error', null, error.message);
  }
}

/**
 * Create statement record
 * @param {Object} db - Database instance
 * @param {string} filePath - File path
 * @param {string} fileName - File name
 * @param {string} status - Status
 * @param {string|null} sourceType - Source type
 * @param {string|null} errorMessage - Error message
 * @param {string|null} statementDate - Statement date
 * @returns {Promise<number>} Statement ID
 */
async function createStatement(db, filePath, fileName, status, sourceType, errorMessage, statementDate = null) {
  const sql = `
    INSERT INTO statements (file_name, file_path, statement_date, source_type, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await db.run(sql, [
    fileName,
    filePath,
    statementDate,
    sourceType,
    status,
    errorMessage
  ]);

  return result.lastID;
}

/**
 * Create transaction record
 * @param {Object} db - Database instance
 * @param {number} statementId - Statement ID
 * @param {Object} transaction - Transaction data
 * @param {string} rawText - Raw OCR text
 * @param {string} source - Source type
 */
async function createTransaction(db, statementId, transaction, rawText, source) {
  const sql = `
    INSERT INTO transactions (
      statement_id, transaction_date, description, check_number,
      amount, principal, interest, capitalized_interest, late_fees,
      balance_after, source, raw_ocr_text, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.run(sql, [
    statementId,
    transaction.date,
    transaction.description || transaction.comment || '',
    transaction.checkNumber || null,
    transaction.amount || 0,
    transaction.principal || 0,
    transaction.interest || 0,
    transaction.capitalizedInterest || 0,
    transaction.lateFees || 0,
    transaction.balance || transaction.balance_after || null,
    source,
    rawText.substring(0, 5000), // Store first 5000 chars
    'Unverified'
  ]);
}

/**
 * Get watcher status
 * @returns {Object} Status information
 */
function getStatus() {
  return {
    isWatching: isWatching,
    watcherActive: watcher !== null
  };
}

module.exports = {
  start,
  stop,
  getStatus
};
