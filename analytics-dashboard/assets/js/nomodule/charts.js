/* ==========================================================================
   Charts helper (ns.*) — eCharts bindings with legend support for donuts
   ========================================================================== */
(function(){
  const ns = window.ns = window.ns || {};

  function bindChart(hostId, option){
    const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
    if (!el || !window.echarts) return null;

    // Ensure chart takes full container dimensions
    if (!el.style.width) el.style.width = '100%';
    if (!el.style.height) el.style.height = '100%';

    const inst = echarts.init(el, null, {renderer:'canvas'});
    inst.setOption(option);
    // simple responsive hook
    window.addEventListener('resize', () => { try{ inst.resize(); }catch(e){} }, {passive:true});
    return inst;
  }

// PATCH: responsive 160px line chart with % axis and padded range
ns.echartsLine = function (hostId, seriesName, xLabels, yValues) {
  const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
  if (!el || !window.echarts) return null;

  // Use responsive height based on container
  if (!el.style.height) {
    el.style.height = '100%';
  }

  // Defensive: coerce inputs to arrays
  const xs = Array.isArray(xLabels) ? xLabels.slice() : [];
  const ysRaw = Array.isArray(yValues) ? yValues.slice() : [];

  // If values are in 0–1, convert to 0–100; if already 0–100, keep them
  const looksLikeUnit = ysRaw.some(v => v > 0 && v <= 1) && ysRaw.every(v => v <= 1.00001);
  const ysPct = ysRaw.map(v => (v == null ? 0 : (looksLikeUnit ? v * 100 : v)));

  // X labels like "W33" -> "Week 33"
  const weekLabels = xs.map(l => {
    if (typeof l === 'string' && /^W\d+/i.test(l)) {
      return 'Week ' + l.replace(/^W/i, '');
    }
    return String(l);
  });

  // ~10 percentage-point padding above/below (clamped 0..100)
  const minVal = Math.min(...ysPct);
  const maxVal = Math.max(...ysPct);
  const pad = 10; // percentage points
  const yMin = Math.max(0, Math.floor(minVal - pad));
  const yMax = Math.min(100, Math.ceil(maxVal + pad));

  const inst = echarts.init(el, null, { renderer: 'canvas' });
  inst.setOption({
    tooltip: {
      trigger: 'axis',
      valueFormatter: v => `${Math.round(v)}%`,
      axisPointer: { type: 'line' }
    },
    grid: { left: 35, right: 5, top: 5, bottom: 20 },
    xAxis: {
      type: 'category',
      data: weekLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d6dae1' } },
      axisLabel: { color: '#222222' }
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      axisLabel: { formatter: '{value}%', color: '#222222' },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    series: [{
      name: seriesName || 'Week Composite',
      type: 'line',
      smooth: true,
      showSymbol: true,
      symbolSize: 6,
      data: ysPct.map(v => Math.round(v)),
      areaStyle: { opacity: 0.35 },
      itemStyle: { color: '#4272D8' },
      lineStyle: { color: '#4272D8' },
      areaStyle: { color: '#4272D8', opacity: 0.35 }
    }]
  });

  // Responsive width
  const onResize = () => { try { inst.resize(); } catch (e) {} };
  window.addEventListener('resize', onResize, { passive: true });

  return inst;
};

// Donut with legend showing % next to name (shared by all donut tiles)
// Donut (left) + Legend (right on wide; bottom on narrow) with % next to name
ns.echartsDonut = function (hostId, pairs, customColors) {
  const data = (pairs || []).map(d => ({ name: d.name, value: d.value }));
  const total = data.reduce((s, d) => s + (+d.value || 0), 0) || 1;
  const cssTextColor =
    getComputedStyle(document.documentElement).getPropertyValue('--text') || '#111';

  const mobileLegend = {
    type: 'scroll',
    orient: 'horizontal',
    bottom: 0,
    left: 'center',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { fontSize: 12, color: cssTextColor },
    formatter: (name) => {
      const item = data.find(d => d.name === name);
      if (!item) return name;
      const pct = Math.round((item.value / total) * 100);
      return `${name} — ${pct}%`;
    }
  };

  const rightLegend = {
    type: 'scroll',
    orient: 'vertical',
    right: 6,         // snug to the right side of the canvas
    top: 'middle',    // vertically centered
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { fontSize: 12, color: cssTextColor },
    // tighter gap to fit more rows
    padding: 0,
    itemGap: 8,
    formatter: (name) => {
      const item = data.find(d => d.name === name);
      if (!item) return name;
      const pct = Math.round((item.value / total) * 100);
      return `${name} — ${pct}%`;
    }
  };

  // Base option (works and resizes automatically)
  const option = {
    color: customColors, // Use custom colors if provided, otherwise ECharts will use default palette
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const val = (p.value != null && p.value.toLocaleString)
          ? p.value.toLocaleString()
          : p.value;
        return `${p.name}: ${val} (${Math.round(p.percent)}%)`;
      }
    },

    // Default: mobile / narrow layout (legend bottom, donut centered)
    legend: mobileLegend,
    series: [{
      type: 'pie',
      radius: ['55%', '80%'],
      center: ['50%', '45%'], // leave space for bottom legend
      top: 0,
      bottom: 28,
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data
    }],

    // Responsive adjustments for wider hosts
    // When the host is at least ~520px wide, push donut left and move legend right.
    media: [
      {
        query: { minWidth: 520 },
        option: {
          legend: rightLegend,
          series: [{
            // Push donut left so legend fits on the right
            center: ['32%', '50%'],
            // give a touch more radius since legend moves off-canvas
            radius: ['58%', '82%'],
            bottom: 0 // no bottom reserve needed
          }]
        }
      }
    ]
  };

  return bindChart(hostId, option);
};

// Simple vertical bar
ns.echartsBar = function(hostId, pairs, customColors){
  const xs = (pairs||[]).map(d=>d.name);
  const ys = (pairs||[]).map(d=>Number(d.value||0));
  const option = {
    color: customColors || undefined,
    tooltip: { trigger:'axis' },
    grid: { left:30, right:10, top:10, bottom:30 },
    xAxis: { type:'category', data: xs, axisLabel:{color:'#a0a4ad'} },
    yAxis: { type:'value', splitLine:{lineStyle:{color:'#232838'}}, axisLabel:{color:'#a0a4ad'} },
    series: [{ type:'bar', data: ys, itemStyle: { color: customColors?.[0] || '#4272D8' } }]
  };
  return bindChart(hostId, option);
};

// PATCH: responsive scatter with fixed 120px height
ns.echartsScatter = function (hostId, points) {
  const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
  if (!el || !window.echarts) return null;

  // Fix height without touching CSS
  // Use responsive height based on container
  if (!el.style.height) {
    el.style.height = '100%';
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const d = p.data || {};
        return `${d.name}<br>Engagement: ${d.value[0]}%<br>Lift: ${d.value[1]}%`;
      }
    },
    grid: { left: 35, right: 5, top: 5, bottom: 20 },
    xAxis: {
      type: 'value',
      name: 'Engagement %',
      min: 0,
      max: 100,
      axisLabel: { color: '#222222', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    yAxis: {
      type: 'value',
      name: 'Store Lift %',
      min: -20,
      max: 40,
      axisLabel: { color: '#222222', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    series: [{
      type: 'scatter',
      symbolSize: (d) => Math.max(8, d[2] || 10),
      data: (points || []).map(p => ({
        name: p.name,
        value: [p.x, p.y, p.size || 10]
      }))
    }]
  };

  const inst = echarts.init(el, null, { renderer: 'canvas' });
  inst.setOption(option);

  // Responsive width
  const onResize = () => { try { inst.resize(); } catch (e) {} };
  window.addEventListener('resize', onResize, { passive: true });

  return inst;
};
// Horizontal Bars: Deal Type Effectiveness (responsive, with % labels)
ns.echartsDealTypeHBars = function (hostId, items, opts = {}) {
  const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
  if (!el || !window.echarts) return null;

  // Let the host fill the tile; we keep height flexible (tile controls height)
  el.style.width = '100%';
  // If parent uses a fixed height (e.g., .card-body 160–240px), we just resize into it.

  const data = (items || []).map(d => ({
    name: d.name || '',
    value: Math.max(0, Number(d.value ?? 0))
  }));

  // Sort descending for readability
  data.sort((a, b) => b.value - a.value);

  const inst = echarts.init(el, null, { renderer: 'canvas' });
  inst.setOption({
    animationDuration: 400,
    grid: {
      left: 10,     // we’ll use inside labels for names, so keep grid tight
      right: 12,    // space for value labels
      top: 8,
      bottom: 24,   // room for x-axis tick labels (20%, 40%, 60%, 80%)
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      formatter: p => `${p.name}: <b>${Math.round(p.value)}%</b>`
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLabel: { formatter: '{value}%', color: '#222222' },
      axisLine: { lineStyle: { color: '#d6dae1' } },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    yAxis: {
      type: 'category',
      inverse: false,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        // show deal type names to the left of bars
        color: '#2b2f36',
        margin: 12
      },
      data: data.map(d => d.name)
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.value),
      barWidth: 14,
      barCategoryGap: '50%',
      itemStyle: {
        borderRadius: 7,
        color: '#4272D8'
      },
      label: {
        show: true,
        position: 'right',
        formatter: p => `${Math.round(p.value)}%`,
        color: '#2b2f36'
      }
    }]
  });

  const onResize = () => { try { inst.resize(); } catch(e){} };
  window.addEventListener('resize', onResize, { passive: true });

  return inst;
};

// Back-compat alias (so either name works)
ns.echartsDealTypeBars = ns.echartsDealTypeHBars;

// Position Performance Horizontal Bar Chart
ns.echartsPositionPerformance = function(hostId, data) {
  const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
  if (!el || !window.echarts) return null;

  // Use responsive height based on container
  if (!el.style.height) {
    el.style.height = '100%';
  }

  // Define position colors
  const positionColors = {
    'Top': '#B8D64D',
    'Upper Middle': '#4272D8',
    'Lower Middle': '#4E5370',
    'Bottom': '#FF9656'
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        const p = params[0];
        return `${p.name}: ${p.value}%`;
      }
    },
    grid: { left: 80, right: 20, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      max: 50, // Set max to 50% for better visualization
      axisLabel: { formatter: '{value}%', color: '#222222' },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name).reverse(), // Reverse so Top appears at top
      axisLabel: { color: '#222222' },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: { color: positionColors[d.name] || '#B8D64D' }
      })).reverse(), // Reverse data to match reversed labels
      barWidth: '60%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#333'
      }
    }]
  };

  const inst = echarts.init(el, null, { renderer: 'canvas' });
  inst.setOption(option);

  // Responsive resize
  const onResize = () => { try { inst.resize(); } catch (e) {} };
  window.addEventListener('resize', onResize, { passive: true });

  return inst;
};

