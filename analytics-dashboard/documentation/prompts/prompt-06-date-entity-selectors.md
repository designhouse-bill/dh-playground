# Prompt 06: Date/Entity Selectors

## Prerequisites
- **MUST READ FIRST:** [Prompt 00 - Constants & Standards](./prompt-00-constants-standards.md)
- Completed: [Prompt 05 - Metric Filter Components](./prompt-05-metric-filter-components.md)

## Context
You are implementing the Analytics Dashboard feature in the `ideal-sale-circular` Angular repository. This is prompt 6 of 18 in the restructured series. Metric and filter components have been set up in prompt 05.

## Working Directory
`/Users/billklingensmith/Code/ideal-sale-circular`

## Objective
Create DateRangePickerComponent and EntityTreeSelectorComponent. The entity selector should leverage the existing CurrentNodeService for parity with the rest of the application.

---

## Tasks

### 1. Create Date Range Picker Component

This component provides week tabs + custom date range selection, integrating with existing CircularDateService.

#### 1.1 Create component folder
`/src/app/analytic-dashboard/components/shared/date-range-picker/`

#### 1.2 Create `date-range-picker.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsFilterService, AnalyticsDataService } from '../../../services';
import { DateRangeDto, WeekOptionDto } from '../../../dto';
import { slideDown } from '../../../animations';

/**
 * Date range picker with week tabs and custom date selection
 * Integrates with CircularDateService for timezone handling
 */
@Component({
  selector: 'dh-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
  animations: [slideDown]
})
export class DateRangePickerComponent implements OnInit, OnDestroy {

  @Output() dateRangeChanged = new EventEmitter<DateRangeDto>();

  weeks: WeekOptionDto[] = [];
  selectedWeekId: string | null = null;
  showCustomRange = false;

  startDateControl = new UntypedFormControl();
  endDateControl = new UntypedFormControl();

