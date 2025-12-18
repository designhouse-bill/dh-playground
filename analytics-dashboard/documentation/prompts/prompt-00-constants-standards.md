# Prompt 00: Constants & Standards Reference

## Purpose
This document establishes the **source of truth** for all constants, formulas, and quality standards used throughout the Analytics Dashboard implementation. **Reference this document before starting any prompt.**

---

## CONSTANTS (Source of Truth)

Use these **EXACT** values throughout - do not deviate.

### Composite Score Formula

```
compositeScore = (civ × 1) + (cc × 10) + (atl × 50)
```

**In TypeScript:**
```typescript
const compositeScore = civ + (cc * 10) + (atl * 50);
```

**In comments:**
```typescript
// Formula: CIV×1 + CC×10 + ATL×50
```

---

### Metric Colors

| Metric | SCSS Variable | Hex Value | Usage |
|--------|---------------|-----------|-------|
| Views (CIV) | `$metric-views-color` | `#4272D8` | Blue - Card impressions |
| Clicks (CC) | `$metric-clicks-color` | `#B8D64D` | Green - Card expansions |
| Adds (ATL) | `$metric-adds-color` | `#937DF8` | Purple - List additions |
| Total/Score | `$metric-total-color` | `#06989D` | Teal - Composite score |

**In TypeScript constants:**
```typescript
readonly COLORS = {
  views: '#4272D8',
  clicks: '#B8D64D',
  adds: '#937DF8',
  total: '#06989D'
};
```

**In SCSS - ALWAYS use variables, never raw hex:**
```scss
// ✓ CORRECT
color: $metric-views-color;
background: rgba($metric-clicks-color, 0.1);

// ✗ WRONG
color: #4272D8;
background: rgba(#B8D64D, 0.1);
```

---

### Metric Abbreviations

**Always use these abbreviations in code:**
| Full Term | Variable Name | NEVER Use |
|-----------|---------------|-----------|
| Card Impression Views | `civ` | `views`, `impressions`, `cardViews` |
| Card Clicks | `cc` | `clicks`, `cardClicks` |
| Add To List | `atl` | `adds`, `addToList`, `listAdds` |
| Composite Score | `compositeScore` | `score`, `total`, `engagement` |

**In UI labels (display only):**
- "Views (CIV)"
- "Clicks (CC)"
- "Adds (ATL)"
- "Score" or "Composite Score"

---

### Component Naming

**Selector prefix:** All components use `dh-` prefix

```typescript
// ✓ CORRECT
@Component({
  selector: 'dh-performance-chart',
  // ...
})

// ✗ WRONG
@Component({
  selector: 'app-performance-chart',
  selector: 'performance-chart',
  // ...
})
```

**Component class naming:**
```typescript
// Pattern: [Feature][Purpose]Component
PerformanceChartComponent
CategorySidebarComponent
DetailPanelComponent
```

---

### Import Paths

**Service imports:**
```typescript
// From components 3 levels deep (e.g., components/base-view/category-sidebar/)
import { AnalyticsDataService } from '../../../services';

// From components 2 levels deep (e.g., components/dashboard-view-switcher/)
import { AnalyticsStateService } from '../../services';
```

**DTO imports:**
```typescript
import { PromotionDto, CategoryDto, FilterContextDto } from '../../../dto';
// or
import { PromotionDto, CategoryDto, FilterContextDto } from '../../dto';
```

**Animation imports:**
```typescript
import { slideDown, fadeIn } from '../../../animations';
// or
import { slideDown, fadeIn } from '../../animations';
```

**External imports (always at top):**
```typescript
// Angular core
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

// RxJS
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';

// PrimeNG
import { Table } from 'primeng/table';
import { TreeNode } from 'primeng/api';

// App imports
import { CurrentNodeService } from '@app/core/services/current-node.service';
import { NodeDto } from '@app/shared/dto/node.dto';
```

---

## CRITICAL REQUIREMENTS

### Code Completeness Rules

1. **Every code block MUST be complete and buildable**
   - No truncation comments: `// ...rest`, `// existing code`, `// etc.`
   - No placeholder comments: `// TODO: implement later`
   - No ellipsis: `...`

2. **If code exceeds 150 lines, split into labeled sections:**
   ```markdown
   #### File: component.ts (Part 1 of 2 - Imports & Class Definition)
   ```typescript
   // First 150 lines
   ```

   #### File: component.ts (Part 2 of 2 - Methods)
   ```typescript
   // Remaining lines
   ```
   ```

3. **Every file MUST include ALL imports at the top**
   - List every import explicitly
   - Use exact paths from Constants section
   - Group imports: Angular → RxJS → PrimeNG → App

4. **After each code block, include verification:**
   ```markdown
   ✓ This file is COMPLETE: YES
   ✓ All imports included: YES
   ✓ Compiles standalone: YES
   ```

---

### Angular Patterns to Follow

**Subscription cleanup (REQUIRED for all components):**
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.someService.data$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        // handle data
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
```

**Service pattern (singleton):**
```typescript
@Injectable({
  providedIn: 'root'
})
export class AnalyticsDataService {
  // ...
}
```

**Component with animations:**
```typescript
import { slideDown, fadeIn } from '../../animations';

