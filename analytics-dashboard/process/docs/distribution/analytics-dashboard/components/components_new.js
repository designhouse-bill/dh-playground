/**
 * Non-Chart Components - Version 4
 * Lists, tiles, and other non-chart UI components
 */

class DashboardComponents {
  constructor() {
    this.data = null;
  }

  /**
   * Load YTD Metrics Strip (context-aware)
   */
  loadYTDMetrics(data, contextState = null) {
    // Calculate YTD metrics based on context
    let ytdMetrics;
    if (window.mockDatabase && typeof window.mockDatabase.calculateYTDMetrics === 'function') {
      ytdMetrics = window.mockDatabase.calculateYTDMetrics(contextState);
      console.log('📊 YTD Metrics calculated for context:', contextState);
    } else if (data && data.ytdMetrics) {
      ytdMetrics = data.ytdMetrics;
    } else {
      console.warn('⚠️ No YTD metrics data available');
      return;
    }

    const ytdStrip = document.querySelector('.ytd-strip');

    if (!ytdStrip) {
      console.warn('⚠️ YTD strip container not found');
      return;
    }

    // Update Traffic
    const trafficValue = ytdStrip.querySelector('.ytd-metric:nth-child(1) .value');
    const trafficTrend = ytdStrip.querySelector('.ytd-metric:nth-child(1) .trend');
    if (trafficValue) {
      trafficValue.textContent = ytdMetrics.traffic.formatted + ' views';
    }
    if (trafficTrend) {
      trafficTrend.textContent = ytdMetrics.traffic.trend + ' ' + ytdMetrics.traffic.trendLabel;
    }

    // Update Digital Adoption
    const adoptionValue = ytdStrip.querySelector('.ytd-metric:nth-child(2) .value');
    const adoptionTrend = ytdStrip.querySelector('.ytd-metric:nth-child(2) .trend');
    if (adoptionValue) {
      adoptionValue.textContent = ytdMetrics.digitalAdoption.formatted;
    }
    if (adoptionTrend) {
      adoptionTrend.textContent = ytdMetrics.digitalAdoption.trend + ' ' + ytdMetrics.digitalAdoption.trendLabel;
    }

    // Update Print Rate
    const printValue = ytdStrip.querySelector('.ytd-metric:nth-child(3) .value');
    const printTrend = ytdStrip.querySelector('.ytd-metric:nth-child(3) .trend');
    console.log('🖨️ Print Rate Element:', printValue);
    console.log('🖨️ Print Rate Data:', ytdMetrics.printRate);
    if (printValue) {
      printValue.textContent = ytdMetrics.printRate.formatted;
      console.log('🖨️ Print Rate Updated to:', ytdMetrics.printRate.formatted);
    } else {
      console.warn('⚠️ Print Rate value element not found');
    }
    if (printTrend) {
      printTrend.textContent = ytdMetrics.printRate.trend;
    } else {
      console.warn('⚠️ Print Rate trend element not found');
    }

    console.log('✅ YTD Metrics loaded successfully');
  }

  /**
   * Load KPI Tiles (exactly 3 tiles)
   * Implementation in Phase 1B - copy exact from current
   */
  loadKPITiles(data) {
    console.log('📊 Loading KPI Tiles...');
    // Copy/paste dashboard-row-week with 3 tiles only
  }

  /**
   * Load Top Performing Categories
   * Implementation in Phase 2A - copy exact from current
   */
  loadTopCategories(data) {
    console.log('📊 Loading Top Categories...');
    // Copy/paste entire component + styling
  }

  /**
   * Load Top Performing Promotions
   * Implementation in Phase 2A - copy exact from current
   */
  loadTopPromotions(data) {
    console.log('📊 Loading Top Promotions...');
    // Copy/paste entire component + styling
  }

  /**
   * Initialize info button tooltips
   */
  initializeInfoButtons() {
    console.log('🔗 Setting up info buttons...');
    // Preserve current tooltip system
  }

  /**
   * Initialize inquiry button links
   */
  initializeInquiryButtons() {
    console.log('🔗 Setting up inquiry buttons...');
    // Preserve current onclick handlers
  }
}