# ParcelPilotApp

This React Native app is the mobile frontend for the ParcelPilot project. It currently uses React Navigation, gesture handling, safe-area support, and screen management for Android and iOS development.

## Prerequisites

Before running the app, make sure you have:

- Node.js and npm
- Android Studio with an Android SDK
- A running emulator, or a physical Android device connected via USB
- Java Development Kit (JDK) configured for Android builds

## Install dependencies

From the project root:

```powershell
npm install
```

If you are using a fresh clone, you may also need to install the Android-specific dependencies for the native modules:

```powershell
npx react-native doctor
```

## Start Metro

Open a terminal in the project folder and start Metro:

```powershell
npm start
```

If port 8081 is busy, React Native may ask to use another port. That is fine.

## Run on an Android emulator

1. Open Android Studio.
2. Start an emulator from Device Manager.
3. Verify it is available:

```powershell
adb devices
```

4. In a new terminal, run:

```powershell
npx react-native run-android
```

If you are on Windows and the build fails with a long-path error such as "Filename longer than 260 characters", use a short path workaround once:

```powershell
cmd /c mklink /J C:\parcelpilot "D:\Projects\ParcelPilot\application\ParcelPilotApp"
```

Then run:

```powershell
Set-Location C:\parcelpilot
npx react-native run-android
```

## Run on a physical Android device

1. Enable Developer Options and USB debugging on the phone.
2. Connect the phone to your computer with a USB cable.
3. Confirm the device is detected:

```powershell
adb devices
```

4. Run the app:

```powershell
npx react-native run-android
```

If the device is not detected, try:

```powershell
adb kill-server
adb start-server
adb devices
```

## Useful commands

```powershell
# Start Metro only
npm start

# Run app on Android
npx react-native run-android

# Clean Android build cache
cd android
./gradlew clean
cd ..
```

## Notes for this project

This app includes native modules such as:

- react-native-gesture-handler
- react-native-safe-area-context
- react-native-screens

Those packages may require a clean rebuild if you change dependencies or switch environments.

## Troubleshooting

If Metro does not connect, restart the dev server and make sure the emulator/device is running.

If Android build fails, check:

- ADB sees the emulator or device
- Java and Android SDK are installed correctly
- The Windows long-path workaround is being used if the project path is very long
