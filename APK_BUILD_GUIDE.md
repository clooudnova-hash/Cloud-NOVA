# CloudNova APK Build Guide

## Overview
This guide will help you build the CloudNova Android APK with all necessary configurations and data synchronization.

## Prerequisites
- Node.js (v18+)
- Java Development Kit (JDK 11+)
- Android SDK
- Gradle (bundled with Android SDK)
- Git

## Step-by-Step Build Instructions

### 1. Build Frontend Production Bundle
```bash
cd FrontEnd
npm install
npm run build
```

### 2. Update Capacitor Configuration
The `capacitor.config.ts` has been updated to:
- Use the production build folder (`build/` instead of `remote-shell/`)
- Point to Railway production URL: `https://clooudnova.up.railway.app`
- Enable secure HTTPS for Android

### 3. Sync Capacitor to Android
```bash
cd FrontEnd
npx cap sync android
```

### 4. Build Release APK
```bash
cd FrontEnd/android
./gradlew assembleRelease
```

### 5. Build Debug APK (for testing)
```bash
cd FrontEnd/android
./gradlew assembleDebug
```

## APK Output Locations

**Release APK:**
```
FrontEnd/android/app/build/outputs/apk/release/app-release.apk
```

**Debug APK:**
```
FrontEnd/android/app/build/outputs/apk/debug/app-debug.apk
```

## Signing Release APK (Production)

### Generate Signing Key
```bash
keytool -genkey -v -keystore CloudNova.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias cloudnova
```

### Configure Gradle Signing
Edit `FrontEnd/android/app/build.gradle` and add:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../CloudNova.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build Signed Release
```bash
cd FrontEnd/android
set KEYSTORE_PASSWORD=your_password
set KEY_ALIAS=cloudnova
set KEY_PASSWORD=your_password
./gradlew assembleRelease
```

## Features Included in APK

✅ **Web-to-App Sync:**
- All data syncs with cloud backend at `https://clooudnova.up.railway.app`
- Existing 150 users' data preserved
- Real-time balance and mining updates
- Same login credentials as web version

✅ **Download Buttons:**
- "📲 Download APK" button fixed in Home page (right corner)
- "📲 Download Cloud Nova APK" button in Profile page
- Both buttons download directly from server

✅ **Security:**
- HTTPS-only connection to backend
- JWT token-based authentication
- No mixed content (Android security requirement)
- Secure data transmission

✅ **Features:**
- Full mining dashboard
- Real-time BTC prices
- Mining income collection
- Wallet management
- VIP membership levels
- Referral system
- Team bonuses
- Task rewards

## Testing APK on Device

### Install on Android Phone
```bash
adb install FrontEnd/android/app/build/outputs/apk/debug/app-debug.apk
```

### Enable USB Debugging
1. Go to Settings > About Phone
2. Tap Build Number 7 times
3. Go to Settings > Developer Options
4. Enable USB Debugging

## Troubleshooting

### Build Fails with "Module not found"
```bash
cd FrontEnd
npm install
```

### Gradle Build Error
```bash
cd FrontEnd/android
./gradlew clean
./gradlew assembleDebug
```

### APK Won't Load Web Content
- Verify `capacitor.config.ts` has correct URL
- Check `server.androidScheme` is set to 'https'
- Ensure firewall allows HTTPS (port 443)

## Production Deployment

### 1. Upload APK to GitHub Releases
```bash
git tag -a v1.0.0 -m "CloudNova Release v1.0.0"
git push origin v1.0.0
# Upload APK file to GitHub release
```

### 2. Update APK Download Link
The download buttons now point to: `/api/download/apk`
- Place the built APK in `Backend/app-release.apk`
- Server will automatically serve it

### 3. Set Environment Variables
```
PORT=5000
REACT_APP_API_URL=https://clooudnova.up.railway.app
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
```

## Important Notes

⚠️ **Data Preservation:**
- All 150 existing users' data is preserved
- Same user accounts work on both web and APK
- Mining contracts and wallet balance sync in real-time

⚠️ **Backend Compatibility:**
- APK connects to production backend at Railway
- Ensure backend is running and accessible
- No local database needed on device (uses backend)

⚠️ **Version Updates:**
- Every APK rebuild increments version
- Update `FrontEnd/android/app/build.gradle`'s `versionCode` and `versionName`

## Monitoring & Support

- Backend logs available at Railway dashboard
- Real-time user activity through `/api/public/stats`
- Admin panel for platform monitoring

---

**Status:** ✅ Ready to build
**Platform:** Android 8.0+ (API Level 26+)
**Size:** ~45MB (compressed)
**Build Time:** ~5-10 minutes

