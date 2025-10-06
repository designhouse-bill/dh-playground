const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');

/**
 * GET /api/reports/summary
 * Get payment summary by payer
 */
router.get('/summary', async (req, res) => {
  try {
    const db = getDatabase();

    const summary = await db.all(`
      SELECT
        paid_by,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount,
        SUM(principal) as total_principal,
        SUM(interest) as total_interest,
        SUM(capitalized_interest + late_fees) as total_fees,
        MIN(transaction_date) as first_payment,
        MAX(transaction_date) as last_payment
      FROM transactions
      WHERE paid_by != 'Unknown'
      GROUP BY paid_by
      ORDER BY total_amount DESC
    `);

    // Get unknown payments separately
    const unknownPayments = await db.get(`
      SELECT
        COUNT(*) as payment_count,
        SUM(amount) as total_amount
      FROM transactions
      WHERE paid_by = 'Unknown'
    `);

    res.json({
      byPayer: summary,
      unknown: unknownPayments || { payment_count: 0, total_amount: 0 }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary', message: error.message });
  }
});

/**
 * GET /api/reports/timeline
 * Get monthly/yearly aggregated data
 */
router.get('/timeline', async (req, res) => {
  try {
    const db = getDatabase();
    const { startYear, endYear, groupBy = 'month' } = req.query;

    let dateFormat;
    if (groupBy === 'year') {
      dateFormat = '%Y';
    } else {
      dateFormat = '%Y-%m';
    }

    const conditions = [];
    const params = [];

    if (startYear) {
      conditions.push(`strftime('%Y', transaction_date) >= ?`);
      params.push(startYear);
    }

    if (endYear) {
      conditions.push(`strftime('%Y', transaction_date) <= ?`);
      params.push(endYear);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const timeline = await db.all(`
      SELECT
        strftime('${dateFormat}', transaction_date) as period,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount,
        SUM(principal) as total_principal,
        SUM(interest) as total_interest,
        SUM(capitalized_interest + late_fees) as total_fees,
        SUM(CASE WHEN paid_by = 'You' THEN amount ELSE 0 END) as you_paid,
        SUM(CASE WHEN paid_by = 'Ex-Wife' THEN amount ELSE 0 END) as ex_wife_paid
      FROM transactions
      ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `, params);

    res.json({
      groupBy: groupBy,
      data: timeline
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline', message: error.message });
  }
});

/**
 * GET /api/reports/verification
 * Get verification status breakdown
 */
router.get('/verification', async (req, res) => {
  try {
    const db = getDatabase();

    const breakdown = await db.all(`
      SELECT
        verification_status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(principal) as total_principal
      FROM transactions
      GROUP BY verification_status
      ORDER BY count DESC
    `);

    // Get unverified by source
    const bySource = await db.all(`
      SELECT
        source,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions
      WHERE verification_status = 'Unverified'
      GROUP BY source
      ORDER BY count DESC
    `);

    res.json({
      breakdown: breakdown,
      unverifiedBySource: bySource
    });
  } catch (error) {
    console.error('Error fetching verification breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch verification data', message: error.message });
  }
});

/**
 * GET /api/reports/detailed
 * Get detailed transaction report with filters
 */
router.get('/detailed', async (req, res) => {
  try {
    const db = getDatabase();
    const {
      startDate,
      endDate,
      paidBy,
      verificationStatus,
      source,
      minAmount,
      maxAmount
    } = req.query;

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

    if (minAmount) {
      conditions.push('amount >= ?');
      params.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      conditions.push('amount <= ?');
      params.push(parseFloat(maxAmount));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const transactions = await db.all(`
      SELECT
        t.*,
        s.file_name as statement_file_name,
        s.source_type as statement_source
      FROM transactions t
      LEFT JOIN statements s ON s.id = t.statement_id
      ${whereClause}
      ORDER BY t.transaction_date DESC
    `, params);

    // Calculate totals
    const totals = await db.get(`
      SELECT
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(principal) as total_principal,
        SUM(interest) as total_interest,
        SUM(capitalized_interest + late_fees) as total_fees
      FROM transactions
      ${whereClause}
    `, params);

    res.json({
      transactions: transactions,
      totals: totals,
      filters: req.query
    });
  } catch (error) {
    console.error('Error fetching detailed report:', error);
    res.status(500).json({ error: 'Failed to fetch detailed report', message: error.message });
  }
});

/**
 * GET /api/reports/balance-history
 * Get balance progression over time
 */
router.get('/balance-history', async (req, res) => {
  try {
    const db = getDatabase();

    const history = await db.all(`
      SELECT
        transaction_date,
        balance_after,
        amount,
        principal,
        interest
      FROM transactions
      WHERE balance_after IS NOT NULL
      ORDER BY transaction_date ASC
    `);

    res.json({
      history: history
    });
  } catch (error) {
    console.error('Error fetching balance history:', error);
    res.status(500).json({ error: 'Failed to fetch balance history', message: error.message });
  }
});

/**
 * GET /api/reports/sources
 * Get breakdown by document source
 */
router.get('/sources', async (req, res) => {
  try {
    const db = getDatabase();

    const sources = await db.all(`
      SELECT
        source,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        MIN(transaction_date) as first_date,
        MAX(transaction_date) as last_date
      FROM transactions
      GROUP BY source
      ORDER BY transaction_count DESC
    `);

    res.json({
      sources: sources
    });
  } catch (error) {
    console.error('Error fetching sources report:', error);
    res.status(500).json({ error: 'Failed to fetch sources report', message: error.message });
  }
});

module.exports = router;
