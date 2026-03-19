/**
 * SimpleWeeklyReport.js
 * Minimal weekly report with KPIs and trend chart
 */

class SimpleWeeklyReport {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentWeek = 40;
        this.currentScope = { level: 'all', value: 'all', name: 'All Stores' };

        // Listen to context changes
        document.addEventListener('contextChanged', (e) => {
            this.currentWeek = e.detail.week;
            this.currentScope = e.detail.scope;
            this.generateReport();
        });
    }

    /**
     * Filter promotions by week and scope
     */
    filterPromotions(week, scope) {
        let filtered = window.mockDatabase.promotions.filter(p => p.week === week);

        if (scope.level === 'store') {
            filtered = filtered.filter(p => p.store_codes && p.store_codes.includes(scope.value));
        } else if (scope.level === 'group') {
            // Get all stores in this group
            const groupStores = window.mockDatabase.store_hierarchy.individual_stores
                .filter(s => s.versionGroup === scope.value)
                .map(s => s.id);
            filtered = filtered.filter(p => {
                if (!p.store_codes || p.store_codes.length === 0) return false;
                return groupStores.includes(p.store_codes[0]);
            });
        }

        return filtered;
    }

    /**
     * Calculate all KPIs
     */
    calculateKPIs(promotions, previousWeekPromotions) {
        const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
        const totalClicks = promotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
        const ctr = totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(2) : 0;

        // Previous week for comparison
        const prevViews = previousWeekPromotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
        const prevClicks = previousWeekPromotions.reduce((sum, p) => sum + (p.card_clicked || 0), 0);
        const viewsChange = prevViews > 0 ? (((totalViews - prevViews) / prevViews) * 100).toFixed(1) : 0;
        const clicksChange = prevClicks > 0 ? (((totalClicks - prevClicks) / prevClicks) * 100).toFixed(1) : 0;

        // Top 3 categories by views
        const categoryStats = {};
        promotions.forEach(p => {
            const cat = p.marketing_category || 'uncategorized';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { views: 0, clicks: 0 };
            }
            categoryStats[cat].views += p.card_in_view || 0;
            categoryStats[cat].clicks += p.card_clicked || 0;
        });
        const topCategories = Object.entries(categoryStats)
            .sort((a, b) => b[1].views - a[1].views)
            .slice(0, 3)
            .map(([name, stats]) => ({ name, ...stats }));

        // Top 3 products by views
        const productStats = {};
        promotions.forEach(p => {
            const prod = p.card_name || 'Unknown';
            if (!productStats[prod]) {
                productStats[prod] = { views: 0, clicks: 0 };
            }
            productStats[prod].views += p.card_in_view || 0;
            productStats[prod].clicks += p.card_clicked || 0;
        });
        const topProducts = Object.entries(productStats)
            .sort((a, b) => b[1].views - a[1].views)
            .slice(0, 3)
            .map(([name, stats]) => ({ name, ...stats }));

        // Best performing store/group
        const storeStats = {};
        promotions.forEach(p => {
            let key;
            if (this.currentScope.level === 'all') {
                // Get group from store
                const storeId = p.store_codes ? p.store_codes[0] : null;
                if (storeId) {
                    const store = window.mockDatabase.store_hierarchy.individual_stores.find(s => s.id === storeId);
                    if (store) {
                        // Get group name from version_groups
                        const group = window.mockDatabase.store_hierarchy.version_groups.find(g => g.id === store.versionGroup);
                        key = group ? group.name : 'Unknown';
                    }
                }
            } else {
                key = p.store_codes ? p.store_codes[0] : 'Unknown';
            }

            if (key) {
                if (!storeStats[key]) {
                    storeStats[key] = { views: 0, clicks: 0 };
                }
                storeStats[key].views += p.card_in_view || 0;
                storeStats[key].clicks += p.card_clicked || 0;
            }
        });
        const bestPerformer = Object.entries(storeStats)
            .sort((a, b) => b[1].views - a[1].views)[0];

        return {
            totalViews,
            totalClicks,
            ctr,
            viewsChange,
            clicksChange,
            topCategories,
            topProducts,
            bestPerformer: bestPerformer ? { name: bestPerformer[0], ...bestPerformer[1] } : null
        };
    }

    /**
     * Generate daily trend data
     */
    generateTrendData(promotions) {
        const totalViews = promotions.reduce((sum, p) => sum + (p.card_in_view || 0), 0);
        const dailyData = Array(7).fill(0).map((_, i) => {
            // Simulate daily distribution within the week
            const dayViews = Math.floor(totalViews / 7);
            const variance = Math.random() * 0.3 - 0.15; // ±15% variance
            return Math.floor(dayViews * (1 + variance));
        });
        return dailyData;
    }

    /**
     * Render KPI tile
     */
    renderKPI(label, value, change = null) {
        const changeHtml = change !== null
            ? `<div style="font-size: 12px; color: ${change >= 0 ? '#22c55e' : '#ef4444'}; margin-top: 4px;">
                ${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}%
               </div>`
            : '';

        return `
            <div style="background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                <div style="color: var(--muted); font-size: 12px; margin-bottom: 8px;">${label}</div>
                <div style="font-size: 24px; font-weight: 600; color: var(--text);">${value}</div>
                ${changeHtml}
            </div>
        `;
    }

    /**
     * Render list tile
     */
    renderListTile(label, items) {
        const listHtml = items.map((item, i) =>
            `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${i + 1}. ${item.name}</span>
                <span style="color: var(--muted);">${item.views.toLocaleString()}</span>
             </div>`
        ).join('');

        return `
            <div style="background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                <div style="color: var(--muted); font-size: 12px; margin-bottom: 12px;">${label}</div>
                <div style="font-size: 14px;">${listHtml}</div>
            </div>
        `;
    }

    /**
     * Render trend chart
     */
    renderChart(dailyData) {
        const max = Math.max(...dailyData);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const barsHtml = dailyData.map((value, i) => {
            const height = (value / max * 100);
            return `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="font-size: 12px; color: var(--muted);">${value.toLocaleString()}</div>
                    <div style="width: 60%; background: var(--blue); border-radius: 4px 4px 0 0; height: ${height}%;"></div>
                    <div style="font-size: 12px; color: var(--text); font-weight: 500;">${days[i]}</div>
                </div>
            `;
        }).join('');

        return `
            <div style="background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-top: 16px;">
                <div style="color: var(--muted); font-size: 12px; margin-bottom: 16px;">DAILY VIEWS TREND</div>
                <div style="display: flex; align-items: flex-end; gap: 8px; height: 200px;">
                    ${barsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Generate complete report
     */
    generateReport() {
        const promotions = this.filterPromotions(this.currentWeek, this.currentScope);
        const previousWeekPromotions = this.filterPromotions(this.currentWeek - 1, this.currentScope);

        if (promotions.length === 0) {
            this.container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: var(--muted);">
                    No data available for Week ${this.currentWeek}
                </div>
            `;
            return;
        }

        const kpis = this.calculateKPIs(promotions, previousWeekPromotions);
        const dailyData = this.generateTrendData(promotions);

        const html = `
            <div style="padding: 24px; background: var(--bg);">
                <!-- Header -->
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 20px; margin-bottom: 8px;">Weekly Performance Report</h2>
                    <div style="color: var(--muted);">Week ${this.currentWeek} • ${this.currentScope.name}</div>
                </div>

                <!-- KPI Grid (2x5) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    ${this.renderKPI('Total Views', kpis.totalViews.toLocaleString(), kpis.viewsChange)}
                    ${this.renderKPI('Total Clicks', kpis.totalClicks.toLocaleString(), kpis.clicksChange)}
                    ${this.renderKPI('Click-Through Rate', kpis.ctr + '%')}
                    ${this.renderKPI('Active Promotions', promotions.length.toLocaleString())}
                    ${this.renderListTile('Top Categories', kpis.topCategories)}
                    ${this.renderListTile('Top Products', kpis.topProducts)}
                    ${kpis.bestPerformer ? this.renderKPI(
                        'Best Performer',
                        kpis.bestPerformer.name,
                        null
                    ) : this.renderKPI('Best Performer', 'N/A')}
                    ${this.renderKPI('Avg Views/Promo', Math.round(kpis.totalViews / promotions.length).toLocaleString())}
                </div>

                <!-- Trend Chart -->
                ${this.renderChart(dailyData)}
            </div>
        `;

        this.container.innerHTML = html;
        console.log(`📊 Simple Weekly Report generated for Week ${this.currentWeek}`);
    }
}
