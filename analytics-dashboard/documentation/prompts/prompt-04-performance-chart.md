# Prompt 04: Performance Chart Component

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: [Prompt 03B - State & Filter Services](./prompt-03b-state-filter-services.md)

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 4 of 18 in the restructured series. Dependencies, mock data, DTOs, enums, and services have been set up in prompts 01-03.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the PerformanceChartComponent using ngx-echarts. This is a HIGH REUSE component that displays stacked horizontal bar charts for Views (CIV), Clicks (CC), and Adds (ATL) metrics.

---

## Tasks

### 1. Create Shared Components Folder

Create folder: `/src/app/analytic-dashboard/components/shared/`

### 2. Create Animations File

Create `/src/app/analytic-dashboard/animations.ts`:
```typescript
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * Slide down animation for expandable panels
 * Usage: [@slideDown] on element with *ngIf
 */
export const slideDown = trigger('slideDown', [
  transition(':enter', [
    style({ height: 0, opacity: 0, overflow: 'hidden' }),
    animate('200ms ease-out', style({ height: '*', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ overflow: 'hidden' }),
    animate('200ms ease-in', style({ height: 0, opacity: 0 }))
  ])
]);

/**
 * Fade in animation for appearing elements
 * Usage: [@fadeIn] on element with *ngIf
 */
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('150ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 }))
  ])
]);
```

### 3. Create Styles Folder and Design Tokens

Create folder: `/src/app/analytic-dashboard/styles/`

#### 3.1 Create `_design-tokens.scss`
Port from prototype `shared/design-tokens.css`:
```scss
// Analytics Dashboard Design Tokens
// Ported from prototype for exact styling match

// Metric Colors
$metric-views-color: #4272D8;   // CIV - Blue
$metric-clicks-color: #B8D64D;  // CC - Green
$metric-adds-color: #937DF8;    // ATL - Purple
$metric-total-color: #06989D;   // Performance - Teal

// Gray Scale
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

// Spacing
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Border Radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

// Transitions
$transition-fast: 150ms ease;
$transition-normal: 200ms ease;
$transition-slow: 300ms ease;

// Font Sizes
$font-size-xs: 11px;
$font-size-sm: 12px;
$font-size-md: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;

// Breakpoints
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1200px;
```

### 4. Create Performance Chart Component

#### 4.1 Create component folder
`/src/app/analytic-dashboard/components/shared/performance-chart/`

