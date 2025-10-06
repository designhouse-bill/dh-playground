# LoanLedger Backend

Backend API server for LoanLedger - A comprehensive loan payment tracking and reconciliation system.

## Features

- **Automated Document Processing**: Automatically extracts payment data from PDF/image statements using OCR
- **Multi-Source Parsing**: Supports MOHELA, Navient, KeyBank, Truist, and QuickBooks formats
- **File Watching**: Monitors Dropbox folder for new documents and processes them automatically
- **Transaction Management**: Full CRUD operations for payment records
- **Comprehensive Reporting**: Payment summaries, timelines, verification status, and more
- **SQLite Database**: Lightweight, file-based database with full transaction history

## Tech Stack

- **Runtime**: Node.js + Express
- **Database**: SQLite3
- **OCR**: Tesseract.js
- **PDF Processing**: PDF.js
- **File Watching**: Chokidar
- **File Uploads**: Multer

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup Steps

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Create database**:
   ```bash
   npm run setup
   ```
   This will create the SQLite database and initialize the schema.

3. **Configure settings** (optional):
   Edit `config/config.json` to customize:
   - Dropbox path for file watching
   - Server port and host
   - File watcher settings
   - OCR language

   ```json
   {
     "dropboxPath": "/path/to/your/dropbox/folder",
     "server": {
       "port": 3000,
       "host": "localhost"
     },
     "fileWatcher": {
       "enabled": false,
       "watchExtensions": [".pdf", ".jpg", ".png", ".jpeg", ".csv"],
       "pollInterval": 5000
     }
   }
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Verify installation**:
   Visit http://localhost:3000/api/health

## API Endpoints

### Transactions

- `GET /api/transactions` - List transactions with filters
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats` - Get payment statistics

**Query Parameters** (GET):
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)
- `paidBy` - Filter by payer (You, Ex-Wife, Unknown, Joint)
- `verificationStatus` - Filter by verification status
- `source` - Filter by document source
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset (default: 0)

### Statements

- `GET /api/statements` - List all uploaded statements
- `GET /api/statements/:id` - Get statement details with transactions
- `POST /api/statements/upload` - Upload and process new statement
- `POST /api/statements/process/:id` - Reprocess existing statement

**Upload Format**: multipart/form-data with `file` field

### Reports

- `GET /api/reports/summary` - Payment summary by payer
- `GET /api/reports/timeline` - Monthly/yearly aggregated data
- `GET /api/reports/verification` - Verification status breakdown
- `GET /api/reports/detailed` - Detailed transaction report with filters
- `GET /api/reports/balance-history` - Balance progression over time
- `GET /api/reports/sources` - Breakdown by document source

### Loan Information

- `GET /api/loan/info` - Get current loan information
- `PUT /api/loan/info` - Update loan information
- `GET /api/loan/summary` - Get loan summary with current status

## Supported Document Types

### MOHELA Statements
- Extracts account summary information
- Parses unpaid principal, payments since last bill, current amount due
- Detects statement date

### Navient Statements
- Parses payment history tables
- Extracts: Date, Amount, Principal, Interest, Capitalized Interest, Late Fees, Balance
- Handles multi-page documents

### KeyBank Statements
- Parses checks section
- Extracts withdrawals related to loan payments
- Filters for NAVIENT/MOHELA-related transactions

### Truist Bank Statements
- Parses checks and withdrawals sections
- Extracts check numbers, dates, and amounts
- Filters for loan payments

### QuickBooks CSV Exports
- Parses CSV format
- Filters transactions by contact (NAVIENT, MOHELA)
- Maps check numbers and payment amounts

## File Watcher

The file watcher automatically processes new documents added to a monitored folder.

### Enable File Watcher

1. Edit `config/config.json`:
   ```json
   {
     "fileWatcher": {
       "enabled": true,
       "watchExtensions": [".pdf", ".jpg", ".png", ".jpeg", ".csv"],
       "pollInterval": 5000
     },
     "dropboxPath": "/path/to/dropbox/folder"
   }
   ```

2. Restart the server

### How It Works

1. Watcher detects new file in monitored folder
2. Extracts text using OCR or PDF parsing
3. Determines document type (MOHELA, Navient, etc.)
4. Parses transactions using appropriate parser
5. Creates statement and transaction records in database
6. Logs processing results

## Database Schema

### loan_info
- Original loan details and servicer information
- Interest rate, account number, start date

### statements
- Uploaded/processed document records
- File path, processing status, source type
- Links to extracted transactions

### transactions
- Individual payment records
- Date, amount, principal, interest breakdown
- Verification status, payer attribution
- Check numbers, confirmation numbers
- Raw OCR text for reference

## Development

### Project Structure

```
backend/
├── config/
│   └── config.json          # Configuration
├── database/
│   ├── db.js                # Database wrapper
│   ├── db-setup.js          # Setup script
│   └── schema.sql           # Database schema
├── routes/
│   ├── transactions.js      # Transaction endpoints
│   ├── statements.js        # Statement endpoints
│   ├── reports.js           # Reporting endpoints
│   └── loan.js              # Loan info endpoints
├── services/
│   ├── file-watcher.js      # File monitoring service
│   ├── ocr-processor.js     # OCR/PDF processing
│   └── parsers/
│       ├── mohela-parser.js
│       ├── navient-parser.js
│       ├── keybank-parser.js
│       ├── truist-parser.js
│       ├── quickbooks-parser.js
│       └── generic-ocr-parser.js
└── server.js                # Main server
```

### Adding New Parsers

1. Create parser in `services/parsers/`:
   ```javascript
   function parseNewSource(text) {
     return {
       statementDate: '2024-01-01',
       transactions: [
         {
           date: '2024-01-15',
           amount: 500.00,
           principal: 400.00,
           interest: 100.00,
           description: 'Payment'
         }
       ]
     };
   }
   module.exports = { parseNewSource };
   ```

2. Add to `ocr-processor.js` determineParserType()

3. Add to statements route switch statement

## Error Handling

- All API errors return JSON with `error` and `message` fields
- Failed document processing creates statement records with `status: 'error'`
- OCR failures fall back to raw text extraction when possible
- All database operations use parameterized queries to prevent SQL injection

## Security Notes

- Add authentication/authorization before production deployment
- Validate all user inputs
- Sanitize file uploads
- Use HTTPS in production
- Never commit `config.json` with real paths

## Troubleshooting

### Database not found
```bash
npm run setup
```

### OCR not working
- Ensure Tesseract.js dependencies are installed
- Check file permissions on uploaded documents

### File watcher not starting
- Verify Dropbox path exists in config
- Check directory permissions
- Enable file watcher in config

### Upload failures
- Check `database/uploads/` directory exists
- Verify file size limits (50MB default)
- Check disk space

## License

Private - Internal Use Only
