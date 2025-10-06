/**
 * Truist Bank Statement Parser
 * Extracts check and withdrawal information from Truist statements
 */

/**
 * Parse Truist statement text
 * @param {string} text - OCR or PDF extracted text
 * @returns {Object} Parsed transactions
 */
function parseTruist(text) {
  try {
    const result = {
      transactions: [],
      statementDate: null,
      accountNumber: null
    };

    // Extract statement date
    const dateMatch = text.match(/Statement\s+(?:Date|Period)[:\s]+.*?(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (dateMatch) {
      result.statementDate = parseDate(dateMatch[1]);
    }

    // Extract account number
    const accountMatch = text.match(/Account\s+(?:Number|#)[:\s]+([\d-]+)/i);
    if (accountMatch) {
      result.accountNumber = accountMatch[1];
    }

    // Find Checks section
    const checksSection = extractSection(text, /Checks/i, /(?=\n[A-Z][a-z]+|\n\s*Total|Other\s+withdrawals)/i);
    if (checksSection) {
      const checkTransactions = parseChecksSection(checksSection);
      result.transactions.push(...checkTransactions);
    }

    // Find "Other withdrawals, debits and service charges" section
    const withdrawalsSection = extractSection(
      text,
      /Other\s+withdrawals,?\s+debits\s+and\s+service\s+charges/i,
      /(?=\n[A-Z][a-z]+\s+[A-Z]|\n\s*Total)/i
    );
    if (withdrawalsSection) {
      const withdrawalTransactions = parseWithdrawalsSection(withdrawalsSection);
      result.transactions.push(...withdrawalTransactions);
    }

    // Filter for loan payments
    result.transactions = result.transactions.filter(t =>
      isLoanPayment(t.description) || isLoanPayment(t.checkNumber)
    );

    return result;
  } catch (error) {
    console.error('Truist parser error:', error.message);
    throw new Error(`Failed to parse Truist statement: ${error.message}`);
  }
}

/**
 * Extract text section between start and end patterns
 * @param {string} text - Full text
 * @param {RegExp} startPattern - Section start pattern
 * @param {RegExp} endPattern - Section end pattern
 * @returns {string|null} Extracted section or null
 */
function extractSection(text, startPattern, endPattern) {
  const startMatch = text.search(startPattern);
  if (startMatch === -1) return null;

  const sectionText = text.substring(startMatch);
  const endMatch = sectionText.search(endPattern);

  if (endMatch === -1) {
    return sectionText;
  }

  return sectionText.substring(0, endMatch);
}

/**
 * Parse checks section
 * @param {string} text - Checks section text
 * @returns {Array} Parsed check transactions
 */
function parseChecksSection(text) {
  const transactions = [];

  // Pattern: Date | Check # | Description | Amount
  const checkRegex = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(\d+)\s+(.*?)\s+\$?([\d,]+\.?\d*)$/gim;

  let match;
  while ((match = checkRegex.exec(text)) !== null) {
    transactions.push({
      date: parseDate(match[1]),
      checkNumber: match[2],
      description: match[3].trim() || `Check #${match[2]}`,
      amount: parseFloat(match[4].replace(/,/g, '')),
      type: 'check'
    });
  }

  // Alternative pattern: Check # | Date | Amount
  if (transactions.length === 0) {
    const altCheckRegex = /(\d+)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+\$?([\d,]+\.?\d*)/gim;

    let altMatch;
    while ((altMatch = altCheckRegex.exec(text)) !== null) {
      transactions.push({
        checkNumber: altMatch[1],
        date: parseDate(altMatch[2]),
        description: `Check #${altMatch[1]}`,
        amount: parseFloat(altMatch[3].replace(/,/g, '')),
        type: 'check'
      });
    }
  }

  return transactions;
}

/**
 * Parse withdrawals section
 * @param {string} text - Withdrawals section text
 * @returns {Array} Parsed withdrawal transactions
 */
function parseWithdrawalsSection(text) {
  const transactions = [];

  // Pattern: Date | Description | Amount
  const withdrawalRegex = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.*?)\s+\$?([\d,]+\.?\d*)$/gim;

  let match;
  while ((match = withdrawalRegex.exec(text)) !== null) {
    const description = match[2].trim();

    // Extract check number if present in description
    const checkNumMatch = description.match(/(?:Check|Ck|#)\s*(\d+)/i);

    transactions.push({
      date: parseDate(match[1]),
      description: description,
      amount: parseFloat(match[3].replace(/,/g, '')),
      checkNumber: checkNumMatch ? checkNumMatch[1] : null,
      type: 'withdrawal'
    });
  }

  return transactions;
}

/**
 * Check if description indicates a loan payment
 * @param {string} text - Description or check number
 * @returns {boolean}
 */
function isLoanPayment(text) {
  if (!text) return false;

  const loanKeywords = /navient|mohela|loan|student\s+loan|consolidation/i;
  return loanKeywords.test(text);
}

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Date string
 * @returns {string|null} ISO date string or null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    const parts = dateStr.split('/');
    if (parts.length === 2) {
      // Assume current year if not provided
      const currentYear = new Date().getFullYear();
      parts.push(currentYear.toString());
    }

    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      let year = parts[2];

      // Handle 2-digit years
      if (year.length === 2) {
        year = '20' + year;
      }

      return `${year}-${month}-${day}`;
    }
    return null;
  } catch (error) {
    console.error('Date parse error:', error.message);
    return null;
  }
}

module.exports = {
  parseTruist,
  parseDate
};
