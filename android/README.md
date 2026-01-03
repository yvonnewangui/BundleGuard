# BundleGuard Android Collector App

This is the Android companion app for BundleGuard - an independent witness for mobile data usage.

## Features

- **App-by-App Usage Tracking**: Uses Android's NetworkStatsManager to track data usage per app
- **Background Sync**: Automatically syncs usage data to the dashboard every 15 minutes
- **QR Code Pairing**: Scan a QR code from the web dashboard to link your device
- **Usage Notifications**: Get alerts about unusual data spikes (optional)

## Requirements

- Android 6.0 (API 23) or higher
- Usage Access permission enabled
- Internet connection for syncing

## Building the App

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- Android SDK with API 34

### Build Steps

1. Open the `android` folder in Android Studio
2. Wait for Gradle sync to complete
3. Select `app` configuration
4. Click Run or build APK:
   - Debug: `./gradlew assembleDebug`
   - Release: `./gradlew assembleRelease`

### Signing for Release

Create a `keystore.properties` file in the `android` folder:

```properties
storeFile=/path/to/your/keystore.jks
storePassword=your_store_password
keyAlias=your_key_alias
keyPassword=your_key_password
```

Then run:
```bash
./gradlew assembleRelease
```

## Architecture

```
app/src/main/java/com/bundleguard/app/
├── BundleGuardApp.kt        # Application class
├── data/
│   ├── api/                 # Retrofit API client
│   ├── model/               # Data models
│   ├── PreferencesManager   # DataStore preferences
│   ├── UsageRepository      # Data operations
│   └── UsageStatsCollector  # NetworkStats integration
├── receiver/
│   └── BootReceiver         # Boot completed receiver
├── ui/
│   ├── MainActivity         # Main activity with navigation
│   ├── welcome/             # Welcome screen
│   ├── permissions/         # Permissions setup
│   ├── pairing/             # QR scanning and pairing
│   └── status/              # Main status dashboard
├── util/
│   ├── FormatUtils          # Formatting helpers
│   └── PermissionHelper     # Permission utilities
└── worker/
    └── UsageSyncWorker      # Background sync worker
```

## Configuration

### API Base URL

Update the base URL in `ApiClient.kt`:

```kotlin
private const val BASE_URL = "https://your-dashboard-url.com/api/"
```

### Dashboard URL

Update the dashboard URL in `StatusFragment.kt`:

```kotlin
private val dashboardUrl = "https://your-dashboard-url.com"
```

## Permissions

The app requires:

- `PACKAGE_USAGE_STATS` - To access app usage statistics
- `INTERNET` - To sync data with the dashboard
- `RECEIVE_BOOT_COMPLETED` - To restart sync after device reboot
- `POST_NOTIFICATIONS` (Android 13+) - For sync status notifications
- `CAMERA` - For QR code scanning

## Data Privacy

- All usage data is collected locally on the device
- Data is only synced to the dashboard you pair with
- No data is shared with third parties
- Usage statistics are aggregated (hourly/daily)

## Testing

Run unit tests:
```bash
./gradlew test
```

Run instrumented tests:
```bash
./gradlew connectedAndroidTest
```

## Troubleshooting

### "Usage Access" not showing in settings
Some devices require additional steps to enable Usage Access. Try:
1. Go to Settings > Apps > BundleGuard > Permissions
2. Look for "Usage Access" or "Special access"

### Sync not working
1. Check internet connection
2. Verify the dashboard URL is correct
3. Check if the device is still paired (look for device ID in status)

### High battery usage
The app syncs every 15 minutes by default. You can increase the interval in settings if needed.

## License

Copyright 2024 BundleGuard
