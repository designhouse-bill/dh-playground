# Prompt 09B: Container Integration (BASE View Layout)

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: Prompt 09A (Detail Panel Component)

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 9B of the restructured series. The DetailPanelComponent was created in 09A. Now we integrate all BASE view components into the main container.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Update the main AnalyticDashboardComponent to integrate all components into a complete three-column BASE view layout.

---

## FILES CHECKLIST

### Files to CREATE:
None - this prompt modifies existing files only.

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `analytic-dashboard.component.ts` | Add state subscriptions, view helpers | ☐ |
| 2 | `analytic-dashboard.component.html` | Three-column layout with panels | ☐ |
| 3 | `analytic-dashboard.component.scss` | Layout styles for BASE/GRID/COMPARE views | ☐ |

### Required Imports for analytic-dashboard.component.ts:
```typescript
// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// RxJS
import { filter, Observable, Subject, takeUntil } from 'rxjs';

// Third-party
import * as moment from 'moment';

// App Core Services
import { AuthService } from '@app/core/services/auth.service';
import { CircularDateService } from '@app/core/services/circular-date.service';
import { CurrentNodeService } from '@app/core/services/current-node.service';
import { LocalStorageService } from '@app/core/services/local-storage.service';
import { PreviewService } from '@app/core/services/preview.service';

// App Core DTOs
import { UserDto } from '@app/core/dtos/user.dto';
import { NodeDto } from '@app/shared/dto/node.dto';

// App Enums
import { BrandTypeEnum } from '@app/shared/enums/brand-type.enum';

// Feature Services (2 levels deep from components/analytic-dashboard/)
import { AnalyticsStateService, AnalyticsFilterService } from '../../services';

// Feature Enums (2 levels deep)
import { ViewModeEnum, BaseViewTabEnum } from '../../enums';
```

---

## Tasks

### 1. Update `analytic-dashboard.component.ts`

**File:** `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.ts`

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '@app/core/dtos/user.dto';
import { AuthService } from '@app/core/services/auth.service';
import { CircularDateService } from '@app/core/services/circular-date.service';
import { CurrentNodeService } from '@app/core/services/current-node.service';
import { LocalStorageService } from '@app/core/services/local-storage.service';
import { PreviewService } from '@app/core/services/preview.service';
import { NodeDto } from '@app/shared/dto/node.dto';
import { BrandTypeEnum } from '@app/shared/enums/brand-type.enum';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { AnalyticsStateService, AnalyticsFilterService } from '../../services';
import { ViewModeEnum, BaseViewTabEnum } from '../../enums';
import * as moment from 'moment';

@Component({
  selector: 'dh-analytic-dashboard',
  templateUrl: './analytic-dashboard.component.html',
  styleUrls: ['./analytic-dashboard.component.scss'],
})
export class AnalyticDashboardComponent implements OnInit, OnDestroy {
  // Existing properties
  startDate: Date;
  dateParameter: Date;
  currentNode: NodeDto;
  unsubscribe$ = new Subject<void>();
  contentDate = new UntypedFormControl();
  filterGroup = new UntypedFormGroup({
    contentDate: this.contentDate,
  });

  // New state properties
  viewMode: ViewModeEnum = ViewModeEnum.BASE;
  baseViewTab: BaseViewTabEnum = BaseViewTabEnum.PROMOTIONS;
  detailPanelOpen = false;

  // Expose enums to template
  ViewModeEnum = ViewModeEnum;
  BaseViewTabEnum = BaseViewTabEnum;

  constructor(
    protected readonly circularDateService: CircularDateService,
    private readonly authService: AuthService,
    private readonly currentNodeService: CurrentNodeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly previewService: PreviewService,
    private readonly localStorageService: LocalStorageService,
    private readonly stateService: AnalyticsStateService,
    private readonly filterService: AnalyticsFilterService,
  ) {}

  ngOnInit() {
    // Existing initialization
    let useDefaultDate = false;
    this.authService.loggedUser$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((currentUser: UserDto) => {
        if (!currentUser) {
          return;
        }

        const currentBrandType = this.localStorageService.getBrandType();
        let nodeObservable: Observable<NodeDto>;
        switch (currentBrandType) {
          case BrandTypeEnum.Retail:
            nodeObservable = this.currentNodeService.node$;
            break;
          case BrandTypeEnum.Cpg:
            nodeObservable = this.currentNodeService.cpgNode$;
            break;
        }

        nodeObservable
          .pipe(takeUntil(this.unsubscribe$), filter<NodeDto>(Boolean))
          .subscribe((node) => {
            this.currentNode = node;
            this.getNodeData(useDefaultDate);
            setTimeout(() => {
              this.setDateParameter(this.contentDate.value);
            });
            useDefaultDate = true;
          });
      });

    // Subscribe to state changes
    this.stateService.viewMode$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(mode => {
        this.viewMode = mode;
      });

    this.stateService.baseViewTab$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(tab => {
        this.baseViewTab = tab;
      });

    this.stateService.detailPanelOpen$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(open => {
        this.detailPanelOpen = open;
      });

    // Initialize filter service from URL
    this.filterService.initFromUrl();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.stateService.resetState();
  }

