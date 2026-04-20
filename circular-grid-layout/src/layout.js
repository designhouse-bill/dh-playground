// Pure algorithm module. No DOM. No dependencies.
// Ports to TS/Angular service as-is for DS Phase 2.

/**
 * @typedef {1|2|3} Span
 * @typedef {ReadonlyArray<Span>} Row
 * @typedef {{
 *   rows: Row[],
 *   E: number,
 *   requiredE: number,
 *   feasible: boolean,
 *   minCardsPerRow: number,
 *   maxBumpsPerRow: number,
 * }} CategoryLayout
 */

/**
 * Max span is clamped to 2 across all column counts.
 * Span=3 produced visually dominant cards at N=5/6 — reverted.
 */
export function maxSpanForColumns(N) {
  return 2;
}

/**
 * Required extras for clean close: E = (N - P mod N) mod N.
 */
export function requiredExtras(P, N) {
  return (N - (P % N)) % N;
}

/**
 * Absorbed extras after emphasis bump.
 * emphasis=0: E = requiredE.
 * emphasis>=1: add a full absorption row (N extras) to force a heavier
 *   signature opening. When requiredE==0 this produces E=N (matches plan §7
 *   test 5: P=30 N=5 emph=2 → E=5). When requiredE>0 this produces
 *   E=requiredE+N, adding an extra row of bumps so emphasis is visible even
 *   for categories that didn't fit cleanly.
 * emphasis=2: reserved for future signature-clustering; same as 1 in v1.
 */
export function resolveE(requiredE, emphasis, N) {
  if (emphasis <= 0) return requiredE;
  return requiredE === 0 ? N : requiredE + N;
}

/**
 * Distribute N columns into `cells` groups, each group ≤ maxSpan.
 * Uses even-split with remainder bumped to front cells for signature
 * distributions: N=6 cells=2 → [3,3]; N=5 cells=2 → [3,2]; N=4 cells=3 → [2,1,1].
 */
function splitRow(N, cells, maxSpan) {
  const base = Math.floor(N / cells);
  const rem = N % cells;
  if (base + (rem > 0 ? 1 : 0) > maxSpan) {
    return null; // infeasible: would violate maxSpan
  }
  const row = [];
  for (let i = 0; i < cells; i++) {
    row.push(i < rem ? base + 1 : base);
  }
  return row;
}

/**
 * Compute row structure for one category.
 * See plan §7 for ground-truth test cases.
 */
export function computeCategoryLayout({ P, N, maxSpan, emphasis = 0, packTight = true }) {
  const minCardsPerRow = Math.ceil(N / maxSpan);
  const maxBumpsPerRow = N - minCardsPerRow;

  if (!Number.isFinite(P) || P < 1) {
    return { rows: [], E: 0, requiredE: 0, feasible: false, minCardsPerRow, maxBumpsPerRow };
  }

  // Infeasible: single-promo category can't satisfy min-cells-per-row at N>2.
  if (P < minCardsPerRow) {
    return { rows: [], E: 0, requiredE: 0, feasible: false, minCardsPerRow, maxBumpsPerRow };
  }

  const requiredE = requiredExtras(P, N);

  // Loose mode: no absorption. Last row has P%N cells; sum<N.
  if (!packTight) {
    const fullRows = Math.floor(P / N);
    const rem = P % N;
    const rows = [];
    for (let i = 0; i < fullRows; i++) rows.push(new Array(N).fill(1));
    if (rem > 0) rows.push(new Array(rem).fill(1));
    return { rows, E: 0, requiredE, feasible: true, minCardsPerRow, maxBumpsPerRow };
  }

  let E = resolveE(requiredE, emphasis, N);

  // Total rows satisfies (P + E) / N, must be integer. E is chosen so this holds.
  let totalRows = (P + E) / N;

  // If E > 0 but can't fit bumps within totalRows × maxBumpsPerRow, clamp.
  const bumpsCapacity = totalRows * maxBumpsPerRow;
  if (E > bumpsCapacity) {
    E = requiredE; // fall back — emphasis infeasible at this N/maxSpan
    totalRows = (P + E) / N;
  }

  // Distribute E bumps greedily: first row gets up to maxBumpsPerRow, spill to row 2, etc.
  const rows = [];
  let remainingBumps = E;
  for (let r = 0; r < totalRows; r++) {
    const bumps = Math.min(remainingBumps, maxBumpsPerRow);
    remainingBumps -= bumps;
    const cells = N - bumps;
    const row = splitRow(N, cells, maxSpan);
    if (!row) {
      // Should not happen if math above is right. Defensive.
      return { rows: [], E: 0, requiredE, feasible: false, minCardsPerRow, maxBumpsPerRow };
    }
    rows.push(row);
  }

  return { rows, E, requiredE, feasible: true, minCardsPerRow, maxBumpsPerRow };
}

