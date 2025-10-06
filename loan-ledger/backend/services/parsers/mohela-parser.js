/**
 * MOHELA Statement Parser
 * Extracts loan information from MOHELA statements
 */

/**
 * Parse MOHELA statement text
 * @param {string} text - OCR or PDF extracted text
 * @returns {Object} Parsed statement data
 */
function parseMOHELA(text) {
  try {
    const result = {
      statementDate: null,
      currentBalance: null,
      unpaidPrincipal: null,
      paymentsSinceLastBill: null,
      pastDue: null,
      currentAmountDue: null,
      unpaidFees: null,
      transactions: []
    };

    // Extract statement date
    const dateMatch = text.match(/Statement\s+Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (dateMatch) {
      result.statementDate = parseDate(dateMatch[1]);
    }

    // Extract from Account Summary section
    const unpaidPrincipalMatch = text.match(/Unpaid\s+Principal[:\s]+\$?([\d,]+\.?\d*)/i);
    if (unpaidPrincipalMatch) {
      result.unpaidPrincipal = parseFloat(unpaidPrincipalMatch[1].replace(/,/g, ''));
    }

    const paymentsMatch = text.match(/Payments?\s+Since\s+Last\s+Bill[:\s]+\$?([\d,]+\.?\d*)/i);
    if (paymentsMatch) {
      result.paymentsSinceLastBill = parseFloat(paymentsMatch[1].replace(/,/g, ''));
    }

    const pastDueMatch = text.match(/Past\s+Due\s+Amount[:\s]+\$?([\d,]+\.?\d*)/i);
    if (pastDueMatch) {
      result.pastDue = parseFloat(pastDueMatch[1].replace(/,/g, ''));
    }

    const currentDueMatch = text.match(/Current\s+Amount\s+Due[:\s]+\$?([\d,]+\.?\d*)/i);
    if (currentDueMatch) {
      result.currentAmountDue = parseFloat(currentDueMatch[1].replace(/,/g, ''));
    }

    const feesMatch = text.match(/Unpaid\s+Fees[:\s]+\$?([\d,]+\.?\d*)/i);
    if (feesMatch) {
      result.unpaidFees = parseFloat(feesMatch[1].replace(/,/g, ''));
    }

    // Extract current balance (often labeled as "Amount Due" or "Total Balance")
    const balanceMatch = text.match(/(?:Total\s+)?Balance[:\s]+\$?([\d,]+\.?\d*)/i);
    if (balanceMatch) {
      result.currentBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    return result;
  } catch (error) {
    console.error('MOHELA parser error:', error.message);
    throw new Error(`Failed to parse MOHELA statement: ${error.message}`);
  }
}

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Date string in various formats
 * @returns {string|null} ISO date string or null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    // Handle MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return null;
  } catch (error) {
    console.error('Date parse error:', error.message);
    return null;
  }
}

module.exports = {
  parseMOHELA,
  parseDate
};
