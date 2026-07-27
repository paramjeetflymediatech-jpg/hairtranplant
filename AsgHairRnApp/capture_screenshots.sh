#!/bin/bash

# ASG Hair Transplant App - Screenshot Capture Tool for Google Play Store
# This script automates capturing screenshots from a connected Android device/emulator.

# Directory to save screenshots
OUTPUT_DIR="./playstore_assets"
mkdir -p "$OUTPUT_DIR"

echo "========================================================"
echo "    ASG Hair Transplant App Screenshot Capture Tool"
echo "========================================================"
echo ""

# Check if adb is installed and available
if ! command -v adb &> /dev/null; then
    echo "ERROR: 'adb' tool could not be found. Please ensure Android SDK Platform Tools are installed and in your PATH."
    exit 1
fi

# Check for connected devices
DEVICE_COUNT=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "ERROR: No connected Android devices or emulators found."
    echo "Please connect a device or start an emulator, ensure USB debugging is enabled, and try again."
    exit 1
fi

echo "Connected devices:"
adb devices
echo ""

# Standard Play Store screenshot sizes (e.g. 1080x1920 or similar 16:9 vertical)
echo "Tips: Make sure the app is open on the screen you wish to capture."
echo "Screenshots will be saved in: $OUTPUT_DIR"
echo ""

SCREENS=(
    "1_welcome_screen"
    "2_hair_test_screen"
    "3_history_screen"
    "4_patient_portal_screen"
    "5_explore_clinic_screen"
)

for SCREEN_NAME in "${SCREENS[@]}"; do
    read -p "Prepare the app on the screen for [$SCREEN_NAME]. Press [ENTER] to capture (or type 's' to skip): " choice
    if [ "$choice" == "s" ] || [ "$choice" == "S" ]; then
        echo "Skipped $SCREEN_NAME."
        echo ""
        continue
    fi

    TEMP_FILE="/sdcard/temp_screenshot.png"
    FINAL_FILE="$OUTPUT_DIR/$SCREEN_NAME.png"

    echo "Capturing screen..."
    adb shell screencap -p "$TEMP_FILE"
    
    echo "Downloading screenshot..."
    adb pull "$TEMP_FILE" "$FINAL_FILE"
    
    echo "Cleaning up temp files on device..."
    adb shell rm "$TEMP_FILE"

    echo "Saved to: $FINAL_FILE"
    echo "----------------------------------------"
done

echo ""
echo "Done! Screenshots are ready in the '$OUTPUT_DIR' directory."
echo "Google Play Store requires screenshots to be in PNG/JPEG format with a 9:16 aspect ratio (e.g. 1080x1920)."
echo "Your device's native resolution screenshots are saved. They are ready to be uploaded to Google Play Console!"
