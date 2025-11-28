/**
 * Overview V3 - Analytics Dashboard
 * Implements all charts and metrics for the V3 overview page
 */

// Dashboard chart color palette - matches main.css chart colors
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

// Category display name mapping
const CATEGORY_DISPLAY_NAMES = {
    'featured': 'Featured',
    'farm_fresh': 'Farm Fresh',
    'good_food_matters': 'Good Food Matters',
    'custom_cuts': 'Custom Cuts',
    'deals_for_days': 'Deals For Days',
    'beef_pork_chicken': 'Beef Pork Chicken',
    'fresh_is_a_promise': 'Fresh Is A Promise',
    'flavors_of_the_sea': 'Flavors Of The Sea',
    'everyday_living': 'Everyday Living',
    'weekly_bogos': "Weekly Bogo's",
    'beverages': 'Beverages',
    'beer_and_wine': 'Beer And Wine',
    'great_quality_low_prices': 'Great Quality Low Prices',
    'banners': 'Banners',
    'organic_produce': 'Organic Produce',
    'flowers': 'Flowers',
    'household_goods': 'Household Goods'
};

/**
 * Initialize Overview V3 Dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    if (!window.mockDatabase || !window.mockDatabase.promotions) {
        console.error('❌ Mock data not loaded');
        return;
    }

    const promotions = window.mockDatabase.promotions;
    console.log('✅ Overview V3 initializing with', promotions.length, 'promotions');

    // Calculate and update KPI metrics
    updateKPIMetrics(promotions);

    // Initialize all charts
    initEngagementDistributionChart(promotions);
    initTopPromotionsChart(promotions);
    initCategoryEngagementChart(promotions);
    initStoreEngagementChart(promotions);
    initPromoEngagementChart(promotions);
    initDealTypeChart(promotions);
    initCardSizeChart(promotions);

    console.log('✅ Overview V3 initialized');
});

/**
 * Calculate and update KPI metrics
 */
function updateKPIMetrics(promotions) {
    // Calculate totals
    const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const totalAddToList = promotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);

    // Estimate sessions (using same logic as V2)
    const estimatedSessions = Math.round(totalViews / 10);

    // Calculate circular engagement
    const circularEngagement = totalViews + totalClicks + totalAddToList;

    // Calculate circular performance (engagement / sessions)
    const circularPerformance = (circularEngagement / estimatedSessions).toFixed(2);

    // Calculate average session duration
    const avgClicksPerSession = totalClicks / estimatedSessions;
    const avgAddToListPerSession = totalAddToList / estimatedSessions;
    const avgDurationSeconds = Math.round(30 + (avgClicksPerSession * 15) + (avgAddToListPerSession * 20));

    // Format duration as minutes and seconds
    const minutes = Math.floor(avgDurationSeconds / 60);
    const seconds = avgDurationSeconds % 60;
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update DOM
    document.getElementById('circular-performance-value').textContent = circularPerformance;
    document.getElementById('total-sessions-value').textContent = estimatedSessions.toLocaleString();
    document.getElementById('avg-duration-value').textContent = formattedDuration;
    document.getElementById('circular-engagement-value').textContent = circularEngagement.toLocaleString();

    console.log('📊 KPI Metrics updated:', {
        circularPerformance,
        sessions: estimatedSessions,
        avgDuration: avgDurationSeconds,
        circularEngagement
    });
}

/**
 * Initialize Engagement Distribution Pie Chart
 */
function initEngagementDistributionChart(promotions) {
    const chart = echarts.init(document.getElementById('engagement-distribution-chart'));

    // Calculate totals
    const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
    const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
    const totalAddToList = promotions.reduce((sum, p) => sum + (p.added_to_list || 0), 0);
    const total = totalViews + totalClicks + totalAddToList;

    // Calculate percentages
    const viewsPct = ((totalViews / total) * 100).toFixed(1);
    const clicksPct = ((totalClicks / total) * 100).toFixed(1);
    const addToListPct = ((totalAddToList / total) * 100).toFixed(1);

    // Update metric boxes
    document.getElementById('metric-views').textContent = totalViews.toLocaleString();
    document.getElementById('metric-views-pct').textContent = viewsPct + '%';
    document.getElementById('metric-clicks').textContent = totalClicks.toLocaleString();
    document.getElementById('metric-clicks-pct').textContent = clicksPct + '%';
    document.getElementById('metric-addtolist').textContent = totalAddToList.toLocaleString();
    document.getElementById('metric-addtolist-pct').textContent = addToListPct + '%';

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: '5%',
            left: 'center',
            itemGap: 20,
            textStyle: {
                fontSize: 12,
                fontWeight: '500'
            }
        },
        series: [
            {
                name: 'Engagement Type',
                type: 'pie',
                radius: ['40%', '65%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#0f172a'
                },
                labelLine: {
                    show: true,
                    length: 20,
                    length2: 10,
                    lineStyle: {
                        width: 1
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 15,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                    }
                },
                data: [
                    { value: totalViews, name: 'Card Views', itemStyle: { color: CHART_COLORS[0] } },
                    { value: totalClicks, name: 'Card Clicks', itemStyle: { color: CHART_COLORS[1] } },
                    { value: totalAddToList, name: 'Add to List', itemStyle: { color: CHART_COLORS[2] } }
                ]
            }
        ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
}

