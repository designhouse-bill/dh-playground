/**
 * Overview V2 - Circular Engagement Treemap
 * Fresh implementation with category-level view and drill-down to promotions
 */

// Category display name mapping
const CATEGORY_DISPLAY_NAMES = {
    'featured_deals': 'Featured Deals',
    'fresh_market': 'Fresh Market',
    'meat_seafood': 'Meat & Seafood',
    'dairy_frozen': 'Dairy & Frozen',
    'grocery_essentials': 'Grocery Essentials',
    'beverages_snacks': 'Beverages & Snacks',
    'health_beauty': 'Health & Beauty',
    'home_seasonal': 'Home & Seasonal'
};

// Color palette for categories - matches main.css chart colors
const CHART_COLORS = [
    '#4272D8', // Primary Blue (chart-color-1)
    '#B8D64D', // Success Green (chart-color-2)
    '#F39C12', // Warning Amber (chart-color-3)
    '#E74C3C', // Danger Red (chart-color-4)
    '#9B59B6', // Accent Purple (chart-color-5)
    '#06B6D4', // Cyan (chart-color-6)
    '#84CC16', // Lime (chart-color-7)
    '#F97316'  // Orange (chart-color-8)
];

let treemapChart = null;
let currentLevel = 'categories'; // 'categories' or 'promotions'
let currentCategory = null;

/**
 * Initialize Overview V2 Dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    if (!window.mockDatabase || !window.mockDatabase.promotions) {
        console.error('❌ Mock data not loaded');
        return;
    }

    console.log('✅ Overview V2 initializing');

    // Calculate and update KPI metrics
    updateKPIMetrics();

    // Initialize treemap after a short delay to ensure DOM is fully rendered
    setTimeout(() => {
        initializeTreemap();
    }, 100);
});

/**
 * Calculate and update KPI metrics
 */
function updateKPIMetrics() {
    const promotions = window.mockDatabase.promotions;

    const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const totalAddToList = promotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);

    // Estimate sessions
    const estimatedSessions = Math.round(totalViews / 10);

    // Calculate average session duration
    const avgClicksPerSession = totalClicks / estimatedSessions;
    const avgAddToListPerSession = totalAddToList / estimatedSessions;
    const avgDurationSeconds = Math.round(30 + (avgClicksPerSession * 15) + (avgAddToListPerSession * 20));

    // Format as MM:SS
    const minutes = Math.floor(avgDurationSeconds / 60);
    const seconds = avgDurationSeconds % 60;
    const avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Calculate circular performance
    const circularPerformance = Math.round((totalClicks + totalAddToList) / estimatedSessions * 100);

    // Update DOM
    const perfTile = document.querySelector('#circular-performance-week .big-number');
    if (perfTile) perfTile.textContent = circularPerformance + '%';

    const sessionsTile = document.querySelector('#total-sessions .big-number');
    if (sessionsTile) sessionsTile.textContent = estimatedSessions.toLocaleString();

    const durationTile = document.querySelector('#avg-session-duration .big-number');
    if (durationTile) durationTile.textContent = avgSessionDuration;

    console.log('📊 KPI Metrics updated');
}

/**
 * Initialize treemap chart
 */
function initializeTreemap() {
    const chartContainer = document.getElementById('treemap-chart');
    if (!chartContainer) {
        console.error('❌ Treemap container not found');
        return;
    }

    console.log('📊 Treemap container found:', chartContainer);
    console.log('📊 Container dimensions:', chartContainer.offsetWidth, 'x', chartContainer.offsetHeight);
    console.log('📊 Parent dimensions:', chartContainer.parentElement.offsetWidth);

    // Initialize ECharts with explicit canvas renderer
    try {
        treemapChart = echarts.init(chartContainer, null, {
            renderer: 'canvas',
            devicePixelRatio: window.devicePixelRatio || 1
        });
        console.log('📊 ECharts instance created with initial width:', treemapChart.getWidth());
        console.log('📊 ECharts version:', echarts.version);
    } catch (error) {
        console.error('❌ Failed to initialize ECharts:', error);
        return;
    }

    // Show category-level view initially
    showCategoryView();

    // Force resize after DOM is fully rendered to fix width issue
    setTimeout(() => {
        if (treemapChart) {
            console.log('📊 Container width before resize:', chartContainer.offsetWidth);
            treemapChart.resize();
            console.log('📊 Chart width after resize:', treemapChart.getWidth());
        }
    }, 300);

    // Handle window resize
    window.addEventListener('resize', () => {
        if (treemapChart) treemapChart.resize();
    });

    console.log('✅ Treemap initialized');
}

