/**
 * Shared Navigation Component
 * Framework-independent vanilla JavaScript
 */

const NAVIGATION_ITEMS = [
    { path: 'index.html', label: 'Home', icon: '🏠' },
    { path: 'colors-fonts.html', label: 'Colors & Fonts', icon: '🎨' },
    { path: 'price-stickers.html', label: 'Price Stickers', icon: '🏷️' },
    { path: 'deal-types.html', label: 'Deal Types', icon: '💰' },
    { path: 'components.html', label: 'Components', icon: '🧩' },
    { path: 'themes.html', label: 'Themes', icon: '🎭' },
    { path: 'extracted-components.html', label: 'Extracted', icon: '📦' },
    { path: 'config-export.html', label: 'Export Config', icon: '⚙️' },
    { path: 'industries/grocery.html', label: 'Grocery', icon: '🛒' },
    { path: 'industries/hardware.html', label: 'Hardware', icon: '🔨' },
    { path: 'industries/liquor.html', label: 'Liquor', icon: '🍷' }
];

class SharedNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        // Handle both root files and subdirectory files
        const parts = path.split('/');
        const filename = parts[parts.length - 1] || 'index.html';
        const dir = parts[parts.length - 2];

        // For industry pages, include the directory
        if (dir === 'industries') {
            return `industries/${filename}`;
        }

        return filename;
    }

    getBreadcrumbs() {
        const currentItem = NAVIGATION_ITEMS.find(item => item.path === this.currentPage);
        if (!currentItem || currentItem.path === 'index.html') {
            return [{ path: 'index.html', label: 'Home' }];
        }
        return [
            { path: 'index.html', label: 'Home' },
            { path: currentItem.path, label: currentItem.label }
        ];
    }

    createNavHTML() {
        const breadcrumbs = this.getBreadcrumbs();
        const inSubdir = this.currentPage.includes('/');
        const pathPrefix = inSubdir ? '../' : '';

        return `
            <nav class="shared-nav">
                <div class="nav-container">
                    <div class="nav-header">
                        <a href="${pathPrefix}index.html" class="nav-logo">
                            <span class="logo-icon">📘</span>
                            <span class="logo-text">Digital Circular Style Guide</span>
                        </a>
                        <button class="nav-toggle" onclick="sharedNav.toggleMenu()" aria-label="Toggle navigation">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>

                    <div class="nav-breadcrumbs">
                        ${breadcrumbs.map((crumb, index) => `
                            <a href="${pathPrefix}${crumb.path}" class="breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}">
                                ${crumb.label}
                            </a>
                            ${index < breadcrumbs.length - 1 ? '<span class="breadcrumb-separator">›</span>' : ''}
                        `).join('')}
                    </div>

                    <ul class="nav-links">
                        ${NAVIGATION_ITEMS.map(item => `
                            <li>
                                <a href="${pathPrefix}${item.path}" class="nav-link ${item.path === this.currentPage ? 'active' : ''}">
                                    <span class="nav-icon">${item.icon}</span>
                                    <span class="nav-label">${item.label}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </nav>
        `;
    }

    createStyles() {
        return `
            <style>
                .shared-nav {
                    background: white;
                    border-bottom: 2px solid #E4E5E5;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .nav-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 0;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: #1D2325;
                    font-weight: 700;
                    font-size: 1.25rem;
                    transition: color 0.2s;
                }

                .nav-logo:hover {
                    color: #E2141E;
                }

                .logo-icon {
                    font-size: 2rem;
                }

                .logo-text {
                    display: none;
                }

                .nav-toggle {
                    display: none;
                    flex-direction: column;
                    gap: 4px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .nav-toggle span {
                    display: block;
                    width: 24px;
                    height: 2px;
                    background: #1D2325;
                    transition: all 0.3s;
                }

                .nav-breadcrumbs {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 0;
                    font-size: 0.875rem;
                    border-top: 1px solid #E4E5E5;
                }

                .breadcrumb-item {
                    color: #4A5358;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .breadcrumb-item:hover {
                    color: #E2141E;
                }

                .breadcrumb-item.active {
                    color: #E2141E;
                    font-weight: 600;
                }

                .breadcrumb-separator {
                    color: #8E9497;
                }

                .nav-links {
                    display: flex;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    gap: 0.5rem;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                }

                .nav-links::-webkit-scrollbar {
                    height: 4px;
                }

                .nav-links::-webkit-scrollbar-track {
                    background: #F2F3F3;
                }

                .nav-links::-webkit-scrollbar-thumb {
                    background: #8E9497;
                    border-radius: 2px;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    text-decoration: none;
                    color: #4A5358;
                    border-radius: 8px 8px 0 0;
                    transition: all 0.2s;
                    white-space: nowrap;
                    border-bottom: 3px solid transparent;
                }

                .nav-link:hover {
                    background: #F2F3F3;
                    color: #1D2325;
                }

                .nav-link.active {
                    background: #F2F3F3;
                    color: #E2141E;
                    font-weight: 600;
                    border-bottom-color: #E2141E;
                }

                .nav-icon {
                    font-size: 1.25rem;
                }

                .nav-label {
                    font-size: 0.9375rem;
                }

                @media (min-width: 768px) {
                    .logo-text {
                        display: inline;
                    }
                }

                @media (max-width: 768px) {
                    .nav-container {
                        padding: 0 1rem;
                    }

                    .nav-toggle {
                        display: flex;
                    }

                    .nav-links {
                        max-height: 0;
                        overflow: hidden;
                        flex-direction: column;
                        transition: max-height 0.3s ease;
                    }

                    .nav-links.open {
                        max-height: 500px;
                        padding: 1rem 0;
                    }

                    .nav-link {
                        border-radius: 8px;
                        border-bottom: none;
                    }

                    .nav-link.active {
                        background: rgba(226, 20, 30, 0.1);
                    }
                }
            </style>
        `;
    }

    toggleMenu() {
        const links = document.querySelector('.nav-links');
        links.classList.toggle('open');
    }

    init() {
        // Insert styles
        const styleElement = document.createElement('div');
        styleElement.innerHTML = this.createStyles();
        document.head.appendChild(styleElement.firstElementChild);

        // Insert navigation
        const navHTML = this.createNavHTML();
        const existingNav = document.querySelector('.nav-header');

        if (existingNav) {
            existingNav.parentElement.innerHTML = navHTML;
        } else {
            const nav = document.createElement('div');
            nav.innerHTML = navHTML;
            document.body.insertBefore(nav.firstElementChild, document.body.firstChild);
        }
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sharedNav = new SharedNavigation();
    });
} else {
    window.sharedNav = new SharedNavigation();
}
