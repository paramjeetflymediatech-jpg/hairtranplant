#!/bin/bash

# ASG Hair Test App - iPad Screenshot Capture Tool for App Store Connect
# Automates capturing iPad screenshots (13" / 12.9" iPad Pro) from iOS Simulator.

OUTPUT_DIR="./appstore_assets/ipad"
mkdir -p "$OUTPUT_DIR"

echo "========================================================"
echo "    ASG Hair Test App - iPad Screenshot Capture Tool"
echo "========================================================"
echo ""

# Check Xcode CLI tools availability
if ! command -v xcrun &> /dev/null; then
    echo "ERROR: 'xcrun' tool could not be found. Please ensure Xcode and Xcode Command Line Tools are installed."
    exit 1
fi

# Detect booted simulator
BOOTED_SIMULATOR=$(xcrun simctl list devices | grep -E "Booted" | grep -i "iPad" | head -n 1)

if [ -z "$BOOTED_SIMULATOR" ]; then
    echo "No booted iPad Simulator detected."
    echo "Searching for available iPad Simulators..."
    
    IPAD_ID=$(xcrun simctl list devices | grep -i "iPad Pro 13-inch\|iPad Pro (12.9-inch)" | grep -v "Unavailable" | head -n 1 | grep -oE "\([A-F0-9-]{36}\)" | tr -d "()")

    if [ -n "$IPAD_ID" ]; then
        echo "Booting iPad Simulator (Device ID: $IPAD_ID)..."
        xcrun simctl boot "$IPAD_ID" 2>/dev/null
        open -a Simulator
        sleep 3
    else
        echo "WARNING: Could not find an automatic 13\" iPad Pro simulator."
        echo "Please open Xcode Simulator and select an iPad Pro (13-inch or 12.9-inch)."
        read -p "Press [ENTER] after starting your iPad simulator..."
    fi

    BOOTED_SIMULATOR=$(xcrun simctl list devices | grep -E "Booted" | head -n 1)
fi

echo "Connected Simulator:"
echo "  $BOOTED_SIMULATOR"
echo ""
echo "Screenshots will be saved in: $OUTPUT_DIR"
echo "Note: App Store Connect requires 13\" / 12.9\" iPad Pro screenshots (2048 x 2732 px portrait)."
echo ""

SCREENS=(
    "1_welcome_screen"
    "2_hair_test_screen"
    "3_history_screen"
    "4_patient_portal_screen"
    "5_clinic_home_screen"
    "6_profile_screen"
)

for SCREEN_NAME in "${SCREENS[@]}"; do
    read -p "Navigate to [$SCREEN_NAME] on iPad simulator. Press [ENTER] to capture (or 's' to skip): " choice
    if [ "$choice" == "s" ] || [ "$choice" == "S" ]; then
        echo "Skipped $SCREEN_NAME."
        echo ""
        continue
    fi

    FINAL_FILE="$OUTPUT_DIR/$SCREEN_NAME.png"

    echo "Capturing iPad Simulator screen..."
    xcrun simctl io booted screenshot "$FINAL_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Saved: $FINAL_FILE"
    else
        echo "ERROR: Failed to capture screenshot for $SCREEN_NAME."
    fi
    echo "----------------------------------------"
done

echo ""
echo "Done! iPad screenshots saved in '$OUTPUT_DIR'."
echo ""
echo "App Store iPad Screenshot Specs Reminder:"
echo " - 13\" / 12.9\" iPad Pro Display: 2048 x 2732 pixels (Portrait) or 2732 x 2048 pixels (Landscape)"
echo " - 11\" iPad Pro / iPad Air Display: 1668 x 2388 pixels"
