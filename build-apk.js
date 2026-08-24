#!/usr/bin/env node

/**
 * CloudNova APK Build & Download Script
 * This script handles the complete APK build process and uploads to backend
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'FrontEnd');
const ANDROID_DIR = path.join(FRONTEND_DIR, 'android');
const APK_OUTPUT_DIR = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug');
const BACKEND_DIR = path.join(PROJECT_ROOT, 'Backend');

console.log('🔧 CloudNova APK Build Process Started\n');

// Step 1: Clean previous builds
console.log('📦 Step 1: Cleaning previous builds...');
try {
  execSync('gradlew clean', { cwd: ANDROID_DIR, stdio: 'inherit' });
  console.log('✅ Clean completed\n');
} catch (error) {
  console.error('❌ Clean failed:', error.message);
}

// Step 2: Build Debug APK
console.log('🔨 Step 2: Building signed Debug APK (this may take 5-15 minutes)...');
try {
  execSync('gradlew assembleDebug', { cwd: ANDROID_DIR, stdio: 'inherit' });
  console.log('✅ Signed Debug APK built successfully\n');
} catch (error) {
  console.error('❌ APK build failed:', error.message);
  process.exit(1);
}

// Step 3: Find and copy APK
console.log('📂 Step 3: Locating APK file...');
const apkFiles = fs.readdirSync(APK_OUTPUT_DIR).filter(f => f.endsWith('.apk'));

if (apkFiles.length === 0) {
  console.error('❌ No APK file found');
  process.exit(1);
}

const apkFile = apkFiles[0];
const apkPath = path.join(APK_OUTPUT_DIR, apkFile);
const apkSize = (fs.statSync(apkPath).size / 1024 / 1024).toFixed(2);
console.log(`✅ Found: ${apkFile} (${apkSize} MB)\n`);

// Step 4: Copy to Backend
console.log('📤 Step 4: Copying APK to Backend...');
const backendApkPath = path.join(BACKEND_DIR, 'app-release.apk');
fs.copyFileSync(apkPath, backendApkPath);
console.log(`✅ Copied to: ${backendApkPath}\n`);

// Step 5: Generate QR Code URL
console.log('🔗 Step 5: APK Download Information\n');
console.log('=====================================');
console.log('📱 APK Details:');
console.log(`   File: CloudNova.apk`);
console.log(`   Size: ${apkSize} MB`);
console.log(`   Path: ${backendApkPath}`);
console.log(`   Download URL: http://localhost:5000/api/download/apk`);
console.log(`   Production URL: https://clooudnova.up.railway.app/api/download/apk`);
console.log('=====================================\n');

console.log('✅ APK Build Process Completed Successfully!\n');
console.log('Next Steps:');
console.log('1. Restart the backend server to serve the new APK');
console.log('2. Test download buttons on Home and Profile pages');
console.log('3. Install APK on Android device: adb install app-release.apk');
console.log('4. Test mobile app functionality');
console.log('5. For production, build release APK: gradlew assembleRelease\n');
