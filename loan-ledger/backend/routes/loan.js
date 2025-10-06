const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');

/**
 * GET /api/loan/info
 * Get current loan information
 */
router.get('/info', async (req, res) => {
  try {
    const db = getDatabase();

    const loanInfo = await db.get('SELECT * FROM loan_info ORDER BY id DESC LIMIT 1');

    if (!loanInfo) {
      return res.status(404).json({ error: 'Loan information not found' });
    }

    res.json(loanInfo);
  } catch (error) {
    console.error('Error fetching loan info:', error);
    res.status(500).json({ error: 'Failed to fetch loan information', message: error.message });
  }
});

/**
 * PUT /api/loan/info
 * Update loan information
 */
router.put('/info', async (req, res) => {
  try {
    const db = getDatabase();
    const updates = req.body;

    const allowedFields = [
      'account_number',
      'original_amount',
      'original_principal_unsub',
      'original_principal_sub',
      'start_date',
      'interest_rate',
      'original_creditor',
      'current_servicer',
      'notes'
    ];

    // Build UPDATE clause
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

    // Add updated_at timestamp
    setClause.push('updated_at = CURRENT_TIMESTAMP');

    // Get current loan info ID
    const currentLoan = await db.get('SELECT id FROM loan_info ORDER BY id DESC LIMIT 1');

    if (!currentLoan) {
      return res.status(404).json({ error: 'Loan information not found' });
    }

    const sql = `UPDATE loan_info SET ${setClause.join(', ')} WHERE id = ?`;
    params.push(currentLoan.id);

    await db.run(sql, params);

    // Fetch updated loan info
    const loanInfo = await db.get('SELECT * FROM loan_info WHERE id = ?', [currentLoan.id]);

    res.json(loanInfo);
  } catch (error) {
    console.error('Error updating loan info:', error);
    res.status(500).json({ error: 'Failed to update loan information', message: error.message });
  }
});

/**
 * GET /api/loan/summary
 * Get loan summary with current status
 */
router.get('/summary', async (req, res) => {
  try {
    const db = getDatabase();

    // Get loan info
    const loanInfo = await db.get('SELECT * FROM loan_info ORDER BY id DESC LIMIT 1');

    if (!loanInfo) {
      return res.status(404).json({ error: 'Loan information not found' });
    }

    // Get total payments
    const paymentStats = await db.get(`
      SELECT
        SUM(amount) as total_paid,
        SUM(principal) as total_principal_paid,
        SUM(interest) as total_interest_paid,
        SUM(capitalized_interest + late_fees) as total_fees_paid,
        COUNT(*) as payment_count,
        MIN(transaction_date) as first_payment_date,
        MAX(transaction_date) as last_payment_date
      FROM transactions
    `);

    // Get latest balance
    const latestBalance = await db.get(`
      SELECT balance_after
      FROM transactions
      WHERE balance_after IS NOT NULL
      ORDER BY transaction_date DESC
      LIMIT 1
    `);

    // Calculate original loan amount
    const originalAmount = (loanInfo.original_principal_unsub || 0) + (loanInfo.original_principal_sub || 0);

    // Calculate remaining balance (if we have balance data)
    const currentBalance = latestBalance?.balance_after || null;

    // Calculate estimated remaining if no balance data
    let estimatedRemaining = null;
    if (!currentBalance && paymentStats.total_principal_paid) {
      estimatedRemaining = originalAmount - paymentStats.total_principal_paid;
    }

    res.json({
      loanInfo: loanInfo,
      originalAmount: originalAmount,
      currentBalance: currentBalance,
      estimatedRemaining: estimatedRemaining,
      totalPaid: paymentStats.total_paid || 0,
      principalPaid: paymentStats.total_principal_paid || 0,
      interestPaid: paymentStats.total_interest_paid || 0,
      feesPaid: paymentStats.total_fees_paid || 0,
      paymentCount: paymentStats.payment_count || 0,
      firstPaymentDate: paymentStats.first_payment_date,
      lastPaymentDate: paymentStats.last_payment_date
    });
  } catch (error) {
    console.error('Error fetching loan summary:', error);
    res.status(500).json({ error: 'Failed to fetch loan summary', message: error.message });
  }
});

module.exports = router;