// Category Lift vs Baseline Performance - Horizontal Deviation Chart
ns.echartsCategoryLift = function(hostId, data) {
  console.log('UPDATED: Category Lift chart function called with new text colors');
  const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
  if (!el || !window.echarts) return null;

  if (!el.style.height) {
    el.style.height = '100%';
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        const p = params[0];
        const sign = p.value >= 0 ? '+' : '';
        return `${p.name}: ${sign}${p.value}% vs baseline`;
      }
    },
    grid: { left: 90, right: 20, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      min: -30,
      max: 30,
      axisLabel: {
        formatter: function(value) {
          return value === 0 ? 'Baseline' : (value > 0 ? '+' + value + '%' : value + '%');
        },
        color: '#222222'
      },
      splitLine: {
        lineStyle: { color: '#eef1f5' },
        show: true
      },
      axisLine: {
        lineStyle: { color: '#333', width: 2 },
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { color: '#222222' },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: {
          color: d.value >= 0 ? '#B8D64D' : '#4272D8' // Positive: #B8D64D, Negative: #4272D8
        }
      })),
      barWidth: '60%',
      label: {
        show: true,
        position: function(params) {
          return params.value >= 0 ? 'right' : 'left';
        },
        formatter: function(params) {
          const sign = params.value >= 0 ? '+' : '';
          return `{labelBox|${sign}${params.value}%}`;
        },
        rich: {
          labelBox: {
            color: '#333333',
            backgroundColor: '#ffffffa1',
            padding: [4, 8, 4, 8], // top, right, bottom, left
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 'bold',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 2,
            shadowOffsetY: 1
          }
        }
      }
    }]
  };

  const inst = echarts.init(el, null, { renderer: 'canvas' });
  inst.setOption(option);

  const onResize = () => { try { inst.resize(); } catch (e) {} };
  window.addEventListener('resize', onResize, { passive: true });

  return inst;
};