/**
 * Show category-level treemap view
 */
function showCategoryView() {
    currentLevel = 'categories';
    currentCategory = null;

    // Remove any click handlers from container
    const chartContainer = document.getElementById('treemap-chart');
    if (chartContainer) {
        const newContainer = chartContainer.cloneNode(true);
        chartContainer.parentNode.replaceChild(newContainer, chartContainer);
        // Reinitialize chart on new container
        treemapChart = echarts.init(newContainer);
    }

    const promotions = window.mockDatabase.promotions;

    // Aggregate by category
    const categoryMap = {};

    promotions.forEach(promo => {
        const category = promo.marketing_category || promo.category || 'uncategorized';

        if (!categoryMap[category]) {
            categoryMap[category] = {
                name: CATEGORY_DISPLAY_NAMES[category] || category,
                categoryKey: category,
                views: 0,
                clicks: 0,
                addToList: 0,
                promoCount: 0
            };
        }

        categoryMap[category].views += promo.card_in_view || 0;
        categoryMap[category].clicks += promo.card_clicked || 0;
        categoryMap[category].addToList += promo.added_to_list || 0;
        categoryMap[category].promoCount += 1;
    });

    // Convert to array
    const categoryData = Object.values(categoryMap).map((cat, index) => {
        const engagement = cat.views + (cat.clicks * 3) + (cat.addToList * 5);
        const ctr = cat.views > 0 ? ((cat.clicks / cat.views) * 100).toFixed(1) : 0;
        const atlRate = cat.clicks > 0 ? ((cat.addToList / cat.clicks) * 100).toFixed(1) : 0;

        return {
            name: cat.name,
            value: engagement,
            categoryKey: cat.categoryKey,
            views: cat.views,
            clicks: cat.clicks,
            addToList: cat.addToList,
            promoCount: cat.promoCount,
            ctr: ctr,
            atlRate: atlRate,
            itemStyle: {
                color: CHART_COLORS[index % CHART_COLORS.length]
            }
        };
    });

    // Sort by engagement
    categoryData.sort((a, b) => b.value - a.value);

    console.log('📊 Category data prepared:', categoryData.length, 'items');
    console.log('📊 First category sample:', categoryData[0]);
    console.log('📊 Data values:', categoryData.map(c => ({ name: c.name, value: c.value })));

    // Update summary
    updateTreemapSummary(categoryData);

    // Configure treemap
    const option = {
        tooltip: {
            formatter: function(params) {
                const d = params.data;
                return `
                    <div style="padding: 8px;">
                        <strong style="font-size: 16px; display: block; margin-bottom: 8px;">
                            ${d.name}
                        </strong>
                        <div style="font-size: 13px; line-height: 1.8;">
                            <div><strong>Promotions:</strong> ${d.promoCount.toLocaleString()}</div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #ddd;">
                                <strong>Views:</strong> ${d.views.toLocaleString()}<br>
                                <strong>Clicks:</strong> ${d.clicks.toLocaleString()}<br>
                                <strong>Add to List:</strong> ${d.addToList.toLocaleString()}
                            </div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #ddd;">
                                <strong>CTR:</strong> ${d.ctr}%<br>
                                <strong>ATL Rate:</strong> ${d.atlRate}%
                            </div>
                            <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; color: #666; font-style: italic; font-size: 12px;">
                                Click to view promotions →
                            </div>
                        </div>
                    </div>
                `;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#ccc',
            borderWidth: 1,
            textStyle: {
                color: '#333'
            }
        },
        series: [{
            type: 'treemap',
            data: categoryData,
            roam: false,
            nodeClick: false, // Disable default click, we'll handle it
            breadcrumb: {
                show: false
            },
            label: {
                show: true,
                formatter: function(params) {
                    const d = params.data;
                    return `${d.name}\n${d.promoCount.toLocaleString()} items`;
                },
                fontSize: 16,
                fontWeight: 'bold',
                color: '#fff',
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowBlur: 3,
                textShadowOffsetY: 1
            },
            upperLabel: {
                show: false
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 3,
                gapWidth: 3
            },
            emphasis: {
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 5,
                    shadowBlur: 15,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                },
                label: {
                    fontSize: 18
                }
            },
            levels: [{
                itemStyle: {
                    borderWidth: 0,
                    gapWidth: 5
                }
            }]
        }]
    };

    console.log('📊 About to set treemap option with', categoryData.length, 'categories');
    console.log('📊 Option structure:', JSON.stringify(option, null, 2).substring(0, 500));

    // First try a minimal test option to see if rendering works at all
    const testOption = {
        series: [{
            type: 'treemap',
            data: [{
                name: 'Test',
                value: 100,
                itemStyle: { color: '#ff0000' }
            }]
        }]
    };

    console.log('📊 Testing with minimal treemap first...');
    console.log('📊 Container computed style:', window.getComputedStyle(chartContainer).display);
    console.log('📊 Container visibility:', window.getComputedStyle(chartContainer).visibility);
    console.log('📊 Container opacity:', window.getComputedStyle(chartContainer).opacity);

    treemapChart.setOption(testOption);

    // Try to manually trigger render
    treemapChart.resize();

    console.log('📊 Checking treemapChart._dom:', treemapChart.getDom());
    console.log('📊 TreemapChart width/height:', treemapChart.getWidth(), 'x', treemapChart.getHeight());

    setTimeout(() => {
        const testCanvas = document.getElementById('treemap-chart').querySelectorAll('canvas');
        console.log('📊 Test canvas count:', testCanvas.length);
        console.log('📊 Container children:', chartContainer.children.length);
        console.log('📊 Container first child:', chartContainer.children[0]);

        if (testCanvas.length === 0) {
            console.error('❌ Even simple treemap failed to render canvas. ECharts rendering is broken.');
            console.error('Container HTML:', chartContainer.innerHTML);
        } else {
            console.log('✅ Test treemap rendered! Now trying full data...');
        }
    }, 100);

    // Now set the real option
    setTimeout(() => {
        try {
            treemapChart.setOption(option, true); // true = notMerge, replace all options
            console.log('📊 setOption completed successfully');
        } catch (error) {
            console.error('❌ setOption failed:', error);
            console.error('Error stack:', error.stack);
        }
    }, 200);

    // Check if chart rendered anything
    setTimeout(() => {
        const chartDom = document.getElementById('treemap-chart');
        const svgElements = chartDom.querySelectorAll('svg, canvas');
        const canvasElements = chartDom.querySelectorAll('canvas');
        console.log('📊 Chart rendered elements:', svgElements.length, 'svg/canvas elements');
        console.log('📊 Canvas elements specifically:', canvasElements.length);
        console.log('📊 Chart DOM innerHTML length:', chartDom.innerHTML.length);

        if (canvasElements.length > 0) {
            console.log('📊 Canvas dimensions:', canvasElements[0].width, 'x', canvasElements[0].height);
        }
    }, 50);

    // Force resize after setting option to ensure proper rendering
    setTimeout(() => {
        if (treemapChart) {
            treemapChart.resize();
            console.log('📊 Treemap resized after render');
        }
    }, 100);

    // Add click handler to drill down
    treemapChart.off('click');
    treemapChart.on('click', function(params) {
        if (params.data && params.data.categoryKey) {
            showPromotionView(params.data.categoryKey, params.data.name);
        }
    });

    console.log('📊 Category view rendered:', categoryData.length, 'categories');
}

