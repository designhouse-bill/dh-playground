# Analytics Dashboard Conversion Plan

## Overview
Convert the current analytics dashboard into a stand-alone HTML/CSS/JS application with Angular 20-inspired folder structure.

---

## Target Folder Structure

```
new-analytics-dashboard-test/
├── index.html
├── assets/
│   └── icons/
├── styles/
│   ├── design-tokens.css
│   ├── base.css
│   ├── components.css
│   └── main.css
├── components/
│   ├── header/
│   ├── context-cards/
│   ├── filters/
│   ├── modals/
│   ├── data-grid/
│   ├── detail-panel/
│   └── shared/
├── views/
│   ├── categories/
│   ├── promotions/
│   └── grid/
├── services/
│   ├── cache-manager.js
│   ├── data-service.js
│   └── state-manager.js
├── data/
│   ├── mock-data.js
│   └── promotion-records.js
├── utils/
│   ├── formatters.js
│   ├── dom-helpers.js
│   └── event-bus.js
├── app.js
└── prompts.html
```

---

## Phases

### Phase 1: Foundation
- Create folder structure
- Migrate design tokens and base styles
- Create index.html with script/style loading

### Phase 2: Services
- Migrate cache-manager.js
- Migrate data-service.js
- Create state-manager.js

### Phase 3: Data
- Migrate mock-data.js
- Migrate promotion-records-data.js

### Phase 4: Components
- Header, context cards, filters, modals
- Data grid, detail panel
- Views (categories, promotions, grid)

### Phase 5: Integration
- Wire app.js bootstrap
- Test all navigation
- Fix broken links

### Phase 6: Documentation
- Create prompts.html

---

## Testing Checklist
- View switching works
- Modals open/close
- Data loads correctly
- Search/filter/sort work
- No console errors
