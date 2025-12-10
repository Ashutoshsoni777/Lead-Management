#!/usr/bin/env node

/**
 * Verification Script for Lead Management System
 * Run this to check if all files are in place
 */

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

// Define expected files
const requiredFiles = {
  'Root': [
    'package.json',
    'README.md',
    'SETUP.md',
    'TESTING.md',
    'QUICKSTART.md',
    'INDEX.md',
    '.gitignore',
    'setup.ps1',
  ],
  'Backend': [
    'backend/package.json',
    'backend/index.js',
    'backend/database.js',
    'backend/seed.js',
    'backend/.env',
    'backend/controllers/leadController.js',
    'backend/controllers/userController.js',
    'backend/models/User.js',
    'backend/models/Lead.js',
    'backend/models/LeadActivity.js',
    'backend/routes/index.js',
    'backend/utils/validators.js',
    'backend/utils/duplicateDetection.js',
  ],
  'Frontend': [
    'frontend/package.json',
    'frontend/next.config.js',
    'frontend/tailwind.config.js',
    'frontend/postcss.config.js',
    'frontend/.env.local',
    'frontend/src/lib/api.js',
    'frontend/src/pages/index.js',
    'frontend/src/pages/_app.js',
    'frontend/src/pages/_document.js',
    'frontend/src/pages/leads/index.js',
    'frontend/src/pages/leads/new.js',
    'frontend/src/pages/leads/[id].js',
    'frontend/src/styles/globals.css',
  ],
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  return fs.existsSync(fullPath);
}

function verify() {
  log('\n🔍 Verifying Lead Management System Installation...\n', 'cyan');

  let allGood = true;
  let totalFiles = 0;
  let foundFiles = 0;

  for (const [section, files] of Object.entries(requiredFiles)) {
    log(`\n${section}:`, 'bold');
    
    for (const file of files) {
      totalFiles++;
      const exists = checkFile(file);
      foundFiles += exists ? 1 : 0;
      
      const status = exists ? '✓' : '✗';
      const statusColor = exists ? 'green' : 'red';
      log(`  ${colors[statusColor]}${status}${colors.reset} ${file}`);
      
      if (!exists) {
        allGood = false;
      }
    }
  }

  log('\n' + '='.repeat(50), 'cyan');
  log(`Files Found: ${foundFiles}/${totalFiles}`, foundFiles === totalFiles ? 'green' : 'yellow');
  log('='.repeat(50) + '\n', 'cyan');

  if (allGood) {
    log('✅ All required files are present!', 'green');
    log('\nNext steps:', 'bold');
    log('  1. cd backend && npm install');
    log('  2. cd ../frontend && npm install');
    log('  3. cd ../backend && npm run dev');
    log('  4. cd ../frontend && npm run dev');
    log('  5. Open http://localhost:3000');
    log('\nOr run: npm run setup', 'cyan');
  } else {
    log('⚠️  Some files are missing. Please check the installation.', 'red');
    log('\nRun: npm run setup', 'yellow');
  }

  log('');
}

// Run verification
verify();
