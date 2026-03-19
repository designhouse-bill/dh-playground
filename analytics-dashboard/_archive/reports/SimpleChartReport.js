/**
 * SimpleChartReport.js
 * Simple chart report - displays basic KPIs in preview pane
 */

class SimpleChartReport {
    constructor(previewElementId) {
        this.previewElement = document.getElementById(previewElementId);
        this.currentWeek = 40;
        this.currentScope = { level: 'all', value: 'all', name: 'All Stores' };

        // Listen for context changes
        document.addEventListener('contextChanged', (e) => this.handleContextChange(e));

        console.log('✅ SimpleChartReport initialized');
    }

    /**
     * Handle context bar changes
     */
    handleContextChange(event) {
        const { week, scopeLevel, scopeValue, scopeName } = event.detail;
        this.currentWeek = week;
        this.currentScope = { level: scopeLevel, value: scopeValue, name: scopeName };
        console.log('📊 Context changed:', { week, scopeLevel, scopeValue, scopeName });
        this.generateReport();
    }

    /**
     * Filter promotions by week and scope
     */
    filterPromotions(week, scope) {
        if (!window.mockDatabase?.promotions) {
            console.error('❌ Mock database not available');
            return [];
        }

        return window.mockDatabase.promotions.filter(promo => {
            // Filter by week
            if (promo.week !== week) return false;

            // Filter by scope
            if (scope.level === 'all') return true;

            // Group filtering - extract group from store_codes
            if (scope.level === 'group') {
                const storeId = promo.store_codes?.[0];
                if (storeId) {
                    // Extract group from store ID (e.g., "STORE_001" -> "GROUP_A")
                    const storeNum = parseInt(storeId.split('_')[1]);
                    let groupId = '';
                    if (storeNum >= 1 && storeNum <= 10) groupId = 'GROUP_A';
                    else if (storeNum >= 11 && storeNum <= 20) groupId = 'GROUP_B';
                    else if (storeNum >= 21 && storeNum <= 30) groupId = 'GROUP_C';
                    else if (storeNum >= 31 && storeNum <= 40) groupId = 'GROUP_D';
                    else if (storeNum >= 41 && storeNum <= 50) groupId = 'GROUP_E';
                    return groupId === scope.value;
                }
                return false;
            }

            // Store filtering
            if (scope.level === 'store') {
                return promo.store_codes?.includes(scope.value);
            }

            return false;
        });
    }