  loading = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private filterService: AnalyticsFilterService,
    private dataService: AnalyticsDataService
  ) {}

  ngOnInit(): void {
    this.loadWeeks();
    this.initializeFromFilter();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadWeeks(): void {
    this.loading = true;
    this.dataService.getWeeks()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(weeks => {
        this.weeks = weeks;
        this.loading = false;

        // Select most recent week by default if no selection
        if (!this.selectedWeekId && weeks.length > 0) {
          this.selectWeek(weeks[0]);
        }
      });
  }

  private initializeFromFilter(): void {
    const filter = this.filterService.getFilterContext();
    if (filter.dateRange) {
      this.startDateControl.setValue(new Date(filter.dateRange.start));
      this.endDateControl.setValue(new Date(filter.dateRange.end));

      // Check if it matches a week
      if (filter.dateRange.weekId) {
        this.selectedWeekId = filter.dateRange.weekId;
      }
    }
  }

  selectWeek(week: WeekOptionDto): void {
    this.selectedWeekId = week.id;
    this.showCustomRange = false;

    const dateRange: DateRangeDto = {
      start: week.startDate,
      end: this.calculateEndDate(week.startDate, week.daysRun),
      weekId: week.id
    };

    this.filterService.setDateRange(dateRange);
    this.dateRangeChanged.emit(dateRange);
  }

  toggleCustomRange(): void {
    this.showCustomRange = !this.showCustomRange;
    if (this.showCustomRange) {
      this.selectedWeekId = null;
    }
  }

  applyCustomRange(): void {
    const start = this.startDateControl.value;
    const end = this.endDateControl.value;

    if (start && end) {
      const dateRange: DateRangeDto = {
        start: this.formatDate(start),
        end: this.formatDate(end)
      };

      this.filterService.setDateRange(dateRange);
      this.dateRangeChanged.emit(dateRange);
    }
  }

  isWeekSelected(week: WeekOptionDto): boolean {
    return this.selectedWeekId === week.id;
  }

  private calculateEndDate(startDate: string, daysRun: number): string {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + (daysRun - 1) * 24 * 60 * 60 * 1000);
    return this.formatDate(end);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

#### 1.3 Create `date-range-picker.component.html`
```html
<div class="date-range-picker">
  <!-- Week Tabs -->
  <div class="week-tabs" *ngIf="!loading && weeks.length > 0">
    <button
      *ngFor="let week of weeks"
      class="week-tab"
      [class.active]="isWeekSelected(week)"
      (click)="selectWeek(week)"
      pTooltip="{{ week.dateRange }}"
      tooltipPosition="bottom">
      {{ week.label }}
    </button>
    <button
      class="week-tab custom-tab"
      [class.active]="showCustomRange"
      (click)="toggleCustomRange()">
      <span class="material-symbols-outlined">date_range</span>
      Custom
    </button>
  </div>

  <!-- Loading State -->
  <div class="week-tabs loading" *ngIf="loading">
    <p-skeleton width="80px" height="32px" *ngFor="let i of [1,2,3,4,5]"></p-skeleton>
  </div>

  <!-- Custom Date Range Panel -->
  <div class="custom-range-panel" *ngIf="showCustomRange" [@slideDown]>
    <div class="date-inputs">
      <div class="date-field">
        <label>Start Date</label>
        <p-calendar
          [formControl]="startDateControl"
          dateFormat="mm/dd/yy"
          [showIcon]="true"
          [maxDate]="endDateControl.value"
          placeholder="Select start date">
        </p-calendar>
      </div>
      <span class="date-separator">to</span>
      <div class="date-field">
        <label>End Date</label>
        <p-calendar
          [formControl]="endDateControl"
          dateFormat="mm/dd/yy"
          [showIcon]="true"
          [minDate]="startDateControl.value"
          placeholder="Select end date">
        </p-calendar>
      </div>
    </div>
    <button
      pButton
      type="button"
      label="Apply"
      class="p-button-sm apply-btn"
      [disabled]="!startDateControl.value || !endDateControl.value"
      (click)="applyCustomRange()">
    </button>
  </div>
</div>
```

#### 1.4 Create `date-range-picker.component.scss`
```scss
@import '../../../styles/design-tokens';

.date-range-picker {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.week-tabs {
  display: flex;
  gap: $spacing-xs;
  flex-wrap: wrap;

  &.loading {
    gap: $spacing-sm;
  }
}

.week-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: $spacing-xs $spacing-md;
  border: 1px solid $gray-300;
  border-radius: $radius-md;
  background: white;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $gray-700;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $metric-views-color;
    color: $metric-views-color;
  }

  &.active {
    background: $metric-views-color;
    border-color: $metric-views-color;
    color: white;
  }

  &.custom-tab {
    .material-symbols-outlined {
      font-size: 16px;
    }
  }
}

.custom-range-panel {
  display: flex;
  align-items: flex-end;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $gray-50;
  border-radius: $radius-md;
  border: 1px solid $gray-200;
}

.date-inputs {
  display: flex;
  align-items: flex-end;
  gap: $spacing-sm;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  label {
    font-size: $font-size-xs;
    font-weight: 500;
    color: $gray-600;
  }
}

.date-separator {
  padding-bottom: 8px;
  color: $gray-500;
  font-size: $font-size-sm;
}

.apply-btn {
  margin-left: auto;
}

// Responsive
@media (max-width: $breakpoint-tablet) {
  .custom-range-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .date-separator {
    display: none;
  }

  .apply-btn {
    margin-left: 0;
    margin-top: $spacing-sm;
  }
}
```

### 2. Create Entity Tree Selector Component

This component leverages CurrentNodeService for parity with existing patterns.

#### 2.1 Create component folder
`/src/app/analytic-dashboard/components/shared/entity-selector/`

#### 2.2 Create `entity-selector.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil, combineLatest, filter } from 'rxjs';
import { CurrentNodeService } from '@app/core/services/current-node.service';
import { LocalStorageService } from '@app/core/services/local-storage.service';
import { BrandRepository } from '@app/core/repositories/brand.repository';
import { NodeDto } from '@app/shared/dto/node.dto';
import { BrandTypeEnum } from '@app/shared/enums/brand-type.enum';
import { NodeTypeEnum } from '@app/shared/enums/node-type.enum';
import { AnalyticsFilterService } from '../../../services';
import { TreeNode } from 'primeng/api';
import { fadeIn } from '../../../animations';

/**
 * Entity selector that leverages CurrentNodeService for parity
 * Shows Brand → Sub-brand → Store hierarchy
 */
@Component({
  selector: 'dh-entity-selector',
  templateUrl: './entity-selector.component.html',
  styleUrls: ['./entity-selector.component.scss'],
  animations: [fadeIn]
})
export class EntitySelectorComponent implements OnInit, OnDestroy {

  @Output() entitySelected = new EventEmitter<string>();

  currentNode: NodeDto | null = null;
  treeNodes: TreeNode[] = [];
  selectedNode: TreeNode | null = null;

  showSelector = false;
  loading = false;
  searchText = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private currentNodeService: CurrentNodeService,
    private localStorageService: LocalStorageService,
    private brandRepository: BrandRepository,
    private filterService: AnalyticsFilterService
  ) {}

  ngOnInit(): void {
    this.subscribeToCurrentNode();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private subscribeToCurrentNode(): void {
    const brandType = this.localStorageService.getBrandType();

    // Subscribe to the appropriate node observable based on brand type
    const nodeObservable = brandType === BrandTypeEnum.Cpg
      ? this.currentNodeService.cpgNode$
      : this.currentNodeService.node$;

    nodeObservable
      .pipe(
        takeUntil(this.unsubscribe$),
        filter<NodeDto>(Boolean)
      )
      .subscribe(node => {
        this.currentNode = node;
        this.loadEntityTree(node);

        // Update filter with current entity
        this.filterService.setEntityId(node.hash);
        this.entitySelected.emit(node.hash);
      });
  }

  private loadEntityTree(node: NodeDto): void {
    if (!node?.brandHash) return;

    this.loading = true;

    // Load all stores under the brand for the tree
    this.brandRepository.getAllStoresUnderBrand(node.brandHash, node.hash)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(stores => {
        this.treeNodes = this.buildTreeNodes(stores, node);
        this.loading = false;
      });
  }

  private buildTreeNodes(stores: NodeDto[], currentNode: NodeDto): TreeNode[] {
    // Group stores by parent hierarchy
    const brandNode: TreeNode = {
      key: currentNode.brandHash,
      label: this.getBrandLabel(currentNode),
      data: { hash: currentNode.brandHash, type: NodeTypeEnum.Brand },
      icon: 'pi pi-building',
      expanded: true,
      children: []
    };

    // Create sub-brand groupings if applicable
    const subBrandMap = new Map<string, TreeNode>();

    stores.forEach(store => {
      const storeNode: TreeNode = {
        key: store.hash,
        label: store.name,
        data: { hash: store.hash, type: NodeTypeEnum.Store, node: store },
        icon: 'pi pi-map-marker',
        leaf: true
      };

      if (store.hierarchyParentHash && store.hierarchyParentHash !== currentNode.brandHash) {
        // Has a sub-brand parent
        if (!subBrandMap.has(store.hierarchyParentHash)) {
          subBrandMap.set(store.hierarchyParentHash, {
            key: store.hierarchyParentHash,
            label: store.parentHash ? `Sub-brand` : 'Group',
            data: { hash: store.hierarchyParentHash, type: NodeTypeEnum.SubBrand },
            icon: 'pi pi-folder',
            expanded: false,
            children: []
          });
        }
        subBrandMap.get(store.hierarchyParentHash)!.children!.push(storeNode);
      } else {
        // Direct child of brand
        brandNode.children!.push(storeNode);
      }
    });

    // Add sub-brands to brand node
    subBrandMap.forEach(subBrand => {
      brandNode.children!.unshift(subBrand);
    });

    return [brandNode];
  }

  private getBrandLabel(node: NodeDto): string {
    // Try to get the brand name from the node
    return node.name || 'All Stores';
  }

  toggleSelector(): void {
    this.showSelector = !this.showSelector;
  }

  onNodeSelect(event: any): void {
    const nodeData = event.node?.data;
    if (nodeData?.hash) {
      this.filterService.setEntityId(nodeData.hash);
      this.entitySelected.emit(nodeData.hash);
      this.showSelector = false;
    }
  }

  filterTree(): void {
    // Implement tree filtering based on searchText
    // This is a simple filter - can be enhanced
  }

  get displayLabel(): string {
    if (!this.currentNode) return 'Select Entity';
    return this.currentNode.name || 'All Stores';
  }

  get nodeTypeLabel(): string {
    if (!this.currentNode?.type) return '';
    return this.currentNode.type;
  }
}
```

#### 2.3 Create `entity-selector.component.html`
```html
<div class="entity-selector">
  <!-- Display Button -->
  <button
    class="selector-button"
    (click)="toggleSelector()"
    pTooltip="Select store or group"
    tooltipPosition="bottom">
    <span class="material-symbols-outlined">store</span>
    <div class="button-content">
      <span class="entity-label">{{ displayLabel }}</span>
      <span class="entity-type" *ngIf="nodeTypeLabel">{{ nodeTypeLabel }}</span>
    </div>
    <span class="material-symbols-outlined chevron">
      {{ showSelector ? 'expand_less' : 'expand_more' }}
    </span>
  </button>

  <!-- Dropdown Panel -->
  <div class="selector-panel" *ngIf="showSelector" [@fadeIn]>
    <!-- Search -->
    <div class="search-container">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input
          type="text"
          pInputText
          placeholder="Search stores..."
          [(ngModel)]="searchText"
          (input)="filterTree()">
      </span>
    </div>

    <!-- Tree -->
    <div class="tree-container" *ngIf="!loading; else loadingTpl">
      <p-tree
        [value]="treeNodes"
        selectionMode="single"
        [(selection)]="selectedNode"
        (onNodeSelect)="onNodeSelect($event)"
        [filter]="true"
        filterMode="lenient"
        [filterPlaceholder]="''"
        scrollHeight="300px">
        <ng-template let-node pTemplate="default">
          <div class="tree-node-content">
            <span>{{ node.label }}</span>
            <span class="node-count" *ngIf="node.children?.length">
              ({{ node.children.length }})
            </span>
          </div>
        </ng-template>
      </p-tree>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-container">
        <p-skeleton width="100%" height="32px" styleClass="mb-2"></p-skeleton>
        <p-skeleton width="90%" height="32px" styleClass="mb-2"></p-skeleton>
        <p-skeleton width="95%" height="32px"></p-skeleton>
      </div>
    </ng-template>
  </div>

  <!-- Backdrop -->
  <div
    class="selector-backdrop"
    *ngIf="showSelector"
    (click)="toggleSelector()">
  </div>
</div>
```

#### 2.4 Create `entity-selector.component.scss`
```scss
@import '../../../styles/design-tokens';

.entity-selector {
  position: relative;
}

.selector-button {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: white;
  border: 1px solid $gray-300;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;
  min-width: 200px;

  &:hover {
    border-color: $metric-views-color;
  }

  .material-symbols-outlined {
    color: $gray-600;
    font-size: 20px;

    &.chevron {
      margin-left: auto;
      font-size: 18px;
    }
  }
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.entity-label {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $gray-800;
}

.entity-type {
  font-size: $font-size-xs;
  color: $gray-500;
  text-transform: capitalize;
}

.selector-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  background: white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
}

.search-container {
  padding: $spacing-sm;
  border-bottom: 1px solid $gray-200;

  .p-input-icon-left {
    width: 100%;

    input {
      width: 100%;
    }
  }
}

.tree-container {
  padding: $spacing-sm;
  max-height: 350px;
  overflow-y: auto;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.node-count {
  font-size: $font-size-xs;
  color: $gray-500;
}

.loading-container {
  padding: $spacing-md;
}

.selector-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

// PrimeNG Tree overrides
:host ::ng-deep {
  .p-tree {
    border: none;
    padding: 0;

    .p-tree-container {
      .p-treenode {
        padding: 2px 0;
      }

      .p-treenode-content {
        padding: $spacing-xs $spacing-sm;
        border-radius: $radius-sm;

        &:hover {
          background: $gray-100;
        }

        &.p-highlight {
          background: rgba($metric-views-color, 0.1);
          color: $metric-views-color;
        }
      }
    }
  }

  .p-tree-filter-container {
    display: none; // Using custom search
  }
}
```

### 3. Update Components Index

Update `/src/app/analytic-dashboard/components/index.ts`:
```typescript
// ... existing imports
import { DateRangePickerComponent } from './shared/date-range-picker/date-range-picker.component';
import { EntitySelectorComponent } from './shared/entity-selector/entity-selector.component';

export const components = [
  // ... existing components
  DateRangePickerComponent,
  EntitySelectorComponent
];

// ... existing exports
export * from './shared/date-range-picker/date-range-picker.component';
export * from './shared/entity-selector/entity-selector.component';
```

---

## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/analytic-dashboard/components/shared/date-range-picker/date-range-picker.component.ts` | Week tabs + custom date picker | ~148 | ☐ |
| 2 | `/src/app/analytic-dashboard/components/shared/date-range-picker/date-range-picker.component.html` | Date picker template | ~64 | ☐ |
| 3 | `/src/app/analytic-dashboard/components/shared/date-range-picker/date-range-picker.component.scss` | Date picker styles | ~98 | ☐ |
| 4 | `/src/app/analytic-dashboard/components/shared/entity-selector/entity-selector.component.ts` | Entity tree selector | ~198 | ☐ |
| 5 | `/src/app/analytic-dashboard/components/shared/entity-selector/entity-selector.component.html` | Entity selector template | ~70 | ☐ |
| 6 | `/src/app/analytic-dashboard/components/shared/entity-selector/entity-selector.component.scss` | Entity selector styles | ~139 | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/analytic-dashboard/components/index.ts` | Add DateRangePickerComponent, EntitySelectorComponent | ☐ |

---

## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
1. Navigate to Analytics Dashboard
2. DateRangePickerComponent:
   - Week tabs display (Week 1, Week 2, etc.)
   - "Custom" tab button visible
   - Clicking Custom shows date range inputs
   - Selecting week updates AnalyticsFilterService
3. EntitySelectorComponent:
   - Displays current node from CurrentNodeService
   - Clicking opens dropdown with tree
   - Tree shows Brand → Sub-brand → Store hierarchy
   - Selection updates AnalyticsFilterService

---

## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] Component selectors use `dh-` prefix
- [ ] OnDestroy with takeUntil pattern in both components
- [ ] EntitySelectorComponent properly cleans up tree subscriptions

### Consistency with Prompt 00
- [ ] Colors use token variables in SCSS ✓
- [ ] Component prefix: `dh-` ✓
- [ ] Services injected via constructor ✓
- [ ] Animations imported and registered (slideDown, fadeIn) ✓

### Angular Patterns
- [ ] DateRangePickerComponent uses UntypedFormControl for date inputs
- [ ] EntitySelectorComponent leverages CurrentNodeService (not custom impl)
- [ ] Both components emit @Output events
- [ ] Both components update AnalyticsFilterService
- [ ] PrimeNG Calendar and Tree components properly imported

### Integration Points
- [ ] Uses existing CurrentNodeService
- [ ] Uses existing BrandRepository.getAllStoresUnderBrand()
- [ ] Integrates with AnalyticsFilterService
- [ ] Uses AnalyticsDataService.getWeeks()

### Would this compile on first try? [YES/NO]

---

## Notes for Next Prompt
- DateRangePickerComponent provides week tabs and custom date selection
- EntitySelectorComponent leverages CurrentNodeService for parity with app patterns
- Both components integrate with AnalyticsFilterService
- Uses existing BrandRepository.getAllStoresUnderBrand() for store hierarchy data
- Next: Prompt 07 will create the context bar and view switcher components
