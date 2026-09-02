const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontendBuild = path.join(root, '..', 'FrontEnd', 'build');
const buildIndex = path.join(frontendBuild, 'index.html');
const frontendSrc = path.join(root, '..', 'FrontEnd', 'src');

const needsRebuild = () => {
  if (!fs.existsSync(buildIndex)) return true;

  const buildTime = fs.statSync(buildIndex).mtimeMs;
  let newestSourceTime = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const fileTime = fs.statSync(fullPath).mtimeMs;
        if (fileTime > newestSourceTime) newestSourceTime = fileTime;
      }
    }
  };

  if (fs.existsSync(frontendSrc)) walk(frontendSrc);
  return newestSourceTime > buildTime;
};

if (needsRebuild()) {
  console.log('Frontend build is stale or missing; generating it now...');
  const { spawnSync } = require('child_process');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: path.join(root, '..'),
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    console.error('Build generation failed.');
    process.exit(result.status || 1);
  }
}