// Category Size vs Engagement Quality - Bubble Chart
ns.echartsCategoryBubble = function(hostId, data) {
  const el = (typeof hostId === 'string') ? document.getElementById(hostId) : hostId;
  if (!el || !window.echarts) return null;

  if (!el.style.height) {
    el.style.height = '100%';
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const d = params.data;
        return `${d.name}<br/>Traffic: ${d.value[0]}<br/>Engagement: ${d.value[1]}%<br/>Conversion: ${d.value[2]}%`;
      }
    },
    grid: { left: 60, right: 20, top: 20, bottom: 60 },
    xAxis: {
      type: 'value',
      name: 'Traffic Volume',
      nameLocation: 'middle',
      nameGap: 25,
      axisLabel: { color: '#222222' },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    yAxis: {
      type: 'value',
      name: 'Engagement %',
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: { formatter: '{value}%', color: '#222222' },
      splitLine: { lineStyle: { color: '#eef1f5' } }
    },
    series: [{
      type: 'scatter',
      data: data.map(d => ({
        name: d.name,
        value: [d.traffic, d.engagement, d.conversion],
        symbolSize: Math.sqrt(d.conversion) * 3, // Bubble size based on conversion rate
        itemStyle: {
          color: '#4272D8',
          opacity: 0.7
        }
      })),
      label: {
        show: false
      },
      emphasis: {
        focus: 'self',
        itemStyle: {
          opacity: 1
        }
      }
    }]
  };

  const inst = echarts.init(el, null, { renderer: 'canvas' });
  inst.setOption(option);

  const onResize = () => { try { inst.resize(); } catch (e) {} };
  window.addEventListener('resize', onResize, { passive: true });

  return inst;
};

ns.echartsDealTypeBars = ns.echartsDealTypeHBars;

})();