LoanLedger Documents Directory
===============================

This directory is intended to contain or link to your loan-related documents.

SETUP INSTRUCTIONS:
-------------------

Option 1: Symlink to Dropbox Folder (Recommended)
--------------------------------------------------
If your loan documents are stored in Dropbox, create a symbolic link:

On macOS/Linux:
  cd /path/to/loan-ledger/documents
  ln -s "/path/to/Dropbox/Loan Documents" dropbox-loans

On Windows (Command Prompt as Administrator):
  cd C:\path\to\loan-ledger\documents
  mklink /D dropbox-loans "C:\path\to\Dropbox\Loan Documents"

Option 2: Copy Documents Directly
----------------------------------
Simply copy your loan documents (PDFs, images, CSVs) into this directory.

Supported File Types:
  - PDF statements (.pdf)
  - Scanned images (.jpg, .jpeg, .png, .tiff)
  - QuickBooks exports (.csv)

File Organization Suggestions:
-------------------------------
documents/
  ├── mohela/           (MOHELA statements)
  ├── navient/          (Navient statements)
  ├── bank-statements/  (Bank statements)
  │   ├── keybank/
  │   └── truist/
  ├── quickbooks/       (QuickBooks exports)
  └── manual/           (Handwritten or manual records)

File Naming Suggestions:
------------------------
  MOHELA_Statement_2024-01.pdf
  Navient_History_2023.pdf
  KeyBank_Statement_2024-03.pdf
  QuickBooks_Export_2024-Q1.csv

Automatic Processing:
---------------------
To enable automatic processing of new documents:
  1. Edit backend/config/config.json
  2. Set "fileWatcher.enabled": true
  3. Set "dropboxPath" to your documents folder path
  4. Restart the backend server

The file watcher will automatically detect and process new documents
added to the monitored folder.
