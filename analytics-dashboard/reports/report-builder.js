/**
 * Report Builder JavaScript Module
 * Handles report generation, configuration, and export functionality
 */


// Global variable to store loaded data
let promotionsData = [];

/**
 * Initialize the Report Builder
 */
function initReportBuilder() {
    console.log('Initializing Report Builder...');

    // Parse URL parameters first
    const urlParams = parseURLParameters();

    // Load mock data
    loadMockData();

    // Apply URL parameters if coming from datagrid
    if (urlParams.source === 'datagrid') {
        applyDatagridParameters(urlParams);
    }

    // Set up event listeners
    setupEventListeners();
}

/**
 * Load mock promotion data
 */
async function loadMockData() {
    try {
        // Check if mockPromotions is available from the global scope
        if (typeof window.mockPromotions !== 'undefined' && window.mockPromotions.length > 0) {
            promotionsData = window.mockPromotions;
            console.log(`Loaded ${promotionsData.length} promotions from mockPromotions`);
        } else {
            // Generate sample data if mockPromotions is not available
            promotionsData = generateSampleData();
            console.log(`Generated ${promotionsData.length} sample promotions`);
        }
    } catch (error) {
        console.error('Error loading mock data:', error);
        // Fallback to sample data
        promotionsData = generateSampleData();
    }
}

/**
 * Generate sample data for testing
 */
function generateSampleData() {
    const departments = ['deli', 'bakery', 'produce', 'meat', 'dairy', 'frozen'];
    const sampleData = [];

    for (let i = 0; i < 50; i++) {
        sampleData.push({
            card_id: `promo_${i + 1}`,
            card_name: `Sample Promotion ${i + 1}`,
            department: departments[i % departments.length],
            card_in_view: Math.floor(Math.random() * 1000) + 100,
            card_clicked: Math.floor(Math.random() * 100) + 10,
            composite_score: Math.floor(Math.random() * 3000) + 1000
        });
    }

    return sampleData;
}

/**
 * Set up event listeners for buttons and form elements
 */
function setupEventListeners() {
    // Note: Weekly Performance button is now handled in reports.html
    // No automatic downloads on button click
}

/**
 * Generate and preview the weekly report
 */
async function generateAndPreviewWeeklyReport() {
    try {
        if (promotionsData.length === 0) {
            alert('No data available for report generation');
            return;
        }

        // Show loading spinner
        showPreviewLoading();

        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate the PDF using the template function
        const doc = generateWeeklyReport(promotionsData);

        // Show preview with page count
        await showPDFPreview(doc, 'Weekly Performance Report');

        // Update options area to show report info
        updateOptionsArea('weekly');

    } catch (error) {
        console.error('Error generating weekly report:', error);
        hidePreviewLoading();
        showPreviewError('Error generating report. Please check the console for details.');
    }
}

/**
 * Handle template selection changes
 */
function handleTemplateChange(templateValue) {
    console.log('Template changed to:', templateValue);

    // Clear preview when changing templates
    clearPreview();

    updateOptionsArea(templateValue);

    // Auto-generate report if template is selected
    if (templateValue === 'weekly') {
        generateAndPreviewWeeklyReport();
    } else if (templateValue === 'category') {
        // Category report shows options but no preview (Excel only)
        // Preview is cleared above
    } else if (templateValue === 'custom') {
        // Future: Add custom report preview
        // Preview is cleared above
    }
}

/**
 * Update the options area based on selected template
 */
function updateOptionsArea(templateType) {
    const optionsDiv = document.getElementById('options');
    if (!optionsDiv) return;

    switch (templateType) {
        case 'weekly':
            optionsDiv.innerHTML = `
                <div class="template-info">
                    <h4>Weekly Summary Report</h4>
                    <p><strong>Data Source:</strong> ${promotionsData.length} promotions</p>
                    <p><strong>Period:</strong> Week 36 - Sep 18-24, 2025</p>
                    <p><strong>Includes:</strong></p>
                    <ul>
                        <li>Executive Summary</li>
                        <li>Key Performance Metrics</li>
                        <li>Top 10 Performers Table</li>
                    </ul>
                    <div class="report-actions" style="margin-top: 16px;">
                        <button class="btn btn-primary" onclick="downloadWeeklyReport()">Download PDF</button>
                        <button class="btn btn-primary" onclick="generateAndDownloadExcel({reportType: 'weekly'})">Download Excel</button>
                        <button class="btn btn-secondary" onclick="generateAndPreviewWeeklyReport()">Refresh</button>
                    </div>
                </div>
            `;
            break;
        case 'category':
            optionsDiv.innerHTML = `
                <div class="template-info">
                    <h4>Category Performance Report</h4>
                    <p><strong>Data Source:</strong> ${promotionsData.length} promotions</p>
                    <p><strong>Format:</strong> Excel Workbook (.xlsx)</p>
                    <p><strong>Includes:</strong></p>
                    <ul>
                        <li>Complete promotions data</li>
                        <li>Department breakdown summary</li>
                        <li>Performance metrics by category</li>
                        <li>Auto-filtering and formatting</li>
                    </ul>
                    <div class="report-actions" style="margin-top: 16px;">
                        <button class="btn btn-primary" onclick="generateAndDownloadExcel({reportType: 'category'})">Download Excel</button>
                    </div>
                </div>
            `;
            break;
        case 'custom':
            optionsDiv.innerHTML = '<p class="text-muted">Custom Report builder will appear here</p>';
            break;
        default:
            optionsDiv.innerHTML = '<p class="text-muted">Select a template to see configuration options</p>';
    }
}

