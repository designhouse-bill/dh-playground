/**
 * Navient Statement Parser
 * Extracts payment history from Navient statements
 */

/**
 * Parse Navient statement text
 * @param {string} text - OCR or PDF extracted text
 * @returns {Object} Parsed transactions
 */
function parseNAVIENT(text) {
  try {
    const result = {
      transactions: [],
      statementDate: null
    };

    // Extract statement date
    const dateMatch = text.match(/Statement\s+Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (dateMatch) {
      result.statementDate = parseDate(dateMatch[1]);
    }

    // Find Payment History section
    const paymentHistoryMatch = text.match(/Payment\s+History:?(.*?)(?=\n\n|\n[A-Z][a-z]+\s+[A-Z]|$)/is);

    if (paymentHistoryMatch) {
      const historySection = paymentHistoryMatch[1];

      // Match table rows with payment data
      // Format: Date | Amount | Principal | Interest | Cap Interest | Late Fees | Balance | Comments
      const rowRegex = /(\d{1,2}\/\d{1,2}\/\d{4})\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)\s*(.*?)$/gim;

      let match;
      while ((match = rowRegex.exec(historySection)) !== null) {
        const transaction = {
          date: parseDate(match[1]),
          amount: parseFloat(match[2].replace(/,/g, '')),
          principal: parseFloat(match[3].replace(/,/g, '')),
          interest: parseFloat(match[4].replace(/,/g, '')),
          capitalizedInterest: parseFloat(match[5].replace(/,/g, '')),
          lateFees: parseFloat(match[6].replace(/,/g, '')),
          balance: parseFloat(match[7].replace(/,/g, '')),
          comment: match[8] ? match[8].trim() : ''
        };

        result.transactions.push(transaction);
      }
    }

    // Alternative parsing for simpler format
    if (result.transactions.length === 0) {
      // Try simpler pattern: Date Amount Description Balance
      const simpleRowRegex = /(\d{1,2}\/\d{1,2}\/\d{4})\s+\$?([\d,]+\.?\d*)\s+(.*?)\s+\$?([\d,]+\.?\d*)$/gim;

      let match;
      while ((match = simpleRowRegex.exec(text)) !== null) {
        const transaction = {
          date: parseDate(match[1]),
          amount: parseFloat(match[2].replace(/,/g, '')),
          description: match[3].trim(),
          balance: parseFloat(match[4].replace(/,/g, '')),
          principal: 0,
          interest: 0,
          capitalizedInterest: 0,
          lateFees: 0
        };

        result.transactions.push(transaction);
      }
    }

    return result;
  } catch (error) {
    console.error('Navient parser error:', error.message);
    throw new Error(`Failed to parse Navient statement: ${error.message}`);
  }
}

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Date string in MM/DD/YYYY format
 * @returns {string|null} ISO date string or null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
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
  parseNAVIENT,
  parseDate
};
