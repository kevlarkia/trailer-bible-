#!/usr/bin/env node

/**
 * Script to convert markdown files to PDF using pandoc
 * Usage: node scripts/convert-to-pdf.js [input.md] [output.pdf]
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

// Default files
const defaultInputFile = 'PSYCHOGRAPH_CASE_FILE_COMPLETE_v2.md';
const defaultOutputFile = 'PSYCHOGRAPH_CASE_FILE_v2.pdf';

// Resolve and sanitize file paths
const inputFile = path.resolve(args[0] || defaultInputFile);
const outputFile = path.resolve(args[1] || defaultOutputFile);

// Validate that paths are safe (no path traversal outside project)
const projectRoot = path.resolve(__dirname, '..');
if (!inputFile.startsWith(projectRoot) || !outputFile.startsWith(projectRoot)) {
  console.error('Error: File paths must be within the project directory.');
  process.exit(1);
}

// Validate input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file '${path.basename(inputFile)}' not found.`);
  process.exit(1);
}

// Validate input file is a markdown file
if (!inputFile.endsWith('.md')) {
  console.error('Error: Input file must be a markdown (.md) file.');
  process.exit(1);
}

// Validate output file has .pdf extension
if (!outputFile.endsWith('.pdf')) {
  console.error('Error: Output file must have .pdf extension.');
  process.exit(1);
}

// Check if pandoc is installed
const pandocCheck = spawnSync('pandoc', ['--version'], { stdio: 'pipe' });
if (pandocCheck.error || pandocCheck.status !== 0) {
  console.error('Error: pandoc is not installed.');
  console.error('Please install pandoc: https://pandoc.org/installing.html');
  process.exit(1);
}

// Run pandoc conversion using spawn for safe command execution
try {
  console.log(`Converting ${path.basename(inputFile)} to ${path.basename(outputFile)}...`);
  const result = spawnSync('pandoc', [inputFile, '-o', outputFile], { stdio: 'inherit' });
  
  if (result.status !== 0) {
    console.error('Error during conversion');
    process.exit(1);
  }
  
  console.log(`✓ Successfully created ${path.basename(outputFile)}`);
  
  // Check output file size
  const stats = fs.statSync(outputFile);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`  File size: ${fileSizeInKB} KB`);
} catch (error) {
  console.error('Error during conversion:', error.message);
  process.exit(1);
}
