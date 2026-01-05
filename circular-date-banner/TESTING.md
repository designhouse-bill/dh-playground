# Testing Checklist

Comprehensive testing checklist for the Circular Date Banner prototype.

## Test Environment

- **Date Tested:** _______________
- **Tested By:** _______________
- **Browsers Tested:**
  - [ ] Chrome (version: ___)
  - [ ] Firefox (version: ___)
  - [ ] Safari (version: ___)
  - [ ] Edge (version: ___)

---

## 1. Basic Functionality

### Banner Display
- [ ] Banner renders correctly on page load
- [ ] Header text displays correctly ("WEEKLY AD")
- [ ] Date range displays correctly
- [ ] Day names display when enabled
- [ ] Banner hides when `enabled` is unchecked

### Date Calculations
- [ ] Circular dates calculate correctly from current date
- [ ] Dates update when reference date is changed
- [ ] Day range (e.g., "Wednesday - Tuesday") is accurate
- [ ] Year displays correctly when `showYear` is enabled
- [ ] Dates format correctly in all three formats:
  - [ ] Explicit: "January 15 - January 21"
  - [ ] Abbreviated: "Jan 15 - Jan 21"
  - [ ] Numeric: "1/15 - 1/21"

### Localization
- [ ] English locale shows English text
- [ ] Spanish locale shows "OFERTAS SEMANALES"
- [ ] Spanish date/day names are correct
- [ ] Locale switch updates all text immediately

---

## 2. Configuration Panel

### Panel Behavior
- [ ] Panel opens/closes smoothly
- [ ] Section collapse/expand works
- [ ] All form controls are functional
- [ ] Reset button restores defaults
- [ ] Settings persist after page refresh (localStorage)

### Preset Buttons
- [ ] "Minimal" preset applies correctly
- [ ] "Standard" preset applies correctly
- [ ] "Bold" preset applies correctly
- [ ] "Spanish" preset applies correctly
- [ ] Form controls update when preset is applied

### Export Functionality
- [ ] "Copy Config JSON" copies to clipboard
- [ ] Success feedback message appears
- [ ] JSON is valid and complete

---

## 3. Styling Options

### Colors
- [ ] Background color picker works
- [ ] Text color picker works
- [ ] Color changes apply immediately
- [ ] Hex values display correctly

### Typography
- [ ] Font family selection works
- [ ] Font weight changes apply
- [ ] Text transform options work

### Layout
- [ ] Alignment (left/center/right) works
- [ ] Vertical padding options work
- [ ] Horizontal padding options work

### Borders
- [ ] "None" shows no border
- [ ] "Solid" shows border on all sides
- [ ] "Bottom Only" shows bottom border only
- [ ] Border color changes apply
- [ ] Border width changes apply

### Background Patterns
- [ ] "None" shows solid color
- [ ] Diagonal lines pattern works
- [ ] Dots pattern works
- [ ] Crosshatch pattern works
- [ ] Waves pattern works
- [ ] Chevron pattern works
- [ ] Grid pattern works
- [ ] Noise/texture pattern works
- [ ] Pattern opacity slider works

---

## 4. Validity Pill

### Display
- [ ] Pill shows when enabled
- [ ] Pill hides when disabled
- [ ] Position (left/right) changes work
- [ ] Countdown text is accurate

### States
- [ ] Normal state (green) displays correctly
- [ ] Expiring state (2 days or less - yellow/orange) works
- [ ] Expired state (red) works after circular ends

### Interaction
- [ ] Click/tap expands the pill
- [ ] Click/tap collapses when expanded
- [ ] Desktop: hover expands (non-pinned)
- [ ] Expanded view shows full date range
- [ ] Pin toggle works

---

## 5. Scroll Behavior

### Sticky States
- [ ] Banner starts in normal document flow
- [ ] Banner becomes sticky after scrolling past threshold
- [ ] Banner hides when continuing to scroll down
- [ ] Banner shows when scrolling up
- [ ] Banner returns to normal flow when scrolled to top

### Configuration
- [ ] Enable/disable sticky works
- [ ] Threshold value changes work
- [ ] Scroll indicator shows correct scroll position
- [ ] Scroll indicator shows correct state (normal/sticky/hidden)

### Edge Cases
- [ ] Fast scrolling handles correctly
- [ ] Mobile touch/momentum scrolling works
- [ ] No jitter or flashing during transitions
- [ ] Works with short page content (below threshold)

---

## 6. Responsive Behavior

### Device Preview Buttons
- [ ] "Auto" adapts to window size
- [ ] "Mobile" constrains to ~280px
- [ ] "Tablet" constrains to ~350px
- [ ] "Desktop" constrains to ~400px
- [ ] Width indicator updates correctly

### Breakpoints

#### Mobile (< 640px)
- [ ] Font sizes reduce appropriately
- [ ] Padding reduces
- [ ] Day names stack below date (when enabled)
- [ ] Pill has larger touch target (48px min height)
- [ ] Banner doesn't overflow

#### Tablet (640px - 1024px)
- [ ] Medium font sizes apply
- [ ] Standard padding applies
- [ ] All elements fit correctly

#### Desktop (> 1024px)
- [ ] Full font sizes apply
- [ ] Full padding applies
- [ ] Hover interactions work on pill

### Resize Handling
- [ ] Resizing window updates breakpoint
- [ ] Sticky behavior recalculates correctly
- [ ] No layout breakage during resize

---

## 7. Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors
- [ ] Color picker works (WebKit)

### Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

---

## 8. Accessibility

### Keyboard Navigation
- [ ] All form controls are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus states are visible

### Screen Reader
- [ ] Banner content is readable
- [ ] Config panel is navigable
- [ ] ARIA attributes are correct

### Reduced Motion
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Content remains functional

---

## 9. Performance

### Load Time
- [ ] Page loads quickly (< 1 second)
- [ ] No render-blocking issues

### Runtime
- [ ] Scroll events don't cause lag
- [ ] Config changes apply immediately
- [ ] No memory leaks (check DevTools)

### Console
- [ ] No JavaScript errors
- [ ] No CSS warnings
- [ ] Expected debug logs only

---

## 10. Data Persistence

### localStorage
- [ ] Config saves on change
- [ ] Config loads on refresh
- [ ] Reset clears storage
- [ ] Invalid storage data handled gracefully

---

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| | | |
| | | |
| | | |

---

## Notes

_Additional observations or recommendations:_

```




```

---

## Sign-Off

- [ ] All critical tests pass
- [ ] No blocking issues
- [ ] Ready for Angular migration

**Approved By:** _______________
**Date:** _______________