@Component({
  selector: 'dh-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
  animations: [slideDown, fadeIn]  // ← Register animations
})
```

---

## REQUIRED ARTIFACTS FOR EACH PROMPT

Every prompt must include these sections:

### 1. Files Checklist

```markdown
## FILES CHECKLIST

### Files to CREATE:
| # | Path | Purpose | Est. Lines | Complete |
|---|------|---------|------------|----------|
| 1 | `/src/app/.../file.ts` | Description | ~XX | ☐ |

### Files to MODIFY:
| # | Path | Changes | Complete |
|---|------|---------|----------|
| 1 | `/src/app/.../file.ts` | Description | ☐ |

### Required Imports per File:
**file-name.component.ts:**
```typescript
import { Component, OnInit } from '@angular/core';
// ... ALL imports listed
```
```

### 2. Smoke Test

```markdown
## SMOKE TEST

### Quick Compile Check
```bash
cd /Users/billklingensmith/Code/ideal-sale-circular
yarn build 2>&1 | grep -E "(error|ERROR)" | head -20
```

### Visual Verification
Navigate to: `http://localhost:4200/analytics`
Expected: [Describe what should render]
```

### 3. Senior Dev Review Checklist

```markdown
## SENIOR DEV REVIEW CHECKLIST

Before finalizing, verify:

### Code Quality
- [ ] All code blocks complete (no `// ...`)
- [ ] All imports explicitly listed
- [ ] No hardcoded values (use Constants)
- [ ] Component selectors use `dh-` prefix
- [ ] Services use `providedIn: 'root'`

### Consistency
- [ ] Formula: `civ + (cc * 10) + (atl * 50)`
- [ ] Colors match Constants table
- [ ] Variables: `civ`, `cc`, `atl`, `compositeScore`
- [ ] SCSS uses token variables

### Angular Patterns
- [ ] OnDestroy with takeUntil pattern
- [ ] @Input/@Output properly typed
- [ ] Services via constructor injection
- [ ] Animations imported and registered

### Would this compile on first try? [YES/NO]
```

### 4. Unit Test Template (for components)

```markdown
## MINIMAL UNIT TEST

Create `[name].component.spec.ts`:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';
// Import all dependencies

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      imports: [/* PrimeNG modules */],
      providers: [/* Mock services */]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```
```

---

## CHECKPOINT TEMPLATE

Add after every 2-3 prompts:

```markdown
---
## CHECKPOINT: Review Before Continuing

Before proceeding to prompt XX, verify:

1. **Compile Check:** `yarn build` passes without errors
2. **Import Check:** No "Cannot find module" errors
3. **Constants Check:** Formula and colors match Prompt 00
4. **Pattern Check:** All components have OnDestroy cleanup

### Issues Found:
(List any issues here before continuing)

### Ready to Continue: [YES/NO]
---
```

---

## PROMPT EXECUTION ORDER

```
[00] ← YOU ARE HERE (Reference Document)
 ↓
[01] Dependencies + Mock Data
[02] DTOs + Enums
 ↓
═══ CHECKPOINT A ═══
 ↓
[03A] Data Services
[03B] State + Filter Services
 ↓
═══ CHECKPOINT B ═══
 ↓
[04] Animations + Charts
[05] Metric + Filter Components
 ↓
═══ CHECKPOINT C ═══
 ↓
[06] Date/Entity Selectors
[07] Context Bar + View Switcher
 ↓
═══ CHECKPOINT D ═══
 ↓
[08A] Category Sidebar
[08B] Promotions Panel
 ↓
═══ CHECKPOINT E ═══
 ↓
[09A] Detail Panel
[09B] Container Integration
 ↓
═══ CHECKPOINT F ═══
 ↓
[10A] Categories Panel
[10B] Circulars Panel
 ↓
═══ CHECKPOINT G ═══
 ↓
[11] Grid Inquiry View
 ↓
═══ CHECKPOINT H ═══
 ↓
[12A] Compare View
[12B] Final Polish
 ↓
═══ FINAL CHECKPOINT ═══
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ ANALYTICS DASHBOARD - QUICK REFERENCE                       │
├─────────────────────────────────────────────────────────────┤
│ FORMULA: compositeScore = civ + (cc × 10) + (atl × 50)     │
├─────────────────────────────────────────────────────────────┤
│ COLORS:                                                     │
│   Views (CIV)  → #4272D8 (Blue)   → $metric-views-color    │
│   Clicks (CC)  → #B8D64D (Green)  → $metric-clicks-color   │
│   Adds (ATL)   → #937DF8 (Purple) → $metric-adds-color     │
│   Score        → #06989D (Teal)   → $metric-total-color    │
├─────────────────────────────────────────────────────────────┤
│ VARIABLES: civ, cc, atl, compositeScore (no alternatives!) │
├─────────────────────────────────────────────────────────────┤
│ PREFIX: dh- (e.g., dh-performance-chart)                   │
├─────────────────────────────────────────────────────────────┤
│ CLEANUP: takeUntil(this.unsubscribe$) + OnDestroy          │
└─────────────────────────────────────────────────────────────┘
```
