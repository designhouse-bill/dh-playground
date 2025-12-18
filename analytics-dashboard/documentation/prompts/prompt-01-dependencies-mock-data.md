# Prompt 01: Dependencies + Mock Data Setup

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Working Angular 17.3.12 repository with PrimeNG 17.18.15

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is the first prompt in an 18-part restructured series. The feature will use mock data initially, with an environment-based toggle to switch to real APIs later.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Install required dependencies and set up the mock data infrastructure for the Analytics Dashboard.

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/mock-data/mock-weeks.data.ts` | Week definitions | ~50 | ☐ |
| 2 | `/src/app/analytic-dashboard/mock-data/mock-entities.data.ts` | Entity hierarchy | ~100 | ☐ |
| 3 | `/src/app/analytic-dashboard/mock-data/mock-promotions.data.ts` | Promotion data | ~200 | ☐ |
| 4 | `/src/app/analytic-dashboard/mock-data/mock-categories.data.ts` | Category data | ~80 | ☐ |
| 5 | `/src/app/analytic-dashboard/mock-data/mock-weekly-trends.data.ts` | Trend data | ~60 | ☐ |
| 6 | `/src/app/analytic-dashboard/mock-data/index.ts` | Barrel export | ~10 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `package.json` | Add echarts, ngx-echarts | ☐ |
| 2 | `angular.json` | Add echarts to allowedCommonJsDependencies, add stylePreprocessorOptions | ☐ |
| 3 | `/src/environments/environment.ts` | Add useMockAnalytics flag | ☐ |
| 4 | `/src/environments/environment.prod.ts` | Add useMockAnalytics flag | ☐ |
| 5 | `/src/app/analytic-dashboard/analytic-dashboard.module.ts` | Complete module configuration | ☐ |

---

## Tasks

### 1. Install Dependencies

Add to `package.json` dependencies:
```json
"echarts": "^5.4.0",
"ngx-echarts": "^17.1.0"
```

Run: `yarn add echarts ngx-echarts`

### 2. Update angular.json

Add `echarts` to allowedCommonJsDependencies (if not already present):
```json
"allowedCommonJsDependencies": [
  "echarts"
]
```

Add SCSS include paths for consistent imports across component depths:
```json
"stylePreprocessorOptions": {
  "includePaths": ["src/app/analytic-dashboard/styles"]
}
```

This allows components at any depth to use `@import 'design-tokens';` without relative path prefixes.

### 3. Create Mock Data Folder Structure

Create the following folder:
```
/src/app/analytic-dashboard/mock-data/
```

### 4. Port Mock Data Files

Convert the following JavaScript files to TypeScript with proper typing. The source files are located at `/Users/billklingensmith/Code/mydarndest-playground/analytics-dashboard/shared/`:

#### 4.1 Create `mock-weeks.data.ts`
Extract week definitions from `mock-data.js`:
```typescript
// mock-weeks.data.ts
export interface WeekData {
  id: string;
  num: number;
  label: string;
  dateRange: string;
  startDate: string;
  daysRun: number;
}

export const MOCK_WEEKS: WeekData[] = [
  // Port week data from prototype
];
```

#### 4.2 Create `mock-entities.data.ts`
Port from `mock-entities.js`:
```typescript
// mock-entities.data.ts
export interface MockEntity {
  id: string;
  name: string;
  type: 'brand' | 'subbrand' | 'store';
  size?: 'large' | 'medium' | 'small';
  address?: string;
  storeNumber?: number;
  children?: MockEntity[];
}

export const MOCK_ENTITIES: MockEntity[] = [
  // Port entity hierarchy from prototype
];
```

#### 4.3 Create `mock-promotions.data.ts`
Port from `mock-promotions-expanded.js`:
```typescript
// mock-promotions.data.ts
export interface MockPromotion {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  dealType: string;
  unit: string;
  originalPrice: number;
  salePrice: number;
  cardSize: '1x1' | '2x1' | '2x2';
  /** CIV = Card Impression Views */
  civ: number;
  /** CC = Card Clicks */
  cc: number;
  /** ATL = Add To List */
  atl: number;
  compositeScore: number;
  percentile: number;
  storeCount: number;
}

export const MOCK_PROMOTIONS: MockPromotion[] = [
  // Port promotion data from prototype
];
```

#### 4.4 Create `mock-categories.data.ts`
Extract category data:
```typescript
// mock-categories.data.ts
export interface MockCategory {
  id: string;
  name: string;
  /** CIV = Card Impression Views */
  civ: number;
  /** CC = Card Clicks */
  cc: number;
  /** ATL = Add To List */
  atl: number;
  compositeScore: number;
  percentile: number;
  promotionCount: number;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  // Port category data from prototype
];
```

#### 4.5 Create `mock-weekly-trends.data.ts`
Port from `mock-weekly-data.js`:
```typescript
// mock-weekly-trends.data.ts
export interface WeeklyTrendData {
  weekId: string;
  promotionId: string;
  civ: number;
  cc: number;
  atl: number;
}

