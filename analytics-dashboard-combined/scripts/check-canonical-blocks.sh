#!/usr/bin/env bash
# scripts/check-canonical-blocks.sh
#
# UX-846 — verify every active HTML page carries a canonical .context-row block
# that matches partials/canonical-context-row.html in STRUCTURE.
#
# What counts as "structure":
#   - Tag, class, id, and attribute presence inside the CANONICAL/END marker block
#   - Text content INSIDE .card-value / .card-sub / .card-breadcrumb is variable
#     (entity names + date labels differ per page) and is masked before diff.
#
# Exit codes:
#   0  all pages match
#   1  one or more pages drift (details printed)
#   2  setup error (missing partial, etc.)
#
# Wire into pre-commit / CI by running from the analytics-dashboard-combined dir.

set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
PARTIAL="$DIR/partials/canonical-context-row.html"
ACTIVE_PAGES=(
  distribution-traffic.html
  distribution-media.html
  distribution-visitation.html
  distribution-demographics.html
  engagement-report.html
  engagement-explore.html
  engagement-explore-base.html
  engagement-explore-base-categories.html
  engagement-explore-base-promotions.html
  engagement-compare.html
)

if [[ ! -f "$PARTIAL" ]]; then
  echo "ERROR: canonical partial not found at $PARTIAL" >&2
  exit 2
fi

# extract_block <file>
#   prints the canonical block (the content BETWEEN the marker comments),
#   stripped of leading whitespace and with variable text masked.
extract_block() {
  # Use the LAST CANONICAL/END pair in the file. The reference partial has prose
  # comments at the top that may mention the markers but the actual canonical
  # block always sits at the end.
  awk '
    /░░░ CANONICAL \.context-row/ { capture=1; block=""; next }
    /░░░ END \.context-row/        { capture=0; last=block; next }
    capture { block = block $0 "\n" }
    END { printf "%s", last }
  ' "$1" \
    | sed -E '
        s/^[[:space:]]+//;
        s/[[:space:]]+$//;
        /^$/d;
        s/(class="card-value"[^>]*>)[^<]*(<)/\1__VAR__\2/g;
        s/(class="card-sub"[^>]*>)[^<]*(<)/\1__VAR__\2/g;
        s/(class="card-breadcrumb"[^>]*>)[^<]*(<)/\1__VAR__\2/g;
        # Mask aria-label content (compare adds " for Context A")
        s/aria-label="[^"]*"/aria-label="__VAR__"/g;
        # Mask onclick handlers (compare adds ComparePage.openX("A"))
        s/ onclick="[^"]*"//g;
        # Drop optional annotation comments
        /Explore-only extension:/d;
        /Compare uses page-level/d;
        /Per-B-deviation/d;
        /^<!--[[:space:]]*UX-846/d;
      ' \
    | awk '
        # Drop the entire <div class="filter-group"> ... </div> sub-tree
        /^<div class="filter-group/ { skip=1 }
        skip {
          if ($0 ~ /^<\/div>$/) { closes++; if (closes==2) { skip=0; closes=0 } }
          next
        }
        { print }
      '
}

# Reference content from partial (same masking)
REF=$(extract_block "$PARTIAL")

FAILED=0
for page in "${ACTIVE_PAGES[@]}"; do
  path="$DIR/$page"
  if [[ ! -f "$path" ]]; then
    echo "FAIL: $page — file missing" >&2
    FAILED=1
    continue
  fi

  # Verify markers exist
  if ! grep -q "CANONICAL \.context-row" "$path"; then
    echo "FAIL: $page — no CANONICAL marker comment" >&2
    FAILED=1
    continue
  fi
  if ! grep -q "END \.context-row" "$path"; then
    echo "FAIL: $page — no END marker comment" >&2
    FAILED=1
    continue
  fi

  ACTUAL=$(extract_block "$path")
  if ! diff <(echo "$REF") <(echo "$ACTUAL") > /tmp/canon-diff.$$ 2>&1; then
    echo "FAIL: $page — drift detected:" >&2
    sed 's/^/    /' /tmp/canon-diff.$$ >&2
    rm -f /tmp/canon-diff.$$
    FAILED=1
  else
    rm -f /tmp/canon-diff.$$
    echo "ok:   $page"
  fi
done

if [[ $FAILED -eq 1 ]]; then
  echo
  echo "Canonical .context-row drift found. Reference: $PARTIAL" >&2
  exit 1
fi

echo
echo "All ${#ACTIVE_PAGES[@]} pages match canonical .context-row."
