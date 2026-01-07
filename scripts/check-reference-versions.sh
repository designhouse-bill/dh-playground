#!/bin/bash
# check-reference-versions.sh - Validate PROTOTYPE.md reference versions
# Exit codes: 0=pass, 2=warning (never blocks, informational only)
# Usage: ./check-reference-versions.sh [--changed-only]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

WARNINGS=0
CHANGED_ONLY=false

# Parse arguments
if [ "$1" = "--changed-only" ]; then
  CHANGED_ONLY=true
fi

# Check if Node.js is available
check_node() {
  if ! command -v node &> /dev/null; then
    echo "WARNING: Node.js not found, skipping date staleness check"
    return 1
  fi
  return 0
}

# Get list of changed prototype directories (for --changed-only mode)
get_changed_prototypes() {
  git diff --cached --name-only 2>/dev/null | grep -oE "^[^/]+-prototype" | sort -u
}

HAS_NODE=$(check_node && echo "true" || echo "false")

for prototype_dir in "$REPO_ROOT"/*-prototype/; do
  [ -d "$prototype_dir" ] || continue

  PROTOTYPE_NAME=$(basename "$prototype_dir")

  # Skip if --changed-only and this prototype wasn't changed
  if [ "$CHANGED_ONLY" = "true" ]; then
    if ! get_changed_prototypes | grep -q "^${PROTOTYPE_NAME}$"; then
      continue
    fi
  fi

  PROTOTYPE_MD="$prototype_dir/PROTOTYPE.md"

  if [ ! -f "$PROTOTYPE_MD" ]; then
    echo "WARNING: $PROTOTYPE_NAME missing PROTOTYPE.md"
    WARNINGS=$((WARNINGS + 1))
    continue
  fi

  # Check for Reference Version section
  if ! grep -q "## Reference Version" "$PROTOTYPE_MD"; then
    echo "WARNING: $PROTOTYPE_NAME/PROTOTYPE.md missing '## Reference Version' section"
    WARNINGS=$((WARNINGS + 1))
    continue
  fi

  # Skip date check if Node.js not available
  if [ "$HAS_NODE" != "true" ]; then
    continue
  fi

  # Check last-verified date using Node.js (cross-platform)
  LAST_VERIFIED=$(grep -oE "Last verified: [0-9]{4}-[0-9]{2}-[0-9]{2}" "$PROTOTYPE_MD" | head -1 | cut -d' ' -f3)

  if [ -z "$LAST_VERIFIED" ]; then
    echo "WARNING: $PROTOTYPE_NAME missing 'Last verified: YYYY-MM-DD'"
    WARNINGS=$((WARNINGS + 1))
  else
    # Use Node.js for cross-platform date calculation
    DAYS_OLD=$(node -e "
      const lastVerified = new Date('$LAST_VERIFIED');
      const now = new Date();
      const days = Math.floor((now - lastVerified) / (1000 * 60 * 60 * 24));
      console.log(days);
    " 2>/dev/null || echo "0")

    if [ "$DAYS_OLD" -gt 30 ]; then
      echo "WARNING: $PROTOTYPE_NAME reference version is $DAYS_OLD days old (>30 days)"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
done

if [ $WARNINGS -gt 0 ]; then
  echo "Reference version check: $WARNINGS warning(s)"
  exit 2
fi

echo "Reference version check: PASSED"
exit 0
