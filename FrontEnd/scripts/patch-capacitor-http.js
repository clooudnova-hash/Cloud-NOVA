const fs = require('fs');
const path = require('path');

const pluginRoot = path.join(__dirname, '..', 'node_modules', '@capacitor-community', 'http', 'android');
const gradleFile = path.join(pluginRoot, 'build.gradle');
const manifestFile = path.join(pluginRoot, 'src', 'main', 'AndroidManifest.xml');

if (fs.existsSync(gradleFile)) {
  const gradle = fs.readFileSync(gradleFile, 'utf8');
  if (!gradle.includes('namespace "com.getcapacitor.community.http"')) {
    fs.writeFileSync(gradleFile, gradle.replace('android {', 'android {\n    namespace "com.getcapacitor.community.http"'), 'utf8');
  }
}

if (fs.existsSync(manifestFile)) {
  const manifest = fs.readFileSync(manifestFile, 'utf8');
  fs.writeFileSync(manifestFile, manifest.replace(/\s+package="[^"]+"/, ''), 'utf8');
}
