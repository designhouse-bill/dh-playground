/**
 * Centralized Error Handling Utility
 * Provides consistent error handling and user feedback across the dashboard
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxErrorLog = 50; // Keep last 50 errors
    }

    /**
     * Log error with timestamp and context
     * @param {Error|string} error - Error object or message
     * @param {string} context - Context where error occurred
     * @param {Object} metadata - Additional error metadata
     */
    logError(error, context, metadata = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack || null,
            context: context,
            metadata: metadata,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(errorEntry);

        // Keep only the most recent errors
        if (this.errorLog.length > this.maxErrorLog) {
            this.errorLog.shift();
        }

        // Console log for debugging
        console.error(`🚨 Error in ${context}:`, error, metadata);
    }

    /**
     * Show user-friendly error message
     * @param {string} message - User-friendly error message
     * @param {string} containerId - Container to show error in
     * @param {Object} options - Display options
     */
    showError(message, containerId = 'error-container', options = {}) {
        const {
            type = 'error',
            showRetry = false,
            retryCallback = null,
            timeout = 0,
            persistent = false
        } = options;

        let container = document.getElementById(containerId);

        // Create error container if it doesn't exist
        if (!container) {
            container = this.createErrorContainer(containerId);
        }

        // Remove existing error messages unless persistent
        if (!persistent) {
            this.clearErrors(containerId);
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = `error-message error-${type}`;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');

        errorDiv.style.cssText = `
            padding: 16px;
            margin: 12px 0;
            border-radius: 8px;
            border: 1px solid;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
            ${this.getErrorTypeStyles(type)}
        `;

        const messageContent = document.createElement('div');
        messageContent.style.cssText = 'display: flex; align-items: center; flex: 1;';

        const icon = this.getErrorIcon(type);
        messageContent.innerHTML = `
            <span style="margin-right: 12px; font-size: 18px;">${icon}</span>
            <span>${message}</span>
        `;

        const actionContainer = document.createElement('div');
        actionContainer.style.cssText = 'display: flex; gap: 8px; margin-left: 16px;';

        // Add retry button if requested
        if (showRetry && retryCallback) {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-sm btn-secondary';
            retryBtn.textContent = 'Retry';
            retryBtn.style.cssText = 'margin-left: 8px; padding: 4px 12px;';
            retryBtn.onclick = () => {
                try {
                    retryCallback();
                    this.clearErrors(containerId);
                } catch (error) {
                    this.logError(error, 'Retry Button');
                    this.showError('Retry failed. Please try again.', containerId);
                }
            };
            actionContainer.appendChild(retryBtn);
        }

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: inherit;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = () => errorDiv.remove();
        actionContainer.appendChild(closeBtn);

        errorDiv.appendChild(messageContent);
        errorDiv.appendChild(actionContainer);
        container.appendChild(errorDiv);

        // Auto-remove after timeout
        if (timeout > 0) {
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, timeout);
        }

        return errorDiv;
    }

    /**
     * Create error container if it doesn't exist
     * @param {string} containerId - Container ID
     */
    createErrorContainer(containerId) {
        const container = document.createElement('div');
        container.id = containerId;
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            max-width: 400px;
            z-index: 1000;
            pointer-events: none;
        `;
        container.style.pointerEvents = 'auto';

        // Add to body if no specific parent found
        document.body.appendChild(container);
        return container;
    }

    /**
     * Get error type styles
     * @param {string} type - Error type
     */
    getErrorTypeStyles(type) {
        const styles = {
            error: `
                background-color: #fef2f2;
                border-color: #fca5a5;
                color: #991b1b;
            `,
            warning: `
                background-color: #fffbeb;
                border-color: #fcd34d;
                color: #92400e;
            `,
            info: `
                background-color: #eff6ff;
                border-color: #93c5fd;
                color: #1e40af;
            `,
            success: `
                background-color: #f0fdf4;
                border-color: #86efac;
                color: #166534;
            `
        };
        return styles[type] || styles.error;
    }

    /**
     * Get error icon
     * @param {string} type - Error type
     */
    getErrorIcon(type) {
        const icons = {
            error: '🚨',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };
        return icons[type] || icons.error;
    }

    /**
     * Clear all error messages
     * @param {string} containerId - Container to clear
     */
    clearErrors(containerId = 'error-container') {
        const container = document.getElementById(containerId);
        if (container) {
            const errorMessages = container.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.remove());
        }
    }

    /**
     * Handle data loading errors
     * @param {Error} error - Error object
     * @param {string} dataType - Type of data being loaded
     * @param {Function} retryCallback - Function to retry loading
     */
    handleDataError(error, dataType, retryCallback = null) {
        this.logError(error, `Data Loading - ${dataType}`, { dataType });

        const message = `Failed to load ${dataType}. ${this.getErrorSuggestion(error)}`;

        this.showError(message, 'error-container', {
            showRetry: !!retryCallback,
            retryCallback: retryCallback,
            timeout: 10000
        });
    }

    /**
     * Handle validation errors
     * @param {string} field - Field with validation error
     * @param {string} message - Validation message
     */
    handleValidationError(field, message) {
        this.logError(message, `Validation - ${field}`, { field });

        // Show error near the field if possible
        const fieldElement = document.getElementById(field) || document.querySelector(`[name="${field}"]`);

        if (fieldElement) {
            this.showFieldError(fieldElement, message);
        } else {
            this.showError(`Validation Error: ${message}`, 'error-container', {
                type: 'warning',
                timeout: 5000
            });
        }
    }

    /**
     * Show error near a specific field
     * @param {Element} fieldElement - Field element
     * @param {string} message - Error message
     */
    showFieldError(fieldElement, message) {
        // Remove existing field errors
        const existingError = fieldElement.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        const errorSpan = document.createElement('span');
        errorSpan.className = 'field-error';
        errorSpan.style.cssText = `
            color: #dc2626;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        `;
        errorSpan.textContent = message;

        fieldElement.style.borderColor = '#dc2626';
        fieldElement.parentNode.appendChild(errorSpan);

        // Remove error styling on input
        fieldElement.addEventListener('input', function removeError() {
            fieldElement.style.borderColor = '';
            if (errorSpan.parentNode) {
                errorSpan.remove();
            }
            fieldElement.removeEventListener('input', removeError);
        });
    }

    /**
     * Get error suggestion based on error type
     * @param {Error} error - Error object
     */
    getErrorSuggestion(error) {
        const message = error.message || error.toString();

        if (message.includes('network') || message.includes('fetch')) {
            return 'Please check your internet connection and try again.';
        }

        if (message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }

        if (message.includes('404') || message.includes('not found')) {
            return 'Resource not found. Please contact support.';
        }

        if (message.includes('500') || message.includes('server')) {
            return 'Server error. Please try again later.';
        }

        return 'Please try again or contact support if the problem persists.';
    }

    /**
     * Handle navigation errors
     * @param {Error} error - Navigation error
     * @param {string} targetUrl - URL being navigated to
     */
    handleNavigationError(error, targetUrl) {
        this.logError(error, 'Navigation', { targetUrl });

        this.showError(
            `Navigation failed. Unable to load "${targetUrl}". Please try again.`,
            'error-container',
            {
                type: 'warning',
                showRetry: true,
                retryCallback: () => {
                    try {
                        window.location.href = targetUrl;
                    } catch (retryError) {
                        this.logError(retryError, 'Navigation Retry');
                    }
                }
            }
        );
    }

    /**
     * Get error log for debugging
     */
    getErrorLog() {
        return this.errorLog;
    }

    /**
     * Export error log as JSON
     */
    exportErrorLog() {
        const dataStr = JSON.stringify(this.errorLog, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Create global error handler instance
window.ErrorHandler = new ErrorHandler();

// Add CSS for error animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .error-message {
        transition: all 0.3s ease;
    }

    .error-message:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;
document.head.appendChild(style);

