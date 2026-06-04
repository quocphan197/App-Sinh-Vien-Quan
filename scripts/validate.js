/**
 * Quick syntax check for deployable JS entry (no npm install required).
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const files = [
  'js/app.js',
  'js/splash.js',
  'js/database.js',
  'js/utils.js'
];

let failed = false;

for (const rel of files) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`Missing: ${rel}`);
    failed = true;
    continue;
  }
  try {
    execSync(`node --check "${full}"`, { stdio: 'pipe' });
    console.log(`OK  ${rel}`);
  } catch (e) {
    console.error(`FAIL ${rel}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('\nAll core files passed syntax check.');
