# GoatedScanner

<!-- BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.86-blue?logo=react" />
  <img src="https://img.shields.io/badge/Expo-SDK%2057-black?logo=expo" />
  <img src="https://img.shields.io/badge/BLE-Bluetooth%205-blue" />
  <img src="https://img.shields.io/github/downloads/chotathor/GoatedScanner/total?label=downloads" />
  <img src="https://img.shields.io/github/license/chotathor/GoatedScanner" />
</p>

<p align="center"><b>Advanced BLE Scanner built with React Native & Expo</b></p>

---

## Download

<a href="https://github.com/chotathor/GoatedScanner/releases/download/v1.0.0/GoatedScanner-v1.0.0.apk">
  <img src="https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android" />
</a>

## Features

- Scan for nearby Bluetooth Low Energy (BLE) devices
- Real-time device discovery with signal strength
- Display device name, MAC address, and RSSI
- Modern Material Design 3 UI
- Dark and light theme support
- Auto-stop scanning to save battery

## Screenshots

*Coming soon*

## Tech Stack

- React Native 0.86
- Expo SDK 57
- react-native-ble-manager
- Material Design 3

## Build

```bash
npm install
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

## License

MIT