export const MOCK_WEEKLY_TRENDS: WeeklyTrendData[] = [
  // Port weekly trend data from prototype
];
```

#### 4.6 Create barrel export `index.ts`
```typescript
// mock-data/index.ts
export * from './mock-weeks.data';
export * from './mock-entities.data';
export * from './mock-promotions.data';
export * from './mock-categories.data';
export * from './mock-weekly-trends.data';
```

### 5. Add Environment Toggle

#### 5.1 Update `environment.ts`
```typescript
export const environment = {
  // ... existing properties
  useMockAnalytics: true  // Toggle for mock vs real API
};
```

#### 5.2 Update `environment.prod.ts`
```typescript
export const environment = {
  // ... existing properties
  useMockAnalytics: false  // Use real API in production
};
```

### 6. Update Module Configuration

Update `/src/app/analytic-dashboard/analytic-dashboard.module.ts` with complete imports needed for all dashboard components:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

// PrimeNG Modules - All modules needed for dashboard components
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { SelectButtonModule } from 'primeng/selectbutton';

import { SharedModule } from '@app/shared/shared.module';
import { AnalyticDashboardRoutingModule } from './analytic-dashboard-routing.module';
import * as fromComponents from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    // PrimeNG
    TableModule,
    TreeModule,
    DropdownModule,
    CheckboxModule,
    ChipModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    SkeletonModule,
    TooltipModule,
    TagModule,
    PaginatorModule,
    DynamicDialogModule,
    SelectButtonModule,
    AnalyticDashboardRoutingModule
  ],
  providers: [DialogService],
  declarations: [...fromComponents.components],
  exports: [...fromComponents.components]
})
export class AnalyticDashboardModule {}
```

**Note:** Ensure `BrowserAnimationsModule` is imported in the root `AppModule` for Angular animations to work.

---

## Files to Create
- `/src/app/analytic-dashboard/mock-data/mock-weeks.data.ts`
- `/src/app/analytic-dashboard/mock-data/mock-entities.data.ts`
- `/src/app/analytic-dashboard/mock-data/mock-promotions.data.ts`
- `/src/app/analytic-dashboard/mock-data/mock-categories.data.ts`
- `/src/app/analytic-dashboard/mock-data/mock-weekly-trends.data.ts`
- `/src/app/analytic-dashboard/mock-data/index.ts`

## Files to Modify
- `package.json` - Add echarts, ngx-echarts
- `angular.json` - Add echarts to allowedCommonJsDependencies, add stylePreprocessorOptions
- `/src/environments/environment.ts` - Add useMockAnalytics flag
- `/src/environments/environment.prod.ts` - Add useMockAnalytics flag
- `/src/app/analytic-dashboard/analytic-dashboard.module.ts` - Complete module configuration with all PrimeNG imports

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn install && yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```
Expected: No errors related to analytics-dashboard module

### Verification Steps

1. Run `yarn install` - Should complete without errors
2. Run `yarn build` - Should compile successfully
3. Verify mock data imports work:
   ```typescript
   import { MOCK_PROMOTIONS, MOCK_CATEGORIES } from './mock-data';
   console.log('Promotions:', MOCK_PROMOTIONS.length);
   console.log('Categories:', MOCK_CATEGORIES.length);
   ```
4. Verify environment flag is accessible:
   ```typescript
   import { environment } from '@environments/environment';
   console.log('Using mock data:', environment.useMockAnalytics);
   ```

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All TypeScript interfaces have proper JSDoc comments
- [ ] Variable names use `civ`, `cc`, `atl`, `compositeScore` (per Prompt 00)
- [ ] Mock data uses correct formula: `compositeScore = civ + (cc × 10) + (atl × 50)`
- [ ] No hardcoded values that should be in constants

### Configuration
- [ ] `package.json` has correct echarts/ngx-echarts versions
- [ ] `angular.json` includes `echarts` in allowedCommonJsDependencies
- [ ] `angular.json` includes stylePreprocessorOptions with correct path
- [ ] Both environment files have `useMockAnalytics` flag

### Module Setup
- [ ] All required PrimeNG modules imported
- [ ] NgxEchartsModule configured with lazy import
- [ ] BrowserAnimationsModule verified in root AppModule

### Would this compile on first try? [YES/NO]

---

## CHECKPOINT A: Foundation Complete

Before proceeding to Prompt 02 (DTOs + Enums), verify:

```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build
```
Expected: Build completes with 0 errors

### Checklist:
- [ ] Dependencies installed successfully
- [ ] Mock data files created and exportable
- [ ] Environment flags in place
- [ ] Module configuration complete

### Issues Found:
(List any issues here before continuing)

### Ready to Continue to Prompt 02: [YES/NO]

---

## Notes for Next Prompt
- Mock data is now available for service consumption
- NgxEchartsModule is configured and ready
- Environment toggle is in place for future API switchover
- Prompt 02 will create DTOs and Enums that consume mock data interfaces
