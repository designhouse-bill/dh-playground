/**
 * Responsive Preview Component
 * Allows viewing components at different device sizes
 */

const DEVICE_SIZES = {
    mobile: { width: 375, height: 667, label: '📱 Mobile', icon: '📱' },
    tablet: { width: 768, height: 1024, label: '📱 Tablet', icon: '📱' },
    desktop: { width: 1440, height: 900, label: '🖥️ Desktop', icon: '🖥️' }
};

class ResponsivePreview {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.currentDevice = 'desktop';
        this.content = null;
        this.init();
    }

    createHTML() {
        return `
            <div class="responsive-preview">
                <div class="preview-controls">
                    <div class="device-selector">
                        ${Object.entries(DEVICE_SIZES).map(([key, device]) => `
                            <button
                                class="device-btn ${key === this.currentDevice ? 'active' : ''}"
                                data-device="${key}"
                                onclick="responsivePreview.setDevice('${key}')"
                            >
                                <span class="device-icon">${device.icon}</span>
                                <span class="device-label">${device.label}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="preview-info">
                        <span class="preview-dimensions" id="previewDimensions"></span>
                    </div>
                </div>
                <div class="preview-frame-container">
                    <div class="preview-frame" id="previewFrame">
                        <div class="preview-content" id="previewContent"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createStyles() {
        return `
            <style>
                .responsive-preview {
                    background: #F2F3F3;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin: 2rem 0;
                }

                .preview-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .device-selector {
                    display: flex;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.25rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .device-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #4A5358;
                    transition: all 0.2s;
                }

                .device-btn:hover {
                    background: #F2F3F3;
                    color: #1D2325;
                }

                .device-btn.active {
                    background: #E2141E;
                    color: white;
                }

                .device-icon {
                    font-size: 1.25rem;
                }

                .device-label {
                    display: none;
                }

                .preview-info {
                    background: white;
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .preview-dimensions {
                    font-family: 'Monaco', 'Courier New', monospace;
                    font-size: 0.875rem;
                    color: #4A5358;
                }

                .preview-frame-container {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    overflow: auto;
                    min-height: 400px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                }

                .preview-frame {
                    background: white;
                    border: 1px solid #E4E5E5;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    overflow: auto;
                }

                .preview-content {
                    padding: 1rem;
                    min-height: 100%;
                }

                @media (min-width: 640px) {
                    .device-label {
                        display: inline;
                    }
                }

                @media (max-width: 768px) {
                    .responsive-preview {
                        padding: 1rem;
                    }

                    .preview-frame-container {
                        padding: 1rem;
                    }
                }
            </style>
        `;
    }

    setDevice(deviceKey) {
        this.currentDevice = deviceKey;
        this.updatePreview();
        this.updateControls();
    }

    updatePreview() {
        const frame = document.getElementById('previewFrame');
        const device = DEVICE_SIZES[this.currentDevice];

        if (this.currentDevice === 'desktop') {
            frame.style.width = '100%';
            frame.style.maxWidth = device.width + 'px';
        } else {
            frame.style.width = device.width + 'px';
            frame.style.maxWidth = '100%';
        }

        this.updateDimensions();
    }

    updateControls() {
        document.querySelectorAll('.device-btn').forEach(btn => {
            const device = btn.dataset.device;
            btn.classList.toggle('active', device === this.currentDevice);
        });
    }

    updateDimensions() {
        const frame = document.getElementById('previewFrame');
        const dimensions = document.getElementById('previewDimensions');
        if (dimensions && frame) {
            const width = frame.offsetWidth;
            const device = DEVICE_SIZES[this.currentDevice];
            dimensions.textContent = `${width}px × ${device.height}px`;
        }
    }

    setContent(html) {
        const content = document.getElementById('previewContent');
        if (content) {
            content.innerHTML = html;
        }
    }

    init() {
        // Insert styles
        const styleElement = document.createElement('div');
        styleElement.innerHTML = this.createStyles();
        document.head.appendChild(styleElement.firstElementChild);

        // Insert preview HTML
        this.container.innerHTML = this.createHTML();

        // Initial update
        this.updatePreview();

        // Update dimensions on window resize
        window.addEventListener('resize', () => this.updateDimensions());
    }
}

// Make it globally available
window.ResponsivePreview = ResponsivePreview;
