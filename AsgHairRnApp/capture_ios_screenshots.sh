#!/bin/bash

# ASG Hair Test App - iOS Screenshot Capture Tool for App Store Connect
# Automates capturing high-resolution App Store screenshots from iOS Simulators or Devices.

OUTPUT_DIR="./appstore_assets"
DIR_6_5="$OUTPUT_DIR/6.5_inch_1242x2688"
DIR_6_7="$OUTPUT_DIR/6.7_inch_1284x2778"

mkdir -p "$OUTPUT_DIR"
mkdir -p "$DIR_6_5"
mkdir -p "$DIR_6_7"

echo "========================================================"
echo "    ASG Hair Test App - iOS Screenshot Capture Tool"
echo "========================================================"
echo ""

# Check Xcode CLI tools availability
if ! command -v xcrun &> /dev/null; then
    echo "ERROR: 'xcrun' tool could not be found. Please ensure Xcode and Xcode Command Line Tools are installed."
    exit 1
fi

# Detect booted simulator
BOOTED_SIMULATOR=$(xcrun simctl list devices | grep -E "Booted" | head -n 1)

if [ -z "$BOOTED_SIMULATOR" ]; then
    echo "WARNING: No active booted iOS Simulator found."
    echo "Please boot an iOS Simulator via Xcode or terminal."
    read -p "Press [ENTER] after starting your simulator..."
    
    BOOTED_SIMULATOR=$(xcrun simctl list devices | grep -E "Booted" | head -n 1)
    if [ -z "$BOOTED_SIMULATOR" ]; then
        echo "ERROR: Still no booted simulator detected. Exiting."
        exit 1
    fi
fi

echo "Connected Booted Simulator:"
echo "  $BOOTED_SIMULATOR"
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
    read -p "Navigate to [$SCREEN_NAME] on simulator. Press [ENTER] to capture (or 's' to skip): " choice
    if [ "$choice" == "s" ] || [ "$choice" == "S" ]; then
        echo "Skipped $SCREEN_NAME."
        echo ""
        continue
    fi

    RAW_FILE="$OUTPUT_DIR/$SCREEN_NAME.png"
    FILE_6_5="$DIR_6_5/$SCREEN_NAME.png"
    FILE_6_7="$DIR_6_7/$SCREEN_NAME.png"

    echo "Capturing iOS Simulator screen..."
    xcrun simctl io booted screenshot "$RAW_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Processing App Store Connect dimensions..."
        sips -z 2688 1242 "$RAW_FILE" --out "$FILE_6_5" > /dev/null
        sips -z 2778 1284 "$RAW_FILE" --out "$FILE_6_7" > /dev/null

        echo "Saved:"
        echo "  - 6.5\" Display (1242 x 2688 px): $FILE_6_5"
        echo "  - 6.7\" Display (1284 x 2778 px): $FILE_6_7"
    else
        echo "ERROR: Failed to capture screenshot for $SCREEN_NAME."
    fi
    echo "----------------------------------------"
done

echo ""
echo "Done! Formatted App Store screenshots are saved in:"
echo "  - $DIR_6_5 (1242 x 2688 px)"
echo "  - $DIR_6_7 (1284 x 2778 px)"