/**
 * Initialize Top Promotions List (under Circular Engagement)
 */
function initTopPromotionsChart(promotions) {
    // Initial render with default top N
    renderTopPromotionsList(promotions, 5);

    // Add event listener for Top N selector
    const topNSelector = document.getElementById('ce-topn');
    if (topNSelector) {
        topNSelector.addEventListener('change', function() {
            const topN = parseInt(this.value);
            renderTopPromotionsList(promotions, topN);
        });
    }
}

/**
 * Render top promotions list with thumbnails
 */
function renderTopPromotionsList(promotions, topN = 10) {
    const listContainer = document.getElementById('top-promotions-list');
    if (!listContainer) return;

    // Calculate engagement for each promo
    const promoData = promotions
        .map(promo => ({
            name: promo.card_name || promo.product_name || promo.productName || 'Unknown',
            engagement: (promo.card_in_view || 0) + (promo.card_clicked || 0) + (promo.added_to_list || 0),
            imageUrl: promo.image_url || '../assets/mock-image.png'
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, topN);

    // Find max engagement for calculating bar widths
    const maxEngagement = promoData[0]?.engagement || 1;

    // Build HTML
    let html = '';
    promoData.forEach((promo, index) => {
        const percentage = (promo.engagement / maxEngagement) * 100;
        html += `
            <div class="promotion-item">
                <div class="promotion-rank">${index + 1}.</div>
                <div class="promotion-thumbnail">
                    <img src="${promo.imageUrl}" alt="${promo.name}" onerror="this.src='../assets/mock-image.png'">
                </div>
                <div class="promotion-details">
                    <div class="promotion-name">${promo.name}</div>
                    <div class="promotion-meter">
                        <div class="microbar">
                            <div class="microbar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="promotion-score">${promo.engagement.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

/**
 * Initialize Category Engagement Bar Chart
 */
function initCategoryEngagementChart(promotions) {
    const chart = echarts.init(document.getElementById('category-engagement-chart'));

    // Aggregate by category
    const categoryMap = {};
    promotions.forEach(promo => {
        const category = promo.marketing_category || 'uncategorized';
        if (!categoryMap[category]) {
            categoryMap[category] = {
                name: CATEGORY_DISPLAY_NAMES[category] || category,
                engagement: 0
            };
        }
        categoryMap[category].engagement += (promo.card_in_view || 0) + (promo.card_clicked || 0) + (promo.added_to_list || 0);
    });

    // Convert to array and sort
    const categoryData = Object.values(categoryMap)
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 10); // Top 10

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: categoryData.map(c => c.name).reverse()
        },
        series: [
            {
                name: 'Engagement',
                type: 'bar',
                data: categoryData.map(c => c.engagement).reverse(),
                itemStyle: {
                    color: CHART_COLORS[0]
                }
            }
        ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
}

/**
 * Initialize Store Engagement List with Week-over-Week Comparison
 */
function initStoreEngagementChart(promotions) {
    // Initial render with default top N
    renderStoreEngagementList(promotions, 10);

    // Add event listener for Top N selector
    const topNSelector = document.getElementById('store-topn');
    if (topNSelector) {
        topNSelector.addEventListener('change', function() {
            const topN = parseInt(this.value);
            renderStoreEngagementList(promotions, topN);
        });
    }
}

/**
 * Render store engagement list with week-over-week comparison
 */
function renderStoreEngagementList(promotions, topN = 10) {
    const listContainer = document.getElementById('store-engagement-list');
    if (!listContainer) return;

    // Get context from context bar state
    const contextState = window.contextStateService ?
        window.contextStateService.loadState('dashboard') :
        { scopeName: 'All Stores', week: 40 };

    const displayName = contextState.scopeName || 'All Stores';
    const currentWeek = contextState.week || 40;
    const lastWeek = currentWeek - 1;

    // Calculate total engagement for current and last week
    let currentEngagement = 0;
    let lastEngagement = 0;

    promotions.forEach(promo => {
        const week = promo.week || currentWeek;
        const engagement = (promo.card_in_view || 0) + (promo.card_clicked || 0) + (promo.added_to_list || 0);

        if (week === currentWeek) {
            currentEngagement += engagement;
        } else if (week === lastWeek) {
            lastEngagement += engagement;
        }
    });

    // Calculate change percentage
    const change = lastEngagement > 0 ? ((currentEngagement - lastEngagement) / lastEngagement * 100) : 0;
    const isPositive = change >= 0;
    const changeIcon = isPositive ? '▲' : '▼';
    const changeColor = isPositive ? '#B8D64D' : '#E74C3C';
    const changeText = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;

    // Build stacked layout (similar to reference image)
    const html = `
        <div style="display: flex; flex-direction: column; gap: 24px; padding: 0;">
            <!-- Store Name Row -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="flex: 1;">
                    <div style="font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 4px;">${displayName}</div>
                    <div style="font-size: 14px; color: var(--muted);">Week ${currentWeek}</div>
                </div>
            </div>

            <!-- Big Number Row -->
            <div style="text-align: left;">
                <div style="font-size: 64px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 8px;">${currentEngagement.toLocaleString()}</div>
                <div style="font-size: 16px; color: var(--text); font-weight: 500;">Total Engagement</div>
            </div>

            <!-- Change Badge Row -->
            <div style="background: ${changeColor}08; border: 1px solid ${changeColor}30; border-radius: var(--radius-lg); padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: ${changeColor};">
                    <span style="font-size: 16px;">${changeIcon}</span> ${changeText} vs Week ${lastWeek}
                </div>
            </div>

            <!-- Context Row -->
            <div style="text-align: center; padding-top: 8px; border-top: 1px solid var(--border);">
                <div style="font-size: 16px; color: var(--muted);">Week ${currentWeek} of 52 • ${displayName}</div>
            </div>
        </div>
    `;

    listContainer.innerHTML = html;
}

/**
 * Initialize Promo Engagement Bar Chart
 */
function initPromoEngagementChart(promotions) {
    const chart = echarts.init(document.getElementById('promo-engagement-chart'));

    // Calculate engagement for each promo and sort
    const promoData = promotions
        .map(promo => ({
            name: promo.card_name || promo.product_name || promo.productName || 'Unknown',
            engagement: (promo.card_in_view || 0) + (promo.card_clicked || 0) + (promo.added_to_list || 0)
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 20); // Top 20

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            top: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: promoData.map(p => p.name),
            axisLabel: {
                rotate: 45,
                interval: 0
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Engagement',
                type: 'bar',
                data: promoData.map(p => p.engagement),
                itemStyle: {
                    color: CHART_COLORS[2]
                }
            }
        ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
}

/**
 * Initialize Deal Type Chart
 */
function initDealTypeChart(promotions) {
    const chart = echarts.init(document.getElementById('deal-type-chart'));

    // Aggregate by deal type
    const dealMap = {};
    promotions.forEach(promo => {
        const dealType = promo.deal_type || promo.dealType || 'Unknown';
        if (!dealMap[dealType]) {
            dealMap[dealType] = {
                name: dealType,
                engagement: 0
            };
        }
        dealMap[dealType].engagement += (promo.card_in_view || 0) + (promo.card_clicked || 0) + (promo.added_to_list || 0);
    });

    // Convert to array and sort
    const dealData = Object.values(dealMap)
        .sort((a, b) => b.engagement - a.engagement);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: dealData.map(d => d.name).reverse()
        },
        series: [
            {
                name: 'Engagement',
                type: 'bar',
                data: dealData.map(d => d.engagement).reverse(),
                itemStyle: {
                    color: CHART_COLORS[3]
                }
            }
        ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
}

/**
 * Initialize Card Size Chart
 */
function initCardSizeChart(promotions) {
    const chart = echarts.init(document.getElementById('card-size-chart'));

    // Aggregate by card size
    const sizeMap = {};
    promotions.forEach(promo => {
        const size = promo.card_size || promo.cardSize || 'Unknown';
        if (!sizeMap[size]) {
            sizeMap[size] = {
                name: size,
                engagement: 0
            };
        }
        sizeMap[size].engagement += (promo.card_in_view || 0) + (promo.card_clicked || 0) + (promo.added_to_list || 0);
    });

    // Convert to array and sort
    const sizeData = Object.values(sizeMap)
        .sort((a, b) => b.engagement - a.engagement);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: sizeData.map(s => s.name).reverse()
        },
        series: [
            {
                name: 'Engagement',
                type: 'bar',
                data: sizeData.map(s => s.engagement).reverse(),
                itemStyle: {
                    color: CHART_COLORS[4]
                }
            }
        ]
    };

    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
}