#### 4.2 Create `performance-chart.component.ts`
```typescript
import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { EChartsOption } from 'echarts';

/**
 * Stacked horizontal bar chart for displaying analytics metrics
 *
 * HIGH REUSE COMPONENT - Can be used anywhere Views/Clicks/Adds need visualization
 *
 * @example
 * <dh-performance-chart
 *   [civValue]="promotion.civ"
 *   [ccValue]="promotion.cc"
 *   [atlValue]="promotion.atl"
 *   [maxValue]="maxPerformance"
 *   [showLegend]="true">
 * </dh-performance-chart>
 */
@Component({
  selector: 'dh-performance-chart',
  templateUrl: './performance-chart.component.html',
  styleUrls: ['./performance-chart.component.scss']
})
export class PerformanceChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  /**
   * CIV = Card Impression Views value
   */
  @Input() civValue: number = 0;

  /**
   * CC = Card Clicks value
   */
  @Input() ccValue: number = 0;

  /**
   * ATL = Add To List value
   */
  @Input() atlValue: number = 0;

  /**
   * Maximum value for scale (optional - auto-calculates if not provided)
   */
  @Input() maxValue: number = 0;

  /**
   * Chart height in pixels
   */
  @Input() height: number = 32;

  /**
   * Show legend below chart
   */
  @Input() showLegend: boolean = false;

  /**
   * Show value labels on bars
   */
  @Input() showLabels: boolean = false;

  /**
   * Compact mode for table cells
   */
  @Input() compact: boolean = false;

  /**
   * Chart configuration for ngx-echarts
   */
  chartOptions: EChartsOption = {};

  // Metric colors matching prototype design tokens
  private readonly COLORS = {
    views: '#4272D8',   // CIV - Blue
    clicks: '#B8D64D',  // CC - Green
    adds: '#937DF8'     // ATL - Purple
  };

  private resizeObserver: ResizeObserver | null = null;
  @ViewChild('chartContainer') chartContainer: ElementRef;

  ngOnInit(): void {
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['civValue'] || changes['ccValue'] || changes['atlValue'] || changes['maxValue']) {
      this.updateChartOptions();
    }
  }

  ngAfterViewInit(): void {
    // Set up resize observer for responsive charts
    if (this.chartContainer && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        // Chart will auto-resize via ngx-echarts
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * Calculate the composite score
   * Formula: CIV×1 + CC×10 + ATL×50
   */
  get compositeScore(): number {
    return this.civValue + (this.ccValue * 10) + (this.atlValue * 50);
  }

  /**
   * Update chart options when inputs change
   */
  private updateChartOptions(): void {
    const max = this.maxValue || this.calculateMaxValue();

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          return this.formatTooltip(params);
        },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12
        }
      },
      legend: this.showLegend ? {
        show: true,
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 11,
          color: '#666'
        },
        data: [
          { name: 'Views (CIV)', icon: 'roundRect' },
          { name: 'Clicks (CC)', icon: 'roundRect' },
          { name: 'Adds (ATL)', icon: 'roundRect' }
        ]
      } : { show: false },
      grid: {
        left: 0,
        right: this.showLabels ? 50 : 0,
        top: 0,
        bottom: this.showLegend ? 24 : 0,
        containLabel: false
      },
      xAxis: {
        type: 'value',
        max: max,
        show: false,
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: [''],
        show: false,
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: 'Views (CIV)',
          type: 'bar',
          stack: 'total',
          barWidth: this.compact ? 16 : this.height - 8,
          itemStyle: {
            color: this.COLORS.views,
            borderRadius: [2, 0, 0, 2]
          },
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              color: this.COLORS.views
            }
          },
          data: [this.civValue]
        },
        {
          name: 'Clicks (CC)',
          type: 'bar',
          stack: 'total',
          barWidth: this.compact ? 16 : this.height - 8,
          itemStyle: {
            color: this.COLORS.clicks
          },
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              color: this.COLORS.clicks
            }
          },
          data: [this.ccValue * 10] // Weighted value for visual proportion
        },
        {
          name: 'Adds (ATL)',
          type: 'bar',
          stack: 'total',
          barWidth: this.compact ? 16 : this.height - 8,
          itemStyle: {
            color: this.COLORS.adds,
            borderRadius: [0, 2, 2, 0]
          },
          label: this.showLabels ? {
            show: true,
            position: 'right',
            formatter: () => this.compositeScore.toLocaleString(),
            fontSize: 11,
            color: '#666'
          } : { show: false },
          emphasis: {
            itemStyle: {
              color: this.COLORS.adds
            }
          },
          data: [this.atlValue * 50] // Weighted value for visual proportion
        }
      ],
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut'
    };
  }

  /**
   * Calculate max value for scale
   * Uses same formula: CIV×1 + CC×10 + ATL×50
   */
  private calculateMaxValue(): number {
    const weighted = this.civValue + (this.ccValue * 10) + (this.atlValue * 50);
    // Add 20% padding to max
    return Math.ceil(weighted * 1.2);
  }

  /**
   * Format tooltip content
   */
  private formatTooltip(params: any[]): string {
    const lines = [
      `<div style="font-weight: 600; margin-bottom: 4px;">Performance</div>`,
      `<div style="display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 8px; height: 8px; background: ${this.COLORS.views}; border-radius: 2px;"></span>
        <span>Views (CIV):</span>
        <span style="font-weight: 600; margin-left: auto;">${this.civValue.toLocaleString()}</span>
      </div>`,
      `<div style="display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 8px; height: 8px; background: ${this.COLORS.clicks}; border-radius: 2px;"></span>
        <span>Clicks (CC):</span>
        <span style="font-weight: 600; margin-left: auto;">${this.ccValue.toLocaleString()}</span>
      </div>`,
      `<div style="display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 8px; height: 8px; background: ${this.COLORS.adds}; border-radius: 2px;"></span>
        <span>Adds (ATL):</span>
        <span style="font-weight: 600; margin-left: auto;">${this.atlValue.toLocaleString()}</span>
      </div>`,
      `<div style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 6px; padding-top: 6px; font-weight: 600;">
        Score: ${this.compositeScore.toLocaleString()}
      </div>`
    ];
    return lines.join('');
  }
}
```

