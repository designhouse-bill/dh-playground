const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');

/**
 * GET /api/transactions
 * Get transactions with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const {
      startDate,
      endDate,
      paidBy,
      verificationStatus,
      source,
      limit = 100,
      offset = 0
    } = req.query;

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (startDate) {
      conditions.push('transaction_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('transaction_date <= ?');
      params.push(endDate);
    }

    if (paidBy) {
      conditions.push('paid_by = ?');
      params.push(paidBy);
    }

    if (verificationStatus) {
      conditions.push('verification_status = ?');
      params.push(verificationStatus);
    }

    if (source) {
      conditions.push('source = ?');
      params.push(source);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM transactions ${whereClause}`;
    const countResult = await db.get(countSql, params);

    // Get transactions
    const sql = `
      SELECT * FROM transactions
      ${whereClause}
      ORDER BY transaction_date DESC
      LIMIT ? OFFSET ?
    `;

    const transactions = await db.all(sql, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      transactions: transactions,
      total: countResult.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', message: error.message });
  }
});

/**
 * POST /api/transactions
 * Create new transaction
 */
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const {
      date,
      description,
      checkNumber,
      confirmationNumber,
      amount,
      principal,
      interest,
      capitalizedInterest,
      lateFees,
      balanceAfter,
      paidBy,
      verificationStatus,
      source,
      memo,
      disputeNotes
    } = req.body;

    // Validate required fields
    if (!date || !source) {
      return res.status(400).json({ error: 'Missing required fields: date, source' });
    }

    const sql = `
      INSERT INTO transactions (
        transaction_date, description, check_number, confirmation_number,
        amount, principal, interest, capitalized_interest, late_fees,
        balance_after, paid_by, verification_status, source, memo, dispute_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(sql, [
      date,
      description || null,
      checkNumber || null,
      confirmationNumber || null,
      amount || 0,
      principal || 0,
      interest || 0,
      capitalizedInterest || 0,
      lateFees || 0,
      balanceAfter || null,
      paidBy || 'Unknown',
      verificationStatus || 'Manual Entry',
      source,
      memo || null,
      disputeNotes || null
    ]);

    // Fetch created transaction
    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction', message: error.message });
  }
});

/**
 * PUT /api/transactions/:id
 * Update transaction
 */
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const updates = req.body;

    // Build UPDATE clause
    const allowedFields = [
      'transaction_date', 'description', 'check_number', 'confirmation_number',
      'amount', 'principal', 'interest', 'capitalized_interest', 'late_fees',
      'balance_after', 'paid_by', 'verification_status', 'memo', 'dispute_notes'
    ];

    const setClause = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add last_modified timestamp
    setClause.push('last_modified = CURRENT_TIMESTAMP');

    const sql = `UPDATE transactions SET ${setClause.join(', ')} WHERE id = ?`;
    params.push(id);

    await db.run(sql, params);

    // Fetch updated transaction
    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction', message: error.message });
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete transaction
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const result = await db.run('DELETE FROM transactions WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction', message: error.message });
  }
});

/**
 * GET /api/transactions/stats
 * Get transaction statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();

    const stats = await db.get(`
      SELECT
        SUM(amount) as totalPaid,
        SUM(CASE WHEN paid_by = 'You' THEN amount ELSE 0 END) as youPaid,
        SUM(CASE WHEN paid_by = 'Ex-Wife' THEN amount ELSE 0 END) as exWifePaid,
        SUM(principal) as principalPaid,
        SUM(interest) as interestPaid,
        SUM(late_fees + capitalized_interest) as feesPaid,
        COUNT(CASE WHEN verification_status = 'Verified' THEN 1 END) as verifiedCount,
        COUNT(CASE WHEN verification_status = 'Unverified' THEN 1 END) as unverifiedCount
      FROM transactions
    `);

    res.json({
      totalPaid: stats.totalPaid || 0,
      youPaid: stats.youPaid || 0,
      exWifePaid: stats.exWifePaid || 0,
      principalPaid: stats.principalPaid || 0,
      interestPaid: stats.interestPaid || 0,
      feesPaid: stats.feesPaid || 0,
      verifiedCount: stats.verifiedCount || 0,
      unverifiedCount: stats.unverifiedCount || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

module.exports = router;
