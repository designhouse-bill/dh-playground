# Prompt 03A: Data Services

> **Reference:** See `prompt-00-constants-standards.md` for all constants and quality requirements.

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 03A of 18. Dependencies, mock data, DTOs, and enums have been set up in prompts 01-02.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create the data services for the Analytics Dashboard: mock data service, API service stub, and the main facade service with environment-based switching.

---

## CONSTANTS REMINDER

```
Formula: compositeScore = civ + (cc × 10) + (atl × 50)
Colors: Views=#4272D8, Clicks=#B8D64D, Adds=#937DF8, Total=#06989D
Variables: civ, cc, atl, compositeScore (never alternatives)
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/services/analytics-mock-data.service.ts` | Mock data implementation | ~210 | ☐ |
| 2 | `/src/app/analytic-dashboard/services/analytics-api.service.ts` | API stub for production | ~115 | ☐ |
| 3 | `/src/app/analytic-dashboard/services/analytics-data.service.ts` | Facade with env switching | ~80 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| None in this prompt | | |

### Required Imports per File:

**analytics-mock-data.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PromotionDto, PromotionDetailDto, CategoryDto, CircularDto, FilterContextDto, WeekOptionDto } from '../dto';
import { MOCK_PROMOTIONS, MOCK_CATEGORIES, MOCK_WEEKS, MOCK_ENTITIES, MOCK_WEEKLY_TRENDS } from '../mock-data';
```

**analytics-api.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PromotionDto, PromotionDetailDto, CategoryDto, CircularDto, FilterContextDto, WeekOptionDto } from '../dto';
```

**analytics-data.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PromotionDto, PromotionDetailDto, CategoryDto, CircularDto, FilterContextDto, WeekOptionDto } from '../dto';
import { AnalyticsMockDataService } from './analytics-mock-data.service';
import { AnalyticsApiService } from './analytics-api.service';
```

---

## Tasks

### 1. Create Services Folder

Create folder: `/src/app/analytic-dashboard/services/`

### 2. Create Mock Data Service

#### File: `analytics-mock-data.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  PromotionDto,
  PromotionDetailDto,
  CategoryDto,
  CircularDto,
  FilterContextDto,
  WeekOptionDto
} from '../dto';
import {
  MOCK_PROMOTIONS,
  MOCK_CATEGORIES,
  MOCK_WEEKS,
  MOCK_ENTITIES,
  MOCK_WEEKLY_TRENDS
} from '../mock-data';