/**
 * Show promotion-level treemap view for a specific category
 */
function showPromotionView(categoryKey, categoryName) {
    currentLevel = 'promotions';
    currentCategory = { key: categoryKey, name: categoryName };

    const promotions = window.mockDatabase.promotions.filter(p => {
        const cat = p.marketing_category || p.category || 'uncategorized';
        return cat === categoryKey;
    });

    // Prepare promotion data
    const promoData = promotions.map((promo, index) => {
        const engagement = (promo.card_in_view || 0) + ((promo.card_clicked || 0) * 3) + ((promo.added_to_list || 0) * 5);
        const ctr = promo.card_in_view > 0 ? ((promo.card_clicked / promo.card_in_view) * 100).toFixed(1) : 0;

        return {
            name: promo.card_name || promo.product_name || promo.productName || 'Unknown Product',
            value: engagement,
            views: promo.card_in_view || 0,
            clicks: promo.card_clicked || 0,
            addToList: promo.added_to_list || 0,
            ctr: ctr,
            itemStyle: {
                color: CHART_COLORS[index % CHART_COLORS.length]
            }
        };
    });

    // Sort by engagement and limit to top 25
    promoData.sort((a, b) => b.value - a.value);
    const displayData = promoData.slice(0, 25);

    // Configure treemap
    const option = {
        grid: {
            top: 60,
            bottom: 20,
            left: 20,
            right: 20
        },
        title: [
            {
                text: `← Back to Categories`,
                left: 10,
                top: 10,
                textStyle: {
                    fontSize: 14,
                    color: '#4272D8',
                    fontWeight: 'normal',
                    textDecoration: 'underline'
                },
                triggerEvent: true,
                cursor: 'pointer'
            },
            {
                text: categoryName,
                left: 10,
                top: 35,
                textStyle: {
                    fontSize: 20,
                    color: '#0f172a',
                    fontWeight: 'bold'
                }
            },
            {
                text: `Showing top 25 of ${promoData.length} promotions`,
                right: 10,
                top: 35,
                textStyle: {
                    fontSize: 12,
                    color: '#6b7280',
                    fontWeight: 'normal'
                }
            }
        ],
        toolbox: {
            show: true,
            feature: {
                restore: {
                    show: true,
                    title: 'Reset View'
                }
            },
            right: 10,
            top: 8
        },
        tooltip: {
            formatter: function(params) {
                const d = params.data;
                return `
                    <div style="padding: 8px;">
                        <strong style="font-size: 14px; display: block; margin-bottom: 8px;">
                            ${d.name}
                        </strong>
                        <div style="font-size: 12px; line-height: 1.8;">
                            <div><strong>Views:</strong> ${d.views.toLocaleString()}</div>
                            <div><strong>Clicks:</strong> ${d.clicks.toLocaleString()}</div>
                            <div><strong>Add to List:</strong> ${d.addToList.toLocaleString()}</div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #ddd;">
                                <strong>CTR:</strong> ${d.ctr}%
                            </div>
                        </div>
                    </div>
                `;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#ccc',
            borderWidth: 1,
            textStyle: {
                color: '#333'
            }
        },
        series: [{
            type: 'treemap',
            data: displayData,
            top: 60,
            bottom: 20,
            roam: 'move', // Enable pan/zoom with mouse
            breadcrumb: {
                show: false // Hide breadcrumb since we're using custom titles
            },
            label: {
                show: true,
                formatter: function(params) {
                    const d = params.data;
                    const name = d.name;
                    // Truncate long names
                    const displayName = name.length > 25 ? name.substring(0, 22) + '...' : name;
                    return `${displayName}\nCTR: ${d.ctr}%`;
                },
                fontSize: 11,
                fontWeight: '600',
                color: '#fff',
                overflow: 'truncate',
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowBlur: 2,
                lineHeight: 14
            },
            upperLabel: {
                show: true,
                height: 25,
                fontSize: 12,
                color: '#fff'
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                gapWidth: 2
            },
            emphasis: {
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                },
                label: {
                    fontSize: 13
                }
            },
            levels: [{
                itemStyle: {
                    borderWidth: 0,
                    gapWidth: 3
                },
                upperLabel: {
                    show: false
                }
            }]
        }]
    };

    treemapChart.setOption(option, true);

    // Add click handler for back button - try both methods
    treemapChart.off('click');

    // Method 1: Listen for title clicks
    treemapChart.on('click', function(params) {
        console.log('Click detected:', params);

        // Check if clicking on the first title (back button)
        if (params.componentType === 'title' && params.componentIndex === 0) {
            console.log('Back button clicked');
            showCategoryView();
        }
    });

    // Method 2: Add a click handler to the chart container for the back button area
    const chartContainer = document.getElementById('treemap-chart');
    const clickHandler = function(e) {
        // Check if click is in the top-left area (back button region)
        const rect = chartContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Back button area: left 10px, top 10px, roughly 200px wide, 30px tall
        if (x >= 10 && x <= 210 && y >= 10 && y <= 40) {
            console.log('Back button area clicked (manual detection)');
            showCategoryView();
        }
    };

    // Remove old listener if exists
    chartContainer.removeEventListener('click', clickHandler);
    // Add new listener
    chartContainer.addEventListener('click', clickHandler);

    console.log('📊 Promotion view rendered: showing top 25 of', promoData.length, 'promotions in', categoryName);
}

/**
 * Update treemap summary statistics
 */
function updateTreemapSummary(categoryData) {
    const totalCategories = categoryData.length;
    const totalPromotions = categoryData.reduce((sum, cat) => sum + cat.promoCount, 0);
    const totalViews = categoryData.reduce((sum, cat) => sum + cat.views, 0);
    const totalClicks = categoryData.reduce((sum, cat) => sum + cat.clicks, 0);
    const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

    document.getElementById('summary-categories').textContent = totalCategories;
    document.getElementById('summary-promotions').textContent = totalPromotions.toLocaleString();
    document.getElementById('summary-views').textContent = totalViews.toLocaleString();
    document.getElementById('summary-clicks').textContent = totalClicks.toLocaleString();
    document.getElementById('summary-ctr').textContent = avgCTR + '%';

    console.log('📊 Summary updated');
}
