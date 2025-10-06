const Tesseract = require('tesseract.js');

/**
 * Generic OCR Parser
 * Performs OCR on images and scanned documents
 */

/**
 * Perform OCR on image file
 * @param {string} imagePath - Path to image file
 * @param {string} language - OCR language (default: 'eng')
 * @returns {Promise<Object>} OCR result with text and confidence
 */
async function performOCR(imagePath, language = 'eng') {
  try {
    console.log(`Starting OCR on: ${imagePath}`);

    const result = await Tesseract.recognize(
      imagePath,
      language,
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    const text = cleanText(result.data.text);

    console.log(`OCR completed. Confidence: ${result.data.confidence}%`);

    return {
      text: text,
      confidence: result.data.confidence,
      blocks: result.data.blocks || [],
      words: result.data.words || []
    };
  } catch (error) {
    console.error('OCR error:', error.message);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

/**
 * Clean and normalize OCR text
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';

  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove common OCR artifacts
    .replace(/[|｜]/g, 'I')
    .replace(/[０-９]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0))
    // Fix common misreads
    .replace(/\bO(?=\d)/g, '0')
    .replace(/(?<=\d)O\b/g, '0')
    .replace(/\bl(?=\d)/g, '1')
    .replace(/(?<=\d)l\b/g, '1')
    // Trim
    .trim();
}

/**
 * Extract potential dollar amounts from text
 * @param {string} text - OCR text
 * @returns {Array<Object>} Array of {value, position}
 */
function extractAmounts(text) {
  const amounts = [];
  const amountRegex = /\$?\s?([\d,]+\.?\d{0,2})/g;

  let match;
  while ((match = amountRegex.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(value) && value > 0) {
      amounts.push({
        value: value,
        position: match.index,
        raw: match[0]
      });
    }
  }

  return amounts;
}

/**
 * Extract potential dates from text
 * @param {string} text - OCR text
 * @returns {Array<Object>} Array of {date, position}
 */
function extractDates(text) {
  const dates = [];

  // Match MM/DD/YYYY or M/D/YYYY formats
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})/g;

  let match;
  while ((match = dateRegex.exec(text)) !== null) {
    dates.push({
      date: match[1],
      position: match.index,
      raw: match[0]
    });
  }

  return dates;
}

/**
 * Detect document type from OCR text
 * @param {string} text - OCR text
 * @returns {string|null} Detected document type
 */
function detectDocumentType(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('mohela')) return 'mohela';
  if (lowerText.includes('navient')) return 'navient';
  if (lowerText.includes('key bank') || lowerText.includes('keybank')) return 'keybank';
  if (lowerText.includes('truist') || lowerText.includes('suntrust') || lowerText.includes('bb&t')) return 'truist';

  return null;
}

module.exports = {
  performOCR,
  cleanText,
  extractAmounts,
  extractDates,
  detectDocumentType
};