  getNodeData(useDefaultDate = false) {
    this.setCurrentDateToToday();
    let filterDate = this.circularDateService.nextValidCircularDate(
      this.circularDateService.transformDate(this.contentDate.value),
      this.currentNode.circularStartDayOfWeek,
      this.currentNode.circularStartTimeOfDay,
      this.currentNode?.circularTimezoneOffset,
    );

    const dateURL = this.route.snapshot.queryParamMap.get('date');
    const utcDate = moment(dateURL, 'YYYYMMDDHHmm', true);
    if (utcDate.isValid() && !useDefaultDate) {
      this.dateParameter = this.circularDateService.convertUtcToNodeTimezone(
        utcDate,
        this.currentNode.circularTimezone,
      );
    } else {
      this.dateParameter = null;
      this.setDateParameter(filterDate);
    }

    this.startDate = filterDate;
    this.contentDate.setValue(this.dateParameter ?? filterDate);
  }

  setCurrentDateToToday(): void {
    const today = new Date();
    let newMinutes = today.getMinutes() + 15;
    if (today.getMinutes() % 15) {
      newMinutes -= today.getMinutes() % 15;
    }
    today.setMinutes(newMinutes, 0, 0);
    this.contentDate.setValue(today);
  }

  setDateParameter(date: Date) {
    const queryParams = { ...this.route.snapshot.queryParams };
    date = this.previewService.checkCurrentFilterDateTimeZoneForCampaign(
      date,
      this.currentNode.circularTimezone,
    );
    const utcDate = this.circularDateService.convertToUTC(
      date,
      this.currentNode.circularTimezoneOffset,
    );
    const dateString = this.circularDateService.convertDateToString(utcDate);
    const datePart = dateString.split('T')[0];
    const timePart = dateString.split('T')[1];
    const formattedDate = datePart.split('-').join('') + timePart.split(':').join('').substr(0, 4);

    queryParams['date'] = formattedDate;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  dateChange(customDate: boolean): void {
    this.setDateParameter(this.contentDate.value);
  }

  // Helper getters for template
  get showBaseView(): boolean {
    return this.viewMode === ViewModeEnum.BASE;
  }

  get showGridView(): boolean {
    return this.viewMode === ViewModeEnum.GRID;
  }

  get showCompareView(): boolean {
    return this.viewMode === ViewModeEnum.COMPARE;
  }

  get showPromotionsTab(): boolean {
    return this.baseViewTab === BaseViewTabEnum.PROMOTIONS;
  }

  get showCategoriesTab(): boolean {
    return this.baseViewTab === BaseViewTabEnum.CATEGORIES;
  }

  get showCircularsTab(): boolean {
    return this.baseViewTab === BaseViewTabEnum.CIRCULARS;
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES
✓ Compiles standalone: YES

---

### 2. Update `analytic-dashboard.component.html`

**File:** `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.html`

```html
<dh-subheader contentTitle="Analytics Dashboard" entityName="Analytics">
  <ng-template #toolbarLeftPanel>
    <dh-dashboard-view-switcher></dh-dashboard-view-switcher>
  </ng-template>
</dh-subheader>

<!-- Context Bar -->
<dh-dashboard-context-bar></dh-dashboard-context-bar>

<!-- Main Content Area -->
<div class="dashboard-content">
  <!-- BASE View: Three Column Layout -->
  <div class="base-view-layout" *ngIf="showBaseView">
    <!-- Left Panel: Category Sidebar -->
    <aside class="left-panel">
      <dh-category-sidebar></dh-category-sidebar>
    </aside>

    <!-- Center Panel: Content based on tab -->
    <main class="center-panel">
      <dh-promotions-panel *ngIf="showPromotionsTab"></dh-promotions-panel>
      <!-- Categories and Circulars panels will be added in prompt 10 -->
      <div class="placeholder-panel" *ngIf="showCategoriesTab">
        <p>Categories Panel - Coming Soon (Prompt 10A)</p>
      </div>
      <div class="placeholder-panel" *ngIf="showCircularsTab">
        <p>Circulars Panel - Coming Soon (Prompt 10B)</p>
      </div>
    </main>

    <!-- Right Panel: Detail Panel -->
    <dh-detail-panel></dh-detail-panel>
  </div>

  <!-- GRID View: Full Width Data Grid -->
  <div class="grid-view-layout" *ngIf="showGridView">
    <div class="placeholder-panel">
      <p>Grid Inquiry View - Coming in Prompt 11</p>
    </div>
  </div>

  <!-- COMPARE View: Side by Side -->
  <div class="compare-view-layout" *ngIf="showCompareView">
    <div class="placeholder-panel">
      <p>Compare View - Coming in Prompt 12A</p>
    </div>
  </div>
</div>
```

✓ This file is COMPLETE: YES
✓ All imports included: N/A (HTML)
✓ Compiles standalone: YES

---

### 3. Update `analytic-dashboard.component.scss`

**File:** `/src/app/analytic-dashboard/components/analytic-dashboard/analytic-dashboard.component.scss`

```scss
@import '../../styles/design-tokens';

:host {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  overflow: hidden;
  background: $gray-100;
}

// BASE View Layout - Three Column
.base-view-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  min-width: 280px;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

.center-panel {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

// GRID View Layout - Full Width
.grid-view-layout {
  height: 100%;
  padding: $spacing-md;
}

// COMPARE View Layout - Side by Side
.compare-view-layout {
  display: flex;
  height: 100%;
  padding: $spacing-md;
  gap: $spacing-md;
}

// Placeholder for future components
.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
  border-radius: $radius-md;
  color: $gray-500;

  p {
    margin: 0;
  }
}

// Tablet Responsive
@media (max-width: $breakpoint-tablet) {
  .base-view-layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid $gray-200;
  }
}
```

✓ This file is COMPLETE: YES
✓ All imports included: YES (design-tokens)
✓ Compiles standalone: YES

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
Navigate to: `http://localhost:4200/analytics`

Expected behavior:
1. **Three-column layout displays:**
   - Left: Category sidebar with categories
   - Center: Promotions table
   - Right: Detail panel (initially hidden/collapsed)

2. **Interaction test:**
   - Click a category → promotions should filter
   - Click a promotion → detail panel should slide open from right
   - Click close button on detail panel → panel should collapse

3. **View mode test:**
   - Toggle view modes (BASE | GRID | COMPARE) using view switcher
   - Verify layout changes with placeholders for GRID and COMPARE

4. **Tab test:**
   - Switch tabs in context bar (Promotions | Categories | Circulars)
   - Verify center panel shows appropriate content/placeholder

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] No hardcoded values (uses design tokens)
- [ ] Component selectors use `dh-` prefix
- [ ] Services via constructor injection

### Consistency with Prompt 00
- [ ] Formula reference: `CIV×1 + CC×10 + ATL×50` (displayed in detail panel)
- [ ] Colors: Uses $metric-* variables (in detail panel)
- [ ] Variables: `civ`, `cc`, `atl`, `compositeScore`

### Angular Patterns
- [ ] OnDestroy with takeUntil pattern
- [ ] State subscriptions properly cleaned up
- [ ] Services via constructor injection
- [ ] resetState() called on destroy

### Layout Verification
- [ ] Three-column layout for BASE view
- [ ] Responsive tablet breakpoint handles column stacking
- [ ] Detail panel transitions smoothly (width: 0 → 380px)

### Would this compile on first try? [YES]

---

## CHECKPOINT F: BASE View Integration Complete

Before proceeding to Prompt 10A (Categories Panel), verify:

### Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build
```
Expected: No errors

### Integration Check
- [ ] All three columns render correctly
- [ ] Category selection filters promotions
- [ ] Promotion selection opens detail panel
- [ ] View mode switching works
- [ ] Tab switching works (with placeholders for Categories/Circulars)

### Component Inventory (Should all exist):
- [ ] `dh-category-sidebar` (from 08A)
- [ ] `dh-promotions-panel` (from 08B)
- [ ] `dh-detail-panel` (from 09A)
- [ ] `dh-dashboard-view-switcher` (from 07)
- [ ] `dh-dashboard-context-bar` (from 07)

### Issues Found:
(List any issues here before continuing)

### Ready to Continue to Prompt 10A: [YES/NO]

---

## Notes for Prompt 10A
- BASE view with Promotions tab is now complete
- Next prompt adds CategoriesPanelComponent for the Categories tab
- Categories panel will show category list with drill-down to promotions
- Uses same detail panel for category details
