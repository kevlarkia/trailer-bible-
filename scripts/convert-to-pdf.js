#!/usr/bin/env node

/**
 * Script to convert markdown files to PDF using pandoc
 * Usage: node scripts/convert-to-pdf.js [input.md] [output.pdf]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

// Default files
const inputFile = args[0] || 'PSYCHOGRAPH_CASE_FILE_COMPLETE_v2.md';
const outputFile = args[1] || 'PSYCHOGRAPH_CASE_FILE_v2.pdf';

// Validate input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file '${inputFile}' not found.`);
  process.exit(1);
}

// Check if pandoc is installed
try {
  execSync('pandoc --version', { stdio: 'pipe' });
} catch (error) {
  console.error('Error: pandoc is not installed.');
  console.error('Please install pandoc: https://pandoc.org/installing.html');
  process.exit(1);
}

// Run pandoc conversion
try {
  console.log(`Converting ${inputFile} to ${outputFile}...`);
  execSync(`pandoc "${inputFile}" -o "${outputFile}"`, { stdio: 'inherit' });
  console.log(`✓ Successfully created ${outputFile}`);
  
  // Check output file size
  const stats = fs.statSync(outputFile);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`  File size: ${fileSizeInKB} KB`);
} catch (error) {
  console.error('Error during conversion:', error.message);
  process.exit(1);
}