#### 4.3 Create `performance-chart.component.html`
```html
<div #chartContainer
     class="performance-chart"
     [class.compact]="compact"
     [style.height.px]="showLegend ? height + 28 : height">
  <div echarts
       [options]="chartOptions"
       [style.height.px]="showLegend ? height + 28 : height"
       class="chart-instance">
  </div>
</div>
```

#### 4.4 Create `performance-chart.component.scss`
```scss
@import '../../../styles/design-tokens';

.performance-chart {
  width: 100%;
  min-width: 80px;
  position: relative;

  .chart-instance {
    width: 100%;
  }

  &.compact {
    min-width: 60px;

    .chart-instance {
      height: 20px !important;
    }
  }
}

// Override echarts tooltip styles
:host ::ng-deep {
  .echarts-tooltip {
    padding: $spacing-sm $spacing-md !important;
    border-radius: $radius-sm !important;
    font-family: inherit !important;
  }
}
```

### 5. Create Trend Chart Component (for Detail Panel)

#### 5.1 Create component folder
`/src/app/analytic-dashboard/components/shared/trend-chart/`

#### 5.2 Create `trend-chart.component.ts`
```typescript
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { WeeklyTrendDto } from '../../../dto';

/**
 * Line chart for displaying weekly performance trends
 *
 * @example
 * <dh-trend-chart
 *   [trendData]="promotion.weeklyTrends"
 *   [height]="200">
 * </dh-trend-chart>
 */
@Component({
  selector: 'dh-trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.scss']
})
export class TrendChartComponent implements OnInit, OnChanges {

  @Input() trendData: WeeklyTrendDto[] = [];
  @Input() height: number = 200;
  @Input() showLegend: boolean = true;

  chartOptions: EChartsOption = {};

  private readonly COLORS = {
    views: '#4272D8',
    clicks: '#B8D64D',
    adds: '#937DF8'
  };

  ngOnInit(): void {
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trendData']) {
      this.updateChartOptions();
    }
  }

  private updateChartOptions(): void {
    if (!this.trendData || this.trendData.length === 0) {
      this.chartOptions = {};
      return;
    }

    const weeks = this.trendData.map(d => d.weekLabel);

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12
        }
      },
      legend: this.showLegend ? {
        show: true,
        bottom: 0,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 11,
          color: '#666'
        }
      } : { show: false },
      grid: {
        left: 40,
        right: 16,
        top: 16,
        bottom: this.showLegend ? 40 : 24,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: weeks,
        axisLine: {
          lineStyle: { color: '#e0e0e0' }
        },
        axisLabel: {
          fontSize: 11,
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: {
          lineStyle: { color: '#f0f0f0' }
        },
        axisLabel: {
          fontSize: 11,
          color: '#666',
          formatter: (value: number) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value.toString();
          }
        }
      },
      series: [
        {
          name: 'Views (CIV)',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: this.COLORS.views,
            width: 2
          },
          itemStyle: {
            color: this.COLORS.views
          },
          data: this.trendData.map(d => d.civ)
        },
        {
          name: 'Clicks (CC)',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: this.COLORS.clicks,
            width: 2
          },
          itemStyle: {
            color: this.COLORS.clicks
          },
          data: this.trendData.map(d => d.cc)
        },
        {
          name: 'Adds (ATL)',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: this.COLORS.adds,
            width: 2
          },
          itemStyle: {
            color: this.COLORS.adds
          },
          data: this.trendData.map(d => d.atl)
        }
      ],
      animation: true,
      animationDuration: 500
    };
  }
}
```

#### 5.3 Create `trend-chart.component.html`
```html
<div class="trend-chart" [style.height.px]="height">
  <div *ngIf="trendData?.length > 0; else noData"
       echarts
       [options]="chartOptions"
       [style.height.px]="height"
       class="chart-instance">
  </div>
  <ng-template #noData>
    <div class="no-data">
      <span class="material-symbols-outlined">show_chart</span>
      <p>No trend data available</p>
    </div>
  </ng-template>
</div>
```

