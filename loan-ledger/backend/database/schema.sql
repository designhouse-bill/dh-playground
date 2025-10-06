-- Loan Information
CREATE TABLE IF NOT EXISTS loan_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_number TEXT DEFAULT '9146962875-9',
  original_amount DECIMAL(10,2),
  original_principal_unsub DECIMAL(10,2) DEFAULT 25010.50,
  original_principal_sub DECIMAL(10,2) DEFAULT 32750.46,
  start_date DATE DEFAULT '2001-09-11',
  interest_rate DECIMAL(5,3) DEFAULT 8.000,
  original_creditor TEXT DEFAULT 'Federal Spousal Consolidation',
  current_servicer TEXT DEFAULT 'MOHELA',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statements/Documents
CREATE TABLE IF NOT EXISTS statements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  statement_date DATE,
  statement_period_start DATE,
  statement_period_end DATE,
  date_processed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_type TEXT CHECK(source_type IN (
    'mohela', 'navient', 'keybank', 'truist',
    'quickbooks', 'invoice', 'handwritten', 'manual'
  )),
  servicer TEXT,
  notes TEXT,
  status TEXT DEFAULT 'processed' CHECK(status IN ('pending', 'processed', 'error')),
  error_message TEXT
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  statement_id INTEGER,
  transaction_date DATE NOT NULL,
  description TEXT,
  check_number TEXT,
  confirmation_number TEXT,

  -- Financial breakdown
  amount DECIMAL(10,2),
  principal DECIMAL(10,2) DEFAULT 0,
  interest DECIMAL(10,2) DEFAULT 0,
  capitalized_interest DECIMAL(10,2) DEFAULT 0,
  late_fees DECIMAL(10,2) DEFAULT 0,
  balance_after DECIMAL(10,2),

  -- Attribution and verification
  paid_by TEXT CHECK(paid_by IN ('You', 'Ex-Wife', 'Unknown', 'Joint')) DEFAULT 'Unknown',
  verification_status TEXT CHECK(verification_status IN (
    'Verified', 'Unverified', 'Disputed', 'Manual Entry', 'Needs Review'
  )) DEFAULT 'Unverified',
  source TEXT NOT NULL,
  has_backup_document BOOLEAN DEFAULT 0,
  backup_file_path TEXT,

  -- Notes and metadata
  dispute_notes TEXT,
  memo TEXT,
  raw_ocr_text TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_paid_by ON transactions(paid_by);
CREATE INDEX IF NOT EXISTS idx_verification_status ON transactions(verification_status);
CREATE INDEX IF NOT EXISTS idx_check_number ON transactions(check_number);
CREATE INDEX IF NOT EXISTS idx_source ON transactions(source);

-- Insert default loan info
INSERT INTO loan_info (
  account_number,
  original_principal_unsub,
  original_principal_sub,
  start_date,
  interest_rate,
  original_creditor,
  current_servicer
) VALUES (
  '9146962875-9',
  25010.50,
  32750.46,
  '2001-09-11',
  8.000,
  'Federal Spousal Consolidation',
  'MOHELA'
);