/**
 * Compute max viable N given usable page width + minimum legible column width.
 * (pageWidth − (N−1)·gap) / N ≥ minColWidth  →  N ≤ (pageWidth + gap) / (minColWidth + gap)
 */
export function maxColumnsForWidth(pageWidth, gap, minColWidth) {
  return Math.floor((pageWidth + gap) / (minColWidth + gap));
}

/**
 * Paginate categories into pages. Each page holds R slot-units.
 * Row = 1 slot. Title ≈ 0.25 slot (configurable).
 * Widow prevention: title + at least one following row must fit on the same page.
 */
export function paginateDocument({
  categories,
  N,
  R,
  maxSpan = maxSpanForColumns(N),
  packTight = true,
  titleSlotWeight = 0.25,
}) {
  const pages = [];
  let pageNumber = 1;
  let currentItems = [];
  let usedSlots = 0;
  const warnings = [];

  const openNewPage = () => {
    if (currentItems.length > 0) {
      pages.push({ pageNumber, items: currentItems });
      pageNumber += 1;
    }
    currentItems = [];
    usedSlots = 0;
  };

  for (let cIdx = 0; cIdx < categories.length; cIdx++) {
    const cat = categories[cIdx];
    const layout = computeCategoryLayout({
      P: cat.P,
      N,
      maxSpan,
      emphasis: cat.emphasis ?? 0,
      packTight,
    });

    if (!layout.feasible) {
      warnings.push({ category: cat.name, reason: 'infeasible', P: cat.P, N, maxSpan });
      continue;
    }

    // Widow: title + first row must fit together.
    const widowCost = titleSlotWeight + 1;
    if (usedSlots + widowCost > R) {
      openNewPage();
    }

    currentItems.push({ type: 'title', name: cat.name, categoryIndex: cIdx });
    usedSlots += titleSlotWeight;

    let cardCursor = 0;
    for (let rIdx = 0; rIdx < layout.rows.length; rIdx++) {
      const spans = layout.rows[rIdx];
      if (usedSlots + 1 > R) {
        openNewPage();
      }
      const cellCount = spans.length;
      currentItems.push({
        type: 'row',
        spans,
        categoryIndex: cIdx,
        startCard: cardCursor,
        endCard: cardCursor + cellCount - 1,
      });
      usedSlots += 1;
      cardCursor += cellCount;
    }
  }

  if (currentItems.length > 0) {
    pages.push({ pageNumber, items: currentItems });
  }

  return { pages, warnings };
}

/**
 * Density metrics for one document layout. Used by benchmark harness.
 */
export function measureDocument({ pages, categories, N, R }) {
  let totalCards = 0;
  let totalRows = 0;
  let totalTitles = 0;
  let spanBumps = 0;
  for (const page of pages) {
    for (const item of page.items) {
      if (item.type === 'row') {
        totalRows += 1;
        for (const s of item.spans) {
          totalCards += 1;
          spanBumps += s - 1;
        }
      } else {
        totalTitles += 1;
      }
    }
  }
  const pageCount = pages.length;
  const capacity = pageCount * N * R;
  const filled = totalCards;
  return {
    pageCount,
    totalCards,
    totalRows,
    totalTitles,
    spanBumps,
    capacity,
    density: capacity > 0 ? filled / capacity : 0,
    N,
    R,
  };
}
