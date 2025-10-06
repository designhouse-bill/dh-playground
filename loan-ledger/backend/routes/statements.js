const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDatabase } = require('../database/db');
const { processFile, determineParserType } = require('../services/ocr-processor');
const { parseMOHELA } = require('../services/parsers/mohela-parser');
const { parseNAVIENT } = require('../services/parsers/navient-parser');
const { parseKeyBank } = require('../services/parsers/keybank-parser');
const { parseTruist } = require('../services/parsers/truist-parser');
const { parseQuickBooks } = require('../services/parsers/quickbooks-parser');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../database/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

/**
 * GET /api/statements
 * Get all statements
 */
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();

    const statements = await db.all(`
      SELECT
        s.*,
        COUNT(t.id) as transaction_count
      FROM statements s
      LEFT JOIN transactions t ON t.statement_id = s.id
      GROUP BY s.id
      ORDER BY s.date_processed DESC
    `);

    res.json(statements);
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({ error: 'Failed to fetch statements', message: error.message });
  }
});

/**
 * GET /api/statements/:id
 * Get statement details with transactions
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const statement = await db.get('SELECT * FROM statements WHERE id = ?', [id]);

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }

    const transactions = await db.all(
      'SELECT * FROM transactions WHERE statement_id = ? ORDER BY transaction_date DESC',
      [id]
    );

    res.json({
      ...statement,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching statement:', error);
    res.status(500).json({ error: 'Failed to fetch statement', message: error.message });
  }
});

/**
 * POST /api/statements/upload
 * Upload and process new statement
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const db = getDatabase();
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(`Processing uploaded file: ${fileName}`);

    // Extract text from file
    const extractionResult = await processFile(filePath);
    const text = extractionResult.text;

    // Determine parser type
    const parserType = determineParserType(text, fileName);

    if (!parserType) {
      const statementId = await createStatement(
        db,
        filePath,
        fileName,
        'error',
        null,
        'Unknown document type'
      );

      return res.status(400).json({
        error: 'Could not determine document type',
        statementId: statementId
      });
    }

    console.log(`Using ${parserType} parser`);

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
    const transactionIds = [];

    for (const transaction of transactions) {
      const id = await createTransaction(db, statementId, transaction, text, parserType);
      transactionIds.push(id);
    }

    console.log(`✓ Processed ${fileName}: ${transactionIds.length} transactions created`);

    res.status(201).json({
      statementId: statementId,
      transactionsCreated: transactionIds.length,
      transactionIds: transactionIds,
      parserType: parserType
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process file', message: error.message });
  }
});

/**
 * POST /api/statements/process/:id
 * Reprocess existing statement
 */
router.post('/process/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const statement = await db.get('SELECT * FROM statements WHERE id = ?', [id]);

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }

    console.log(`Reprocessing statement: ${statement.file_name}`);

    // Delete existing transactions
    await db.run('DELETE FROM transactions WHERE statement_id = ?', [id]);

    // Extract text from file
    const extractionResult = await processFile(statement.file_path);
    const text = extractionResult.text;

    // Determine parser type
    const parserType = determineParserType(text, statement.file_name);

    if (!parserType) {
      await db.run(
        'UPDATE statements SET status = ?, error_message = ? WHERE id = ?',
        ['error', 'Unknown document type', id]
      );

      return res.status(400).json({ error: 'Could not determine document type' });
    }

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

    // Update statement
    await db.run(
      `UPDATE statements
       SET status = ?, source_type = ?, error_message = NULL, statement_date = ?
       WHERE id = ?`,
      ['processed', parserType, parseResult.statementDate, id]
    );

    // Create transaction records
    const transactions = parseResult.transactions || [];
    const transactionIds = [];

    for (const transaction of transactions) {
      const transactionId = await createTransaction(db, id, transaction, text, parserType);
      transactionIds.push(transactionId);
    }

    console.log(`✓ Reprocessed: ${transactionIds.length} transactions created`);

    res.json({
      statementId: id,
      transactionsCreated: transactionIds.length,
      transactionIds: transactionIds,
      parserType: parserType
    });
  } catch (error) {
    console.error('Error reprocessing statement:', error);
    res.status(500).json({ error: 'Failed to reprocess statement', message: error.message });
  }
});

/**
 * Helper: Create statement record
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
 * Helper: Create transaction record
 */
async function createTransaction(db, statementId, transaction, rawText, source) {
  const sql = `
    INSERT INTO transactions (
      statement_id, transaction_date, description, check_number,
      amount, principal, interest, capitalized_interest, late_fees,
      balance_after, source, raw_ocr_text, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.run(sql, [
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
    rawText.substring(0, 5000),
    'Unverified'
  ]);

  return result.lastID;
}

module.exports = router;