/**
 * Download the weekly report PDF
 */
function downloadWeeklyReport() {
    try {
        if (promotionsData.length === 0) {
            alert('No data available for report generation');
            return;
        }

        const doc = generateWeeklyReport(promotionsData);
        const filename = `Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        console.log('Weekly report downloaded:', filename);

    } catch (error) {
        console.error('Error downloading weekly report:', error);
        alert('Error downloading report. Please check the console for details.');
    }
}

/**
 * Generate and download Excel report
 * @param {Object} filters - Applied filters for filename
 */
function generateAndDownloadExcel(filters = {}) {
    try {
        if (promotionsData.length === 0) {
            alert('No data available for Excel export');
            return;
        }

        console.log('Generating Excel report...');

        // Generate Excel workbook with summary sheet
        const workbook = generateExcelReport(promotionsData, { includeSummary: true });

        // Generate filename with filters
        const filename = generateFilenameWithFilters('Promotions_Export', filters, 'xlsx');

        // Download the file
        XLSX.writeFile(workbook, filename);
        console.log('Excel report downloaded:', filename);

        // Update UI to show success
        showExportSuccess('Excel', filename);

    } catch (error) {
        console.error('Error generating Excel report:', error);
        alert('Error generating Excel report. Please check the console for details.');
    }
}

/**
 * Generate filename with applied filters
 * @param {string} baseName - Base filename
 * @param {Object} filters - Applied filters
 * @param {string} extension - File extension
 * @returns {string} - Generated filename
 */
function generateFilenameWithFilters(baseName, filters, extension) {
    const date = new Date().toISOString().split('T')[0];
    let filename = `${baseName}_${date}`;

    // Add filter information to filename
    const filterParts = [];

    if (filters.reportType) {
        filterParts.push(filters.reportType);
    }

    if (filters.department && filters.department !== 'all') {
        filterParts.push(`dept-${filters.department}`);
    }

    if (filters.scoreRange) {
        filterParts.push(`score-${filters.scoreRange}`);
    }

    if (filters.period && filters.period !== 'current') {
        filterParts.push(`period-${filters.period}`);
    }

    if (filters.topN) {
        filterParts.push(`top${filters.topN}`);
    }

    if (filterParts.length > 0) {
        filename += `_${filterParts.join('_')}`;
    }

    return `${filename}.${extension}`;
}

/**
 * Show export success message
 * @param {string} format - Export format
 * @param {string} filename - Generated filename
 */
function showExportSuccess(format, filename) {
    const optionsDiv = document.getElementById('options');
    if (optionsDiv) {
        const successMessage = document.createElement('div');
        successMessage.className = 'export-success';
        successMessage.style.cssText = `
            background-color: #d1f2eb;
            border: 1px solid #00d084;
            color: #00984a;
            padding: 12px;
            border-radius: 4px;
            margin-top: 16px;
            font-size: 14px;
        `;
        successMessage.innerHTML = `
            <strong>✓ ${format} Export Complete</strong><br>
            Downloaded: ${filename}
        `;

        // Remove any existing success messages
        const existing = optionsDiv.querySelector('.export-success');
        if (existing) existing.remove();

        optionsDiv.appendChild(successMessage);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.remove();
            }
        }, 5000);
    }
}

/**
 * Show loading spinner in preview area
 */
function showPreviewLoading() {
    const previewFrame = document.getElementById('preview');
    const previewContainer = previewFrame.parentElement;

    // Clear any existing content
    clearPreview();

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'preview-loading';
    loadingOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: var(--radius-md);
    `;

    loadingOverlay.innerHTML = `
        <div class="loading-spinner" style="
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid var(--blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        "></div>
        <p style="color: var(--muted); margin: 0;">Generating report preview...</p>
    `;

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Make container relative for absolute positioning
    previewContainer.style.position = 'relative';
    previewContainer.appendChild(loadingOverlay);
}

/**
 * Hide loading spinner
 */
function hidePreviewLoading() {
    const loadingOverlay = document.getElementById('preview-loading');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

/**
 * Show PDF preview in iframe with page count
 * @param {Object} doc - jsPDF document
 * @param {string} title - Report title
 */
async function showPDFPreview(doc, title) {
    try {
        // Convert to blob URL for preview
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Get page count
        const pageCount = doc.internal.getNumberOfPages();

        // Display in preview iframe
        const previewFrame = document.getElementById('preview');
        if (previewFrame) {
            previewFrame.src = pdfUrl;

            // Store current PDF data for download
            previewFrame.pdfBlob = pdfBlob;
            previewFrame.pdfTitle = title;

            console.log(`${title} loaded in preview (${pageCount} pages)`);

            // Show page count and download button
            showPreviewControls(pageCount, title);

            // Hide loading spinner
            hidePreviewLoading();
        } else {
            console.error('Preview iframe not found');
        }

    } catch (error) {
        console.error('Error showing PDF preview:', error);
        hidePreviewLoading();
        showPreviewError('Error displaying PDF preview');
    }
}

/**
 * Show preview controls (page count and download button)
 * @param {number} pageCount - Number of pages in PDF
 * @param {string} title - Report title
 */
function showPreviewControls(pageCount, title) {
    const previewContainer = document.querySelector('#reports-preview .card-body');
    if (!previewContainer) return;

    // Remove existing controls
    const existingControls = previewContainer.querySelector('.preview-controls');
    if (existingControls) existingControls.remove();

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'preview-controls';
    controlsContainer.style.cssText = `
        margin-top: 12px;
        padding: 12px;
        background-color: var(--bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    // Page count info
    const pageInfo = document.createElement('span');
    pageInfo.style.cssText = `
        font-size: 14px;
        color: var(--muted);
    `;
    pageInfo.textContent = `${pageCount} page${pageCount !== 1 ? 's' : ''}`;

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-primary btn-sm';
    downloadBtn.style.cssText = `
        padding: 6px 12px;
        font-size: 14px;
    `;
    downloadBtn.textContent = 'Download PDF';
    downloadBtn.onclick = () => downloadCurrentPreview();

    controlsContainer.appendChild(pageInfo);
    controlsContainer.appendChild(downloadBtn);
    previewContainer.appendChild(controlsContainer);
}

/**
 * Download the current preview PDF
 */
function downloadCurrentPreview() {
    const previewFrame = document.getElementById('preview');
    if (previewFrame && previewFrame.pdfBlob) {
        const title = previewFrame.pdfTitle || 'Report';
        const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(previewFrame.pdfBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Downloaded preview PDF:', filename);
    } else {
        alert('No PDF available for download');
    }
}

/**
 * Clear preview content
 */
function clearPreview() {
    const previewFrame = document.getElementById('preview');
    if (previewFrame) {
        // Clear iframe source
        previewFrame.src = 'about:blank';

        // Clear stored PDF data
        delete previewFrame.pdfBlob;
        delete previewFrame.pdfTitle;
    }

    // Remove preview controls
    const previewContainer = document.querySelector('#reports-preview .card-body');
    if (previewContainer) {
        const existingControls = previewContainer.querySelector('.preview-controls');
        if (existingControls) existingControls.remove();
    }

    // Remove loading overlay
    hidePreviewLoading();

    // Remove any error messages
    const errorMessage = document.querySelector('.preview-error');
    if (errorMessage) errorMessage.remove();

    // Remove Excel-only message
    const excelMessage = document.querySelector('.excel-only-message');
    if (excelMessage) excelMessage.remove();
}

/**
 * Show preview error message
 * @param {string} message - Error message to display
 */
function showPreviewError(message) {
    clearPreview();

    const previewContainer = document.querySelector('#reports-preview .card-body');
    if (!previewContainer) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'preview-error';
    errorDiv.style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--danger-red);
        background-color: #fdf2f2;
        border: 1px solid #fca5a5;
        border-radius: var(--radius-md);
        margin-bottom: 16px;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ Preview Error</strong><br>
        ${message}
    `;

    previewContainer.insertBefore(errorDiv, previewContainer.firstChild);
}

/**
 * Show Excel-only message in preview area
 */
function showExcelOnlyMessage() {
    const previewContainer = document.querySelector('#reports-preview .card-body');
    if (!previewContainer) return;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'excel-only-message';
    infoDiv.style.cssText = `
        padding: 20px;
        text-align: center;
        color: var(--muted);
        background-color: #f8f9fa;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        margin-bottom: 16px;
    `;
    infoDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
        <strong>Excel Report Generated</strong><br>
        <p style="margin: 8px 0; font-size: 14px;">
            Category reports are exported directly to Excel format.<br>
            Your download should begin automatically.
        </p>
        <small style="color: var(--muted);">
            Excel files include interactive tables and summary sheets
        </small>
    `;

    previewContainer.insertBefore(infoDiv, previewContainer.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (infoDiv.parentNode) {
            infoDiv.remove();
        }
    }, 5000);
}

/**
 * Parse URL parameters
 * @returns {Object} - Parsed URL parameters
 */
function parseURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};

    // Parse all parameters
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }

    console.log('Parsed URL parameters:', params);
    return params;
}

/**
 * Apply parameters from datagrid inquiry
 * @param {Object} params - URL parameters from datagrid
 */
function applyDatagridParameters(params) {
    console.log('Applying datagrid parameters:', params);

    // Filter data based on parameters
    let filteredData = [...promotionsData];

    // Apply selected items filter if present
    if (params.selected) {
        const selectedIds = params.selected.split(',');
        filteredData = promotionsData.filter(item =>
            selectedIds.includes(item.card_id)
        );
        console.log(`Filtered to ${filteredData.length} selected items`);
    } else {
        // Apply search filter
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.card_name.toLowerCase().includes(searchTerm) ||
                item.department.toLowerCase().includes(searchTerm)
            );
        }

        // Apply department filter
        if (params.department) {
            filteredData = filteredData.filter(item =>
                item.department === params.department
            );
        }
    }

    // Apply sort if specified
    if (params.sortField) {
        const field = params.sortField;
        const direction = params.sortDirection || 'asc';

        filteredData.sort((a, b) => {
            let aValue, bValue;

            if (field === 'ctr') {
                aValue = parseFloat((a.card_clicked / a.card_in_view * 100).toFixed(2));
                bValue = parseFloat((b.card_clicked / b.card_in_view * 100).toFixed(2));
            } else if (['card_in_view', 'card_clicked', 'composite_score'].includes(field)) {
                aValue = parseFloat(a[field]) || 0;
                bValue = parseFloat(b[field]) || 0;
            } else {
                aValue = (a[field] || '').toString().toLowerCase();
                bValue = (b[field] || '').toString().toLowerCase();
            }

            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            else if (aValue < bValue) comparison = -1;

            return direction === 'desc' ? comparison * -1 : comparison;
        });
    }

    // Update the global data with filtered results
    promotionsData = filteredData;

    // Pre-select template if specified
    if (params.template) {
        setTimeout(() => {
            const templateSelect = document.getElementById('template');
            if (templateSelect) {
                templateSelect.value = params.template;
                handleTemplateChange(params.template);
            }
        }, 200);
    }

    // Update the options area with context information
    setTimeout(() => {
        showDatagridContext(params);
    }, 300);
}

/**
 * Show context information from datagrid
 * @param {Object} params - URL parameters from datagrid
 */
function showDatagridContext(params) {
    const contextInfo = document.createElement('div');
    contextInfo.className = 'datagrid-context';
    contextInfo.style.cssText = `
        background-color: #e8f4f8;
        border: 1px solid #4272D8;
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 16px;
        font-size: 14px;
    `;

    let contextText = '<strong>📊 Report Context from Datagrid Inquiry</strong><br>';

    if (params.selected) {
        const selectedCount = params.selected.split(',').length;
        contextText += `• Selected Items: ${selectedCount} items<br>`;
    } else {
        contextText += `• Data Source: All filtered items (${params.totalItems || promotionsData.length} total)<br>`;
    }

    if (params.search) {
        contextText += `• Search Filter: "${params.search}"<br>`;
    }

    if (params.department) {
        contextText += `• Department Filter: ${params.department}<br>`;
    }

    if (params.sortField) {
        const sortDirection = params.sortDirection === 'desc' ? 'descending' : 'ascending';
        contextText += `• Sorted by: ${params.sortField} (${sortDirection})<br>`;
    }

    contextText += `• Final Dataset: ${promotionsData.length} items`;

    contextInfo.innerHTML = contextText;

    // Add to the main area
    const mainCard = document.querySelector('#reports-main .card-body');
    if (mainCard) {
        const existingContext = mainCard.querySelector('.datagrid-context');
        if (existingContext) existingContext.remove();

        mainCard.insertBefore(contextInfo, mainCard.firstChild);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all scripts are loaded
    setTimeout(initReportBuilder, 100);
});