    /**
     * Calculate KPIs from filtered promotions
     */
    calculateKPIs(promotions, week) {
        // Previous week data for comparison
        const prevWeekPromos = this.filterPromotions(week - 1, this.currentScope);

        // Total metrics - use correct field names from mock data
        const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
        const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
        const ctr = totalViews > 0 ? (totalClicks / totalViews * 100) : 0;

        // Previous week totals
        const prevViews = prevWeekPromos.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
        const prevClicks = prevWeekPromos.reduce((sum, p) => sum + (p.card_clicked || 0), 0);

        // Week-over-week changes
        const viewsChange = prevViews > 0 ? ((totalViews - prevViews) / prevViews * 100) : 0;
        const clicksChange = prevClicks > 0 ? ((totalClicks - prevClicks) / prevClicks * 100) : 0;

        // Top categories (simple version - top 3 only)
        const categoryStats = {};
        promotions.forEach(p => {
            const category = p.marketing_category || p.department || 'Unknown';
            if (!categoryStats[category]) {
                categoryStats[category] = { views: 0, clicks: 0 };
            }
            categoryStats[category].views += (p.card_in_view || 0);
            categoryStats[category].clicks += (p.card_clicked || 0);
        });
        const topCategories = Object.entries(categoryStats)
            .sort((a, b) => b[1].views - a[1].views)
            .slice(0, 3)
            .map(([cat, stats]) => ({ category: cat, views: stats.views }));

        // Top promotions (simple version - top 3 only)
        const topPromotions = promotions
            .sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0))
            .slice(0, 3)
            .map(p => ({
                name: p.card_name,
                score: p.composite_score,
                dealType: p.deal_type || 'N/A',
                price: p.card_price || 'N/A',
                position: p.position || 'N/A',
                category: p.marketing_category || p.department || 'Unknown',
                views: p.card_in_view || 0,
                clicks: p.card_clicked || 0,
                ctr: p.card_in_view > 0 ? ((p.card_clicked / p.card_in_view) * 100).toFixed(1) : 0
            }));

        // Best performing group (simple version)
        const groupStats = {};
        promotions.forEach(p => {
            const storeId = p.store_codes?.[0];
            if (storeId) {
                const storeNum = parseInt(storeId.split('_')[1]);
                let groupId = '';
                if (storeNum >= 1 && storeNum <= 10) groupId = 'GROUP_A';
                else if (storeNum >= 11 && storeNum <= 20) groupId = 'GROUP_B';
                else if (storeNum >= 21 && storeNum <= 30) groupId = 'GROUP_C';
                else if (storeNum >= 31 && storeNum <= 40) groupId = 'GROUP_D';
                else if (storeNum >= 41 && storeNum <= 50) groupId = 'GROUP_E';

                if (!groupStats[groupId]) {
                    groupStats[groupId] = { views: 0, clicks: 0 };
                }
                groupStats[groupId].views += (p.card_in_view || 0);
                groupStats[groupId].clicks += (p.card_clicked || 0);
            }
        });

        const bestPerformer = Object.entries(groupStats)
            .sort((a, b) => b[1].views - a[1].views)[0];

        // Total shares
        const totalShares = promotions.reduce((sum, p) => sum + (p.share_count || 0), 0);

        // Daily trend
        const dailyViews = this.calculateDailyTrend(totalViews);

        return {
            totalViews,
            totalClicks,
            totalShares,
            ctr,
            viewsChange,
            clicksChange,
            topCategories,
            topPromotions,
            bestPerformer: bestPerformer ? { name: bestPerformer[0], views: bestPerformer[1].views } : null,
            dailyViews,
            promotionCount: promotions.length
        };
    }

    /**
     * Generate daily trend data (simplified)
     */
    calculateDailyTrend(totalViews) {
        // Create a simple 7-day trend with some variance
        const avgDaily = totalViews / 7;
        const trend = [];
        for (let i = 0; i < 7; i++) {
            const variance = (Math.random() - 0.5) * 0.4; // ±20% variance
            trend.push(Math.round(avgDaily * (1 + variance)));
        }
        return trend;
    }

    /**
     * Generate mini trend chart SVG
     */
    generateChartSVG(data, width = 300, height = 60) {
        if (!data || data.length === 0) {
            return '<div style="padding: 2rem; text-align: center; color: var(--muted);">No trend data</div>';
        }

        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const dataLen = data.length;

        const points = data.map((value, index) => {
            const x = dataLen > 1 ? (index / (dataLen - 1)) * width : width / 2;
            const y = height - ((value - min) / range) * height;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(' ');

        const circles = data.map((value, index) => {
            const x = dataLen > 1 ? (index / (dataLen - 1)) * width : width / 2;
            const y = height - ((value - min) / range) * height;
            return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3" fill="#4272d8" />`;
        }).join('');

        const values = data.map((v, i) => `
            <div style="text-align: center; font-size: 10px; color: var(--muted);">
                <div style="font-weight: 600; color: var(--text);">${v.toLocaleString()}</div>
            </div>
        `).join('');

        return `
            <svg width="${width}" height="${height}" style="display: block; margin-bottom: 0.5rem;">
                <polyline
                    points="${points}"
                    fill="none"
                    stroke="#4272d8"
                    stroke-width="2"
                />
                ${circles}
            </svg>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-top: 0.5rem;">
                ${values}
            </div>
        `;
    }

    /**
     * Generate HTML for report
     */
    generateHTML(kpis) {
        const maxDaily = Math.max(...kpis.dailyViews);

        return `
            <div style="padding: 1rem; background: var(--bg); min-height: 100%;">
                <div style="margin-bottom: 1rem;">
                    <h3 style="margin: 0 0 0.25rem 0; font-size: 18px; font-weight: 700;">Simple Chart</h3>
                    <p style="margin: 0; font-size: 13px; color: var(--muted);">Week ${this.currentWeek} | ${this.currentScope.name} | ${kpis.promotionCount} promotions</p>
                </div>

                <!-- Row 1: Total Views, Clicks, Shares -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div class="card" style="padding: 1rem;">
                        <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; margin-bottom: 0.5rem;">Total Views</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--text);">${kpis.totalViews.toLocaleString()}</div>
                        <div style="font-size: 11px; color: ${kpis.viewsChange >= 0 ? 'var(--green)' : 'var(--red)'}; margin-top: 0.25rem;">
                            ${kpis.viewsChange >= 0 ? '↑' : '↓'} ${Math.abs(kpis.viewsChange).toFixed(1)}%
                        </div>
                    </div>

                    <div class="card" style="padding: 1rem;">
                        <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; margin-bottom: 0.5rem;">Total Clicks</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--text);">${kpis.totalClicks.toLocaleString()}</div>
                        <div style="font-size: 11px; color: ${kpis.clicksChange >= 0 ? 'var(--green)' : 'var(--red)'}; margin-top: 0.25rem;">
                            ${kpis.clicksChange >= 0 ? '↑' : '↓'} ${Math.abs(kpis.clicksChange).toFixed(1)}%
                        </div>
                    </div>

                    <div class="card" style="padding: 1rem;">
                        <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; margin-bottom: 0.5rem;">Total Shares</div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--text);">${kpis.totalShares.toLocaleString()}</div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 0.25rem;">CTR: ${kpis.ctr.toFixed(2)}%</div>
                    </div>
                </div>

                <!-- Row 2: Top 3 Categories -->
                <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
                    <div style="font-size: 12px; color: var(--muted); text-transform: uppercase; font-weight: 600; margin-bottom: 0.75rem;">Top 3 Categories</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                        ${kpis.topCategories.map((cat, index) => `
                            <div style="padding: 0.75rem; background: var(--bg); border-radius: 6px;">
                                <div style="font-size: 10px; color: var(--muted); margin-bottom: 0.25rem;">#${index + 1}</div>
                                <div style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 0.25rem;">${cat.category}</div>
                                <div style="font-size: 11px; color: var(--muted);">${cat.views.toLocaleString()} views</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Row 3: Top 3 Promotions -->
                <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
                    <div style="font-size: 12px; color: var(--muted); text-transform: uppercase; font-weight: 600; margin-bottom: 0.75rem;">Top 3 Promotions</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                        ${kpis.topPromotions.map((promo, index) => `
                            <div style="padding: 0.75rem; background: var(--bg); border-radius: 6px;">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; line-height: 1.3; min-height: 2.6em;">${promo.name}</div>
                                <div style="display: inline-block; background: var(--blue); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 10px; font-weight: 600; margin-bottom: 0.5rem;">
                                    Score: ${promo.score.toFixed(0)}
                                </div>
                                <div style="display: grid; gap: 0.25rem; font-size: 10px; color: var(--muted);">
                                    <div><strong>Deal:</strong> ${promo.dealType}</div>
                                    <div><strong>Price:</strong> ${promo.price}</div>
                                    <div><strong>Category:</strong> ${promo.category}</div>
                                    <div><strong>Position:</strong> ${promo.position}</div>
                                    <div style="margin-top: 0.25rem; padding-top: 0.25rem; border-top: 1px solid var(--border);">
                                        ${promo.views.toLocaleString()} views • ${promo.clicks.toLocaleString()} clicks
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Row 4: Daily Views Trend (Bar Chart) -->
                <div class="card" style="padding: 1rem;">
                    <div style="font-size: 12px; color: var(--muted); text-transform: uppercase; font-weight: 600; margin-bottom: 0.75rem;">Daily Views Trend</div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; align-items: end; height: 120px;">
                        ${kpis.dailyViews.map((value, index) => {
                            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                            const height = (value / maxDaily) * 100;
                            return `
                                <div style="display: flex; flex-direction: column; align-items: center; height: 100%;">
                                    <div style="flex: 1; display: flex; align-items: flex-end; width: 100%;">
                                        <div style="width: 100%; height: ${height}%; background: var(--blue); border-radius: 4px 4px 0 0; position: relative;">
                                            <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 600; color: var(--text); white-space: nowrap;">
                                                ${value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style="font-size: 10px; color: var(--muted); margin-top: 0.5rem;">${days[index]}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate and display report
     */
    generateReport() {
        if (!this.previewElement) {
            console.error('❌ Preview element not found');
            return;
        }

        console.log(`📊 Generating report for Week ${this.currentWeek}, Scope: ${this.currentScope.name}`);

        // Filter data
        const promotions = this.filterPromotions(this.currentWeek, this.currentScope);

        if (promotions.length === 0) {
            this.previewElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; color: var(--muted);">
                    <div>
                        <div style="font-size: 48px; margin-bottom: 1rem;">📊</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 0.5rem;">No Data Available</div>
                        <div style="font-size: 14px;">No promotions found for Week ${this.currentWeek}</div>
                    </div>
                </div>
            `;
            return;
        }

        // Calculate KPIs
        const kpis = this.calculateKPIs(promotions, this.currentWeek);

        // Render HTML
        this.previewElement.innerHTML = this.generateHTML(kpis);

        console.log('✅ Report generated:', { promotions: promotions.length, kpis });
    }

    /**
     * Public method to trigger report generation
     */
    refresh() {
        this.generateReport();
    }
}

// Export for use in reports.html
window.SimpleChartReport = SimpleChartReport;