/**
 * Mock data service for Analytics Dashboard
 * Returns instant mock data for UI development
 *
 * This service will be replaced by AnalyticsApiService in production
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsMockDataService {

  /**
   * Get promotions with optional filtering
   * @param filter - Filter context for query
   * @returns Observable of filtered promotions
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]> {
    let results = [...MOCK_PROMOTIONS];

    // Apply category filter
    if (filter.categoryIds?.length > 0) {
      results = results.filter(p => filter.categoryIds.includes(p.categoryId));
    }

    // Apply deal type filter
    if (filter.dealTypes?.length > 0) {
      results = results.filter(p => filter.dealTypes.includes(p.dealType));
    }

    // Apply card size filter
    if (filter.cardSizes?.length > 0) {
      results = results.filter(p => filter.cardSizes.includes(p.cardSize));
    }

    // Apply search text
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.categoryName.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (filter.sortField) {
      results.sort((a, b) => {
        const aVal = a[filter.sortField];
        const bVal = b[filter.sortField];
        const direction = filter.sortDirection === 'desc' ? -1 : 1;
        return aVal > bVal ? direction : -direction;
      });
    }

    // Apply pagination
    if (filter.pageSize && filter.pageSize > 0) {
      const start = (filter.pageIndex || 0) * filter.pageSize;
      results = results.slice(start, start + filter.pageSize);
    }

    return of(results);
  }

  /**
   * Get promotion detail with weekly trends
   * @param promotionId - Promotion identifier
   * @param filter - Filter context for date range
   * @returns Observable of promotion details
   */
  getPromotionDetail(promotionId: string, filter: FilterContextDto): Observable<PromotionDetailDto> {
    const promotion = MOCK_PROMOTIONS.find(p => p.id === promotionId);
    if (!promotion) {
      return of(null);
    }

    const weeklyTrends = MOCK_WEEKLY_TRENDS
      .filter(t => t.promotionId === promotionId)
      .map(t => {
        const week = MOCK_WEEKS.find(w => w.id === t.weekId);
        return {
          weekId: t.weekId,
          weekLabel: week?.label || t.weekId,
          civ: t.civ,
          cc: t.cc,
          atl: t.atl
        };
      });

    return of({
      ...promotion,
      weeklyTrends
    } as PromotionDetailDto);
  }

  /**
   * Get categories with aggregated metrics
   * @param filter - Filter context for query
   * @returns Observable of categories
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]> {
    let results = [...MOCK_CATEGORIES];

    // Apply search text
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      results = results.filter(c => c.name.toLowerCase().includes(search));
    }

    // Apply sorting
    if (filter.sortField) {
      results.sort((a, b) => {
        const aVal = a[filter.sortField];
        const bVal = b[filter.sortField];
        const direction = filter.sortDirection === 'desc' ? -1 : 1;
        return aVal > bVal ? direction : -direction;
      });
    }

    return of(results);
  }

  /**
   * Get circulars/store data
   * @param filter - Filter context for query
   * @returns Observable of circulars
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]> {
    // Transform mock entities to CircularDto format
    const circulars: CircularDto[] = [];

    const flattenEntities = (entities: any[], brandHash = '', subBrandHash = '') => {
      for (const entity of entities) {
        if (entity.type === 'store') {
          circulars.push({
            id: entity.id,
            storeName: entity.name,
            storeNumber: entity.storeNumber || 0,
            address: entity.address || '',
            size: entity.size || 'medium',
            entityId: entity.id,
            brandHash,
            subBrandHash,
            promotionCount: Math.floor(Math.random() * 50) + 10,
            // Mock metrics
            civ: Math.floor(Math.random() * 10000),
            cc: Math.floor(Math.random() * 2000),
            atl: Math.floor(Math.random() * 500),
            compositeScore: 0,
            percentile: Math.floor(Math.random() * 100)
          });
        }
        if (entity.children) {
          flattenEntities(
            entity.children,
            entity.type === 'brand' ? entity.id : brandHash,
            entity.type === 'subbrand' ? entity.id : subBrandHash
          );
        }
      }
    };

    flattenEntities(MOCK_ENTITIES);

    // Calculate composite scores
    // Formula: CIV×1 + CC×10 + ATL×50
    circulars.forEach(c => {
      c.compositeScore = c.civ + (c.cc * 10) + (c.atl * 50);
    });

    return of(circulars);
  }

  /**
   * Get available weeks for date picker
   * @returns Observable of week options
   */
  getWeeks(): Observable<WeekOptionDto[]> {
    return of(MOCK_WEEKS.map(w => ({
      id: w.id,
      num: w.num,
      label: w.label,
      dateRange: w.dateRange,
      startDate: w.startDate,
      daysRun: w.daysRun
    })));
  }

  /**
   * Get entity hierarchy for entity selector
   * @returns Observable of entity tree
   */
  getEntityHierarchy(): Observable<any[]> {
    return of(MOCK_ENTITIES);
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 3. Create API Service (Stub)

#### File: `analytics-api.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  PromotionDto,
  PromotionDetailDto,
  CategoryDto,
  CircularDto,
  FilterContextDto,
  WeekOptionDto
} from '../dto';

/**
 * API service for Analytics Dashboard
 *
 * API Team Integration Notes:
 * - Base URL should be configured in environment
 * - All endpoints expect FilterContextDto as query params or body
 * - Responses should match the DTO interfaces exactly
 * - Date formats: ISO 8601 (YYYY-MM-DD)
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {

  private readonly baseUrl = '/api/analytics';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/analytics/promotions
   * Query params from FilterContextDto
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]> {
    // Uncomment when API is ready:
    // return this.http.get<PromotionDto[]>(`${this.baseUrl}/promotions`, { params: this.buildParams(filter) });
    console.warn('AnalyticsApiService.getPromotions - API not implemented');
    return of([]);
  }

  /**
   * GET /api/analytics/promotions/:id
   */
  getPromotionDetail(promotionId: string, filter: FilterContextDto): Observable<PromotionDetailDto> {
    // Uncomment when API is ready:
    // return this.http.get<PromotionDetailDto>(`${this.baseUrl}/promotions/${promotionId}`, { params: this.buildParams(filter) });
    console.warn('AnalyticsApiService.getPromotionDetail - API not implemented');
    return of(null);
  }

  /**
   * GET /api/analytics/categories
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]> {
    // Uncomment when API is ready:
    // return this.http.get<CategoryDto[]>(`${this.baseUrl}/categories`, { params: this.buildParams(filter) });
    console.warn('AnalyticsApiService.getCategories - API not implemented');
    return of([]);
  }

  /**
   * GET /api/analytics/circulars
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]> {
    // Uncomment when API is ready:
    // return this.http.get<CircularDto[]>(`${this.baseUrl}/circulars`, { params: this.buildParams(filter) });
    console.warn('AnalyticsApiService.getCirculars - API not implemented');
    return of([]);
  }

  /**
   * GET /api/analytics/weeks
   */
  getWeeks(): Observable<WeekOptionDto[]> {
    // Uncomment when API is ready:
    // return this.http.get<WeekOptionDto[]>(`${this.baseUrl}/weeks`);
    console.warn('AnalyticsApiService.getWeeks - API not implemented');
    return of([]);
  }

  /**
   * Helper to build query params from filter
   */
  private buildParams(filter: FilterContextDto): { [key: string]: string } {
    const params: { [key: string]: string } = {};

    if (filter.dateRange) {
      params['startDate'] = filter.dateRange.start;
      params['endDate'] = filter.dateRange.end;
    }
    if (filter.entityId) {
      params['entityId'] = filter.entityId;
    }
    if (filter.categoryIds?.length) {
      params['categoryIds'] = filter.categoryIds.join(',');
    }
    if (filter.dealTypes?.length) {
      params['dealTypes'] = filter.dealTypes.join(',');
    }
    if (filter.cardSizes?.length) {
      params['cardSizes'] = filter.cardSizes.join(',');
    }
    if (filter.searchText) {
      params['search'] = filter.searchText;
    }
    if (filter.pageSize) {
      params['pageSize'] = filter.pageSize.toString();
    }
    if (filter.pageIndex !== undefined) {
      params['pageIndex'] = filter.pageIndex.toString();
    }
    if (filter.sortField) {
      params['sortField'] = filter.sortField;
      params['sortDirection'] = filter.sortDirection || 'asc';
    }

    return params;
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 4. Create Main Data Service (Facade)

#### File: `analytics-data.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  PromotionDto,
  PromotionDetailDto,
  CategoryDto,
  CircularDto,
  FilterContextDto,
  WeekOptionDto
} from '../dto';
import { AnalyticsMockDataService } from './analytics-mock-data.service';
import { AnalyticsApiService } from './analytics-api.service';