#### 5.4 Create `trend-chart.component.scss`
```scss
@import '../../../styles/design-tokens';

.trend-chart {
  width: 100%;
  position: relative;

  .chart-instance {
    width: 100%;
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: $gray-500;

    .material-symbols-outlined {
      font-size: 32px;
      margin-bottom: $spacing-sm;
    }

    p {
      margin: 0;
      font-size: $font-size-sm;
    }
  }
}
```

### 6. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
import { AnalyticDashboardComponent } from './analytic-dashboard/analytic-dashboard.component';
import { PerformanceChartComponent } from './shared/performance-chart/performance-chart.component';
import { TrendChartComponent } from './shared/trend-chart/trend-chart.component';

export const components = [
  AnalyticDashboardComponent,
  PerformanceChartComponent,
  TrendChartComponent
];

export * from './analytic-dashboard/analytic-dashboard.component';
export * from './shared/performance-chart/performance-chart.component';
export * from './shared/trend-chart/trend-chart.component';
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/animations.ts` | Reusable animations (slideDown, fadeIn) | ~54 | ☐ |
| 2 | `/src/app/analytic-dashboard/styles/_design-tokens.scss` | SCSS design tokens | ~116 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/shared/performance-chart/performance-chart.component.ts` | Stacked bar chart component | ~401 | ☐ |
| 4 | `/src/app/analytic-dashboard/components/shared/performance-chart/performance-chart.component.html` | Chart template | ~16 | ☐ |
| 5 | `/src/app/analytic-dashboard/components/shared/performance-chart/performance-chart.component.scss` | Chart styles | ~48 | ☐ |
| 6 | `/src/app/analytic-dashboard/components/shared/trend-chart/trend-chart.component.ts` | Line chart for trends | ~214 | ☐ |
| 7 | `/src/app/analytic-dashboard/components/shared/trend-chart/trend-chart.component.html` | Trend chart template | ~33 | ☐ |
| 8 | `/src/app/analytic-dashboard/components/shared/trend-chart/trend-chart.component.scss` | Trend chart styles | ~65 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add PerformanceChartComponent, TrendChartComponent exports | ☐ |

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
1. Add chart to a test template:
   ```html
   <dh-performance-chart
     [civValue]="5000"
     [ccValue]="800"
     [atlValue]="150"
     [height]="32"
     [showLabels]="true">
   </dh-performance-chart>
   ```
2. Navigate to test page
3. Expected:
   - Horizontal stacked bar chart renders
   - Blue segment (Views): #4272D8
   - Green segment (Clicks): #B8D64D
   - Purple segment (Adds): #937DF8
   - Tooltip shows all 3 metrics on hover

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] No hardcoded metric colors (use COLORS constant)
- [ ] Component selectors use `dh-` prefix
- [ ] OnDestroy with takeUntil pattern in PerformanceChartComponent

### Consistency with Prompt 00
- [ ] Formula: `civ + (cc * 10) + (atl * 50)` ✓
- [ ] Colors: Views=#4272D8, Clicks=#B8D64D, Adds=#937DF8, Total=#06989D ✓
- [ ] Variables: `civ`, `cc`, `atl`, `compositeScore` (no alternatives) ✓
- [ ] SCSS uses token variables (`$metric-views-color`, etc.) ✓

### Angular Patterns
- [ ] Components properly implement lifecycle hooks
- [ ] @Input/@Output properly typed
- [ ] Animations imported and registered
- [ ] ResizeObserver cleanup in ngOnDestroy

### Would this compile on first try? [YES/NO]

---

## CHECKPOINT C: Charts Ready

Before proceeding to Prompt 05, verify:

1. **Compile Check:** `yarn build` passes without errors
2. **Import Check:** No "Cannot find module" errors
3. **Constants Check:**
   - Formula matches: `civ + (cc * 10) + (atl * 50)`
   - Colors match Prompt 00 exactly
4. **Pattern Check:** Both chart components have proper lifecycle management
5. **Visual Check:** PerformanceChartComponent renders with correct colors

### Issues Found:
(List any issues here before continuing)

### Ready to Continue: [YES/NO]

---

## Notes for Next Prompt
- PerformanceChartComponent is ready for use in tables, cards, and detail panels
- TrendChartComponent is ready for weekly trend visualization
- Design tokens established for consistent styling across all components
- Both components use ngx-echarts with typed EChartsOption
- Next: Prompt 05 will create metric display and filter components
