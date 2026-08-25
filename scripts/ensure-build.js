const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontendBuild = path.join(root, '..', 'FrontEnd', 'build');
const buildIndex = path.join(frontendBuild, 'index.html');

if (!fs.existsSync(buildIndex)) {
  console.log('Frontend build missing; generating it now...');
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
