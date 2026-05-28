// UX-846 Phase 1 — 13-week range per UX-846-DATA-LAYER-SCHEMA.md §3.
// Weeks 36..48, Tuesday → Monday, Sep 2 2025 → Dec 1 2025.

(function (root) {
  'use strict';

  const weeks = [
    { id: 'week-36', num: 36, startDate: '2025-09-02', endDate: '2025-09-08', label: 'Week 36 (Sep 2–8)',     daysRun: 7 },
    { id: 'week-37', num: 37, startDate: '2025-09-09', endDate: '2025-09-15', label: 'Week 37 (Sep 9–15)',    daysRun: 7 },
    { id: 'week-38', num: 38, startDate: '2025-09-16', endDate: '2025-09-22', label: 'Week 38 (Sep 16–22)',   daysRun: 7 },
    { id: 'week-39', num: 39, startDate: '2025-09-23', endDate: '2025-09-29', label: 'Week 39 (Sep 23–29)',   daysRun: 7 },
    { id: 'week-40', num: 40, startDate: '2025-09-30', endDate: '2025-10-06', label: 'Week 40 (Sep 30–Oct 6)', daysRun: 7 },
    { id: 'week-41', num: 41, startDate: '2025-10-07', endDate: '2025-10-13', label: 'Week 41 (Oct 7–13)',    daysRun: 7 },
    { id: 'week-42', num: 42, startDate: '2025-10-14', endDate: '2025-10-20', label: 'Week 42 (Oct 14–20)',   daysRun: 7 },
    { id: 'week-43', num: 43, startDate: '2025-10-21', endDate: '2025-10-27', label: 'Week 43 (Oct 21–27)',   daysRun: 7 },
    { id: 'week-44', num: 44, startDate: '2025-10-28', endDate: '2025-11-03', label: 'Week 44 (Oct 28–Nov 3)', daysRun: 7 },
    { id: 'week-45', num: 45, startDate: '2025-11-04', endDate: '2025-11-10', label: 'Week 45 (Nov 4–10)',    daysRun: 7 },
    { id: 'week-46', num: 46, startDate: '2025-11-11', endDate: '2025-11-17', label: 'Week 46 (Nov 11–17)',   daysRun: 7 },
    { id: 'week-47', num: 47, startDate: '2025-11-18', endDate: '2025-11-24', label: 'Week 47 (Nov 18–24)',   daysRun: 7 },
    { id: 'week-48', num: 48, startDate: '2025-11-25', endDate: '2025-12-01', label: 'Week 48 (Nov 25–Dec 1)', daysRun: 7 }
  ];

  if (root) root.MockDataWeeks = weeks;
  if (typeof module !== 'undefined' && module.exports) module.exports = weeks;
})(typeof window !== 'undefined' ? window : null);
