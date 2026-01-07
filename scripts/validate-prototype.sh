#!/bin/bash
# validate-prototype.sh - Token validation for prototypes
# Exit codes: 0=pass, 1=error (blocks commit/merge)
# Cross-platform: Works on macOS, Linux, CI

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors (disabled in CI for cleaner logs)
if [ -t 1 ] && [ -z "$CI" ]; then
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  GREEN='\033[0;32m'
  NC='\033[0m'
else
  RED='' YELLOW='' GREEN='' NC=''
fi

ERRORS=0
WARNINGS=0

# Check if unstyled is allowed for a prototype
is_unstyled_allowed() {
  local prototype_md="$1/PROTOTYPE.md"
  [ -f "$prototype_md" ] && grep -q "unstyled: true" "$prototype_md"
}

# Find all prototype directories
for prototype_dir in "$REPO_ROOT"/*-prototype/; do
  [ -d "$prototype_dir" ] || continue

  PROTOTYPE_NAME=$(basename "$prototype_dir")
  echo "Validating: $PROTOTYPE_NAME"

  UNSTYLED_ALLOWED=$(is_unstyled_allowed "$prototype_dir" && echo "true" || echo "false")

  # Check circular/ subfolder (must use --dh-*, not --p-*)
  if [ -d "$prototype_dir/circular" ]; then
    echo "  Checking circular/ (requires --dh-* tokens)..."

    # BLOCKLIST: wrong tokens (ERROR - blocks)
    if grep -rE "var\(--p-" "$prototype_dir/circular" --include="*.css" --include="*.html" --include="*.js" 2>/dev/null; then
      echo -e "  ${RED}ERROR: circular/ contains --p-* tokens (should be --dh-*)${NC}"
      ERRORS=$((ERRORS + 1))
    fi

    # ALLOWLIST: correct tokens must exist (ERROR unless unstyled allowed)
    if ! grep -rqE "var\(--dh-" "$prototype_dir/circular" --include="*.css" 2>/dev/null; then
      if [ "$UNSTYLED_ALLOWED" = "true" ]; then
        echo -e "  ${YELLOW}INFO: circular/ has no --dh-* tokens (unstyled: true in PROTOTYPE.md)${NC}"
      else
        echo -e "  ${RED}ERROR: circular/ has no --dh-* tokens in CSS (add 'unstyled: true' to PROTOTYPE.md to allow)${NC}"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi

  # Check admin/ subfolder (must use --p-*, not --dh-*)
  if [ -d "$prototype_dir/admin" ]; then
    echo "  Checking admin/ (requires --p-* tokens)..."

    # BLOCKLIST: wrong tokens (ERROR - blocks)
    if grep -rE "var\(--dh-" "$prototype_dir/admin" --include="*.css" --include="*.html" --include="*.js" 2>/dev/null; then
      echo -e "  ${RED}ERROR: admin/ contains --dh-* tokens (should be --p-*)${NC}"
      ERRORS=$((ERRORS + 1))
    fi

    # ALLOWLIST: correct tokens must exist (ERROR unless unstyled allowed)
    if ! grep -rqE "var\(--p-" "$prototype_dir/admin" --include="*.css" 2>/dev/null; then
      if [ "$UNSTYLED_ALLOWED" = "true" ]; then
        echo -e "  ${YELLOW}INFO: admin/ has no --p-* tokens (unstyled: true in PROTOTYPE.md)${NC}"
      else
        echo -e "  ${RED}ERROR: admin/ has no --p-* tokens in CSS (add 'unstyled: true' to PROTOTYPE.md to allow)${NC}"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi

  # HARDCODED COLORS (warning only - doesn't block)
  if grep -rE "#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(" "$prototype_dir" --include="*.css" 2>/dev/null | grep -v "sourceMappingURL" | head -3; then
    echo -e "  ${YELLOW}WARNING: Hardcoded colors found - consider using tokens${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# Summary
echo ""
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}FAILED: $ERRORS error(s), $WARNINGS warning(s)${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}PASSED with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo -e "${GREEN}PASSED: All validations passed${NC}"
  exit 0
fi