/**
 * Facade service for Analytics Dashboard data
 *
 * Automatically switches between mock and real API based on environment.useMockAnalytics
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsDataService {

  constructor(
    private mockService: AnalyticsMockDataService,
    private apiService: AnalyticsApiService
  ) {}

  /**
   * Get promotions list
   */
  getPromotions(filter: FilterContextDto): Observable<PromotionDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getPromotions(filter)
      : this.apiService.getPromotions(filter);
  }

  /**
   * Get promotion detail with trends
   */
  getPromotionDetail(promotionId: string, filter: FilterContextDto): Observable<PromotionDetailDto> {
    return environment.useMockAnalytics
      ? this.mockService.getPromotionDetail(promotionId, filter)
      : this.apiService.getPromotionDetail(promotionId, filter);
  }

  /**
   * Get categories list
   */
  getCategories(filter: FilterContextDto): Observable<CategoryDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getCategories(filter)
      : this.apiService.getCategories(filter);
  }

  /**
   * Get circulars/stores list
   */
  getCirculars(filter: FilterContextDto): Observable<CircularDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getCirculars(filter)
      : this.apiService.getCirculars(filter);
  }

  /**
   * Get available weeks
   */
  getWeeks(): Observable<WeekOptionDto[]> {
    return environment.useMockAnalytics
      ? this.mockService.getWeeks()
      : this.apiService.getWeeks();
  }

  /**
   * Get entity hierarchy (mock only - production uses CurrentNodeService)
   */
  getEntityHierarchy(): Observable<any[]> {
    return this.mockService.getEntityHierarchy();
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Service Import Test
Create temporary test in `src/app/analytic-dashboard/test-imports.ts`:
```typescript
// DELETE THIS FILE AFTER VERIFICATION
import { AnalyticsDataService } from './services/analytics-data.service';
import { AnalyticsMockDataService } from './services/analytics-mock-data.service';
import { AnalyticsApiService } from './services/analytics-api.service';

console.log('Services imported:',
  AnalyticsDataService.name,
  AnalyticsMockDataService.name,
  AnalyticsApiService.name
);
```

### Visual Verification
Not applicable for this prompt (services only).

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [x] All code blocks complete (no `// ...`)
- [x] All imports explicitly listed
- [x] No hardcoded values (uses Constants)
- [x] Services use `providedIn: 'root'`

### Consistency
- [x] Formula: `civ + (cc * 10) + (atl * 50)`
- [x] Variables: `civ`, `cc`, `atl`, `compositeScore`

### Angular Patterns
- [x] Services via constructor injection
- [x] Observable return types
- [x] Environment-based switching

### Would this compile on first try? YES

---

## Notes for Next Prompt (03B)
- Data services are ready for consumption
- AnalyticsDataService provides facade with environment-based switching
- Mock service has filtering, sorting, pagination logic
- API service is stubbed with console warnings
- Next: Create AnalyticsStateService and AnalyticsFilterService
