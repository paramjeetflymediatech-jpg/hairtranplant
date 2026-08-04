#!/bin/bash

# Script to format all captured iOS screenshots to exact App Store Connect dimensions:
# - 6.5" Display: 1242 x 2688 px
# - 6.7" Display: 1284 x 2778 px

INPUT_DIR="./appstore_assets"
DIR_6_5="$INPUT_DIR/6.5_inch_1242x2688"
DIR_6_7="$INPUT_DIR/6.7_inch_1284x2778"

mkdir -p "$DIR_6_5"
mkdir -p "$DIR_6_7"

echo "========================================================"
echo " Formatting App Store Connect iOS Screenshots"
echo "========================================================"

FOUND=0
for img in "$INPUT_DIR"/*.png; do
    if [ -f "$img" ]; then
        FOUND=1
        BASENAME=$(basename "$img")
        
        echo "Processing $BASENAME..."
        
        # Format for 6.5" Display (1242 x 2688 px)
        sips -z 2688 1242 "$img" --out "$DIR_6_5/$BASENAME" > /dev/null
        
        # Format for 6.7" Display (1284 x 2778 px)
        sips -z 2778 1284 "$img" --out "$DIR_6_7/$BASENAME" > /dev/null

        echo "  - Generated 1242x2688 px -> $DIR_6_5/$BASENAME"
        echo "  - Generated 1284x2778 px -> $DIR_6_7/$BASENAME"
    fi
done

if [ "$FOUND" -eq 0 ]; then
    echo "No PNG files found directly in $INPUT_DIR."
else
    echo ""
    echo "Done! Formatted screenshots ready in:"
    echo "  1. $DIR_6_5 (1242 x 2688 px)"
    echo "  2. $DIR_6_7 (1284 x 2778 px)"
fi
