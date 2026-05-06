#!/usr/bin/env bash
# UX-846 — stitch screenshots into per-page composites + master mosaic.
# Run: ./scripts/stitch-screenshots.sh
# Requires: imagemagick (brew install imagemagick)

set -e
cd "$(dirname "$0")/.."
SHOTS=screenshots
COMP=screenshots/composites
mkdir -p "$COMP"

PAGES=(
  "engagement-promotions"
  "engagement-categories"
  "engagement-circulars"
  "engagement-grid"
  "engagement-compare"
  "distribution-visitation"
  "distribution-media"
  "distribution-traffic"
)

for p in "${PAGES[@]}"; do
  files=$(ls "$SHOTS/${p}__"*.png 2>/dev/null | sort)
  if [ -z "$files" ]; then
    echo "skip $p (no shots)"
    continue
  fi
  count=$(echo "$files" | wc -l | tr -d ' ')
  echo "stitching $p ($count shots)..."
  # Resize to 1200px wide for composite, then vertical stack with 16px white gap
  magick $files -resize 1200x \
    -background white -splice 0x16 \
    -append \
    "$COMP/${p}__strip.png"
done

# Master mosaic: thumbnail every shot in a 4-col grid
echo "building master mosaic..."
magick montage "$SHOTS"/*.png \
  -tile 4x \
  -geometry 400x+12+12 \
  -background "#f3f4f6" \
  "$COMP/master-mosaic.png"

# Per-family vertical strip (concat per-page strips)
echo "building family strips..."
magick "$COMP/engagement-"*"__strip.png" -background white -append "$COMP/family-engagement.png" 2>/dev/null || true
magick "$COMP/distribution-"*"__strip.png" -background white -append "$COMP/family-distribution.png" 2>/dev/null || true

echo
echo "Done. Composites in $COMP:"
ls -lh "$COMP"
