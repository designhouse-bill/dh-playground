const { parse } = require('csv-parse/sync');

/**
 * QuickBooks CSV Parser
 * Extracts loan payment transactions from QuickBooks export
 */

/**
 * Parse QuickBooks CSV export
 * @param {string} csvText - CSV file content
 * @returns {Object} Parsed transactions
 */
function parseQuickBooks(csvText) {
  try {
    const result = {
      transactions: []
    };

    // Parse CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });

    // Filter and map transactions
    for (const record of records) {
      // Check if transaction is related to loan payments
      const contact = record.Contact || record.Vendor || record.Payee || '';
      const memo = record.Memo || record.Description || '';

      if (isLoanPayment(contact) || isLoanPayment(memo)) {
        const transaction = {
          date: parseDate(record.Date || record['Transaction Date']),
          type: record.Type || record['Transaction Type'] || '',
          checkNumber: record['Ref no.'] || record['Check Number'] || record['Num'] || null,
          contact: contact,
          amount: parseAmount(record['Total amount'] || record.Amount || record.Total || '0'),
          memo: memo,
          category: record.Category || record.Account || '',
          description: buildDescription(record)
        };

        result.transactions.push(transaction);
      }
    }

    return result;
  } catch (error) {
    console.error('QuickBooks parser error:', error.message);
    throw new Error(`Failed to parse QuickBooks CSV: ${error.message}`);
  }
}

/**
 * Build transaction description from record
 * @param {Object} record - CSV record
 * @returns {string} Description
 */
function buildDescription(record) {
  const parts = [];

  if (record.Type) parts.push(record.Type);
  if (record.Contact || record.Vendor || record.Payee) {
    parts.push(`to ${record.Contact || record.Vendor || record.Payee}`);
  }
  if (record['Ref no.'] || record['Check Number']) {
    parts.push(`(Check #${record['Ref no.'] || record['Check Number']})`);
  }

  return parts.join(' ') || 'QuickBooks transaction';
}

/**
 * Check if text indicates a loan payment
 * @param {string} text - Text to check
 * @returns {boolean}
 */
function isLoanPayment(text) {
  if (!text) return false;

  const loanKeywords = /navient|mohela|loan|student\s+loan|consolidation/i;
  return loanKeywords.test(text);
}

/**
 * Parse amount string to number
 * @param {string} amountStr - Amount string
 * @returns {number} Parsed amount
 */
function parseAmount(amountStr) {
  if (!amountStr) return 0;

  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr.replace(/[$,\s]/g, '');

  // Handle parentheses as negative (accounting format)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.replace(/[()]/g, '')) || 0;
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Date string
 * @returns {string|null} ISO date string or null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Handle MM/DD/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        return `${year}-${month}-${day}`;
      }
    }

    // Handle YYYY-MM-DD format (already ISO)
    if (dateStr.includes('-')) {
      return dateStr;
    }

    // Try JavaScript Date parsing as fallback
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  } catch (error) {
    console.error('Date parse error:', error.message);
    return null;
  }
}

module.exports = {
  parseQuickBooks,
  parseDate,
  parseAmount
};
