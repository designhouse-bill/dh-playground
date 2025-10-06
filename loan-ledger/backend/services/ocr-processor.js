const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdfjs-dist/legacy/build/pdf');
const { performOCR } = require('./parsers/generic-ocr-parser');

/**
 * OCR Processor Service
 * Handles text extraction from PDFs and images
 */

/**
 * Process file and extract text
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function processFile(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
      return await processPDF(filePath);
    } else if (['.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(ext)) {
      return await processImage(filePath);
    } else if (ext === '.csv') {
      return await processCSV(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('File processing error:', error.message);
    throw error;
  }
}

/**
 * Extract text from PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function processPDF(pdfPath) {
  try {
    console.log(`Processing PDF: ${pdfPath}`);

    // Read PDF file
    const dataBuffer = await fs.readFile(pdfPath);
    const data = new Uint8Array(dataBuffer);

    // Load PDF document
    const loadingTask = pdfParse.getDocument({
      data: data,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    console.log(`PDF has ${numPages} pages`);

    let fullText = '';
    const pages = [];

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
      pages.push({
        pageNumber: i,
        text: pageText
      });
    }

    console.log(`Extracted ${fullText.length} characters from PDF`);

    return {
      text: fullText.trim(),
      pages: pages,
      pageCount: numPages,
      method: 'pdf-extraction'
    };
  } catch (error) {
    console.error('PDF processing error:', error.message);
    console.log('Falling back to OCR...');

    // Fallback to OCR if PDF text extraction fails
    return await processImage(pdfPath);
  }
}

/**
 * Extract text from image using OCR
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} OCR result
 */
async function processImage(imagePath) {
  try {
    console.log(`Processing image with OCR: ${imagePath}`);

    const ocrResult = await performOCR(imagePath);

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      method: 'ocr'
    };
  } catch (error) {
    console.error('Image processing error:', error.message);
    throw error;
  }
}

/**
 * Read CSV file as text
 * @param {string} csvPath - Path to CSV file
 * @returns {Promise<Object>} CSV content
 */
async function processCSV(csvPath) {
  try {
    console.log(`Reading CSV: ${csvPath}`);

    const text = await fs.readFile(csvPath, 'utf8');

    return {
      text: text,
      method: 'csv-read'
    };
  } catch (error) {
    console.error('CSV processing error:', error.message);
    throw error;
  }
}

/**
 * Determine parser type from file content
 * @param {string} text - Extracted text
 * @param {string} fileName - Original file name
 * @returns {string|null} Parser type
 */
function determineParserType(text, fileName) {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  // Check filename first
  if (lowerFileName.includes('mohela')) return 'mohela';
  if (lowerFileName.includes('navient')) return 'navient';
  if (lowerFileName.includes('keybank') || lowerFileName.includes('key-bank')) return 'keybank';
  if (lowerFileName.includes('truist')) return 'truist';
  if (lowerFileName.includes('quickbooks') || lowerFileName.includes('.csv')) return 'quickbooks';

  // Check content
  if (lowerText.includes('mohela')) return 'mohela';
  if (lowerText.includes('navient')) return 'navient';
  if (lowerText.includes('key bank') || lowerText.includes('keybank')) return 'keybank';
  if (lowerText.includes('truist') || lowerText.includes('suntrust') || lowerText.includes('bb&t')) return 'truist';

  return null;
}

module.exports = {
  processFile,
  processPDF,
  processImage,
  processCSV,
  determineParserType
};
