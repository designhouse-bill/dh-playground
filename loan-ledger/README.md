# LoanLedger

A comprehensive loan payment tracking and reconciliation system designed to help track and verify payments on a Federal Spousal Consolidation loan over 20+ years.

## Overview

LoanLedger automatically processes loan statements, bank records, and payment history from multiple sources to create a complete, verified payment ledger. The system uses OCR and intelligent parsing to extract transaction data from PDFs and images, helping you track who paid what, when, and verify every payment.

## Key Features

- **Automated Document Processing**: Upload PDFs, images, or CSV files and automatically extract payment data
- **Multi-Source Support**: Handles MOHELA, Navient, KeyBank, Truist, and QuickBooks formats
- **OCR Technology**: Extracts text from scanned documents and images using Tesseract.js
- **File Watching**: Automatically processes new documents added to a Dropbox folder
- **Payment Attribution**: Track payments by payer (You, Ex-Wife, Joint, Unknown)
- **Verification System**: Mark transactions as Verified, Unverified, Disputed, or Needs Review
- **Comprehensive Reporting**: View payment summaries, timelines, verification status, and balance history
- **REST API**: Full API for programmatic access to all data

## Project Structure

```
loan-ledger/
├── backend/              # Node.js + Express API server
│   ├── config/          # Configuration files
│   ├── database/        # SQLite database and schema
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic and parsers
│   │   └── parsers/     # Document parsers (MOHELA, Navient, etc.)
│   └── server.js        # Main server file
├── database/            # SQLite database storage
├── documents/           # Document storage/symlinks
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Optional: Dropbox folder for document syncing

### Installation

1. **Clone or extract the project**:
   ```bash
   cd loan-ledger
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Initialize database**:
   ```bash
   npm run setup
   ```

4. **Configure (optional)**:
   Edit `backend/config/config.json` to set:
   - Dropbox path for file watching
   - Server port (default: 3000)
   - File watcher settings

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Verify installation**:
   Open http://localhost:3000/api/health

## Usage

### Upload Documents

**Via API**:
```bash
curl -X POST http://localhost:3000/api/statements/upload \
  -F "file=@/path/to/statement.pdf"
```

**Response**:
```json
{
  "statementId": 1,
  "transactionsCreated": 12,
  "parserType": "navient"
}
```

### Query Transactions

```bash
# Get all transactions
curl http://localhost:3000/api/transactions

# Filter by date range
curl "http://localhost:3000/api/transactions?startDate=2023-01-01&endDate=2023-12-31"

# Filter by payer
curl "http://localhost:3000/api/transactions?paidBy=You"
```

### Get Reports

```bash
# Payment summary by payer
curl http://localhost:3000/api/reports/summary

# Monthly timeline
curl "http://localhost:3000/api/reports/timeline?groupBy=month"

# Verification status
curl http://localhost:3000/api/reports/verification

# Loan summary
curl http://localhost:3000/api/loan/summary
```

### Automatic File Processing

1. Edit `backend/config/config.json`:
   ```json
   {
     "fileWatcher": {
       "enabled": true,
       "watchExtensions": [".pdf", ".jpg", ".png", ".csv"]
     },
     "dropboxPath": "/path/to/dropbox/loan-documents"
   }
   ```

2. Restart server

3. Drop files into monitored folder - they'll be processed automatically!

## Supported Document Types

### MOHELA Statements
- Extracts account balances and payment information
- Parses account summary sections
- Captures statement dates

### Navient Statements
- Parses detailed payment history tables
- Extracts principal, interest, capitalized interest, late fees
- Tracks balance progression

### KeyBank Statements
- Extracts check information
- Parses withdrawal sections
- Filters for loan-related payments

### Truist Bank Statements
- Parses check and withdrawal sections
- Extracts dates, check numbers, amounts
- Identifies loan payments

### QuickBooks CSV Exports
- Parses CSV format exports
- Filters for NAVIENT/MOHELA transactions
- Maps check numbers and amounts

## API Documentation

See [backend/README.md](backend/README.md) for complete API documentation.

### Key Endpoints

**Transactions**:
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

**Statements**:
- `GET /api/statements` - List statements
- `POST /api/statements/upload` - Upload document
- `POST /api/statements/process/:id` - Reprocess

**Reports**:
- `GET /api/reports/summary` - Payment summary
- `GET /api/reports/timeline` - Timeline view
- `GET /api/reports/verification` - Verification status

**Loan Info**:
- `GET /api/loan/info` - Get loan details
- `GET /api/loan/summary` - Full loan summary

## Database Schema

### Tables

**loan_info**: Original loan details, interest rate, servicer
**statements**: Uploaded documents and processing status
**transactions**: Individual payment records with full breakdown

### Transaction Fields

- Date, amount, check number, confirmation number
- Principal, interest, capitalized interest, late fees
- Balance after transaction
- Payer attribution (You, Ex-Wife, Unknown, Joint)
- Verification status
- Source document reference
- Raw OCR text for verification

## Development

### Adding Custom Parsers

1. Create parser file in `backend/services/parsers/`:
   ```javascript
   function parseCustom(text) {
     // Parse logic here
     return {
       statementDate: '2024-01-01',
       transactions: [...]
     };
   }
   module.exports = { parseCustom };
   ```

2. Update `ocr-processor.js` to recognize document type

3. Add to statement processing route

### Running in Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

## Loan Information

**Account**: 9146962875-9
**Original Principal**:
- Unsubsidized: $25,010.50
- Subsidized: $32,750.46
- **Total**: $57,760.96

**Interest Rate**: 8.000%
**Start Date**: September 11, 2001
**Original Creditor**: Federal Spousal Consolidation
**Current Servicer**: MOHELA

## Use Cases

- **Payment Verification**: Verify every payment was properly applied
- **Divorce Settlement**: Track and prove individual payment contributions
- **Loan Reconciliation**: Match bank records against servicer statements
- **Dispute Resolution**: Provide documentation for payment disputes
- **Payment History**: Complete chronological payment ledger
- **Balance Tracking**: Monitor balance progression over time

## Security Notes

- This system stores financial data locally in SQLite
- No cloud storage or external services (except optional Dropbox sync)
- Add authentication before exposing API publicly
- Keep config.json out of version control (included in .gitignore)
- Backup database regularly

## Troubleshooting

**Database errors**: Run `npm run setup` to reinitialize

**OCR not working**: Ensure Tesseract.js dependencies installed properly

**File watcher not starting**:
- Check Dropbox path in config
- Verify directory exists and is readable
- Check permissions

**Upload failures**:
- Verify `database/uploads/` directory exists
- Check file size (50MB limit)
- Ensure proper file format

## Next Steps

1. **Frontend Development** (Prompt 2): Build React UI for visualization and management
2. **Add Authentication**: Implement user login system
3. **Dispute Tracking**: Build workflow for disputed transactions
4. **Export Features**: Add CSV/PDF export for reports
5. **Payment Predictions**: Calculate estimated payoff dates
6. **Document Backup**: Automated cloud backup system

## License

Private - Internal Use Only

---

**Need Help?** Check the [backend README](backend/README.md) for detailed technical documentation